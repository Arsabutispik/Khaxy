import fs from "fs";
import path from "path";
import chalk from "chalk";

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // Point to the ROOT locales folder (containing en-GB, fr, etc.)
  localesRoot: path.join(process.cwd(), "locales"),
  srcDir: path.join(process.cwd(), "src"),
  srcExtensions: [".ts", ".tsx", ".js", ".jsx"],
  // Namespaces to ignore (will not report unused keys in these files)
  ignoredNamespaces: ["locales", "system-channel-flags", "guild-features"],
};

// ============================================================================
// LOGGING & HELPERS
// ============================================================================

const isCI = process.argv.includes("--ci") || process.env.CI === "true";
const isFixMode = process.argv.includes("--fix");
const isVerbose = process.argv.includes("--verbose");

function log(level: "info" | "error" | "warn" | "success", message: string) {
  if (isCI && (level === "error" || level === "warn")) {
    console.log(`::${level}::${message}`);
    return;
  }
  const colors = { info: chalk.blue, success: chalk.green, warn: chalk.yellow, error: chalk.red };
  const icons = { info: "ℹ", success: "✔", warn: "⚠", error: "✖" };
  console.log(`${icons[level]} ${colors[level](message)}`);
}

function getAllFiles(dir: string, exts: string[], fileList: string[] = []) {
  if (!fs.existsSync(dir)) return fileList;
  fs.readdirSync(dir).forEach((file) => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, exts, fileList);
    } else if (exts.includes(path.extname(file))) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

function flattenKeys(obj: any, prefix = ""): string[] {
  let keys: string[] = [];
  for (const key in obj) {
    if (typeof obj[key] === "object" && obj[key] !== null) {
      keys = keys.concat(flattenKeys(obj[key], prefix + key + "."));
    } else {
      keys.push(prefix + key);
    }
  }
  return keys;
}

function deleteNestedKey(obj: any, keyPath: string) {
  const parts = keyPath.split(".");
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]]) return;
    current = current[parts[i]];
  }
  delete current[parts[parts.length - 1]];
}

function cleanEmptyObjects(obj: any) {
  for (const key in obj) {
    if (typeof obj[key] === "object" && obj[key] !== null) {
      cleanEmptyObjects(obj[key]);
      if (Object.keys(obj[key]).length === 0) {
        delete obj[key];
      }
    }
  }
}

// ============================================================================
// CORE LOGIC
// ============================================================================

// Returns Map<Namespace, FilePath> for a specific language directory
function getNamespaceMap(languageDir: string) {
  const files = getAllFiles(languageDir, [".json"]);
  const map = new Map<string, string>();
  files.forEach((f) => {
    // Namespace matches file structure relative to language folder
    const namespace = path.relative(languageDir, f).replace(".json", "").replace(/[\\/]/g, ".");
    map.set(namespace, f);
  });
  return map;
}

function loadJsonKeys(namespaceMap: Map<string, string>) {
  let keys: string[] = [];
  Array.from(namespaceMap.keys()).forEach((namespace) => {
    const filePath = namespaceMap.get(namespace);
    if (!filePath) return;
    try {
      const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      keys = keys.concat(flattenKeys(content, namespace + "."));
    } catch (e) {
      log("error", `Failed to parse ${filePath}`);
    }
  });
  return keys;
}

function scanSelectorUsage() {
  const files = getAllFiles(CONFIG.srcDir, CONFIG.srcExtensions);
  if (isVerbose) console.log(chalk.gray(`   Scanning ${files.length} source files...`));
  const exactSelectors = new Set<string>();
  const prefixSelectors = new Set<string>();

  let foundRootDynamic = false;

  files.forEach((f) => {
    let content = fs.readFileSync(f, "utf-8");
    const fileName = path.basename(f);

    // Strip comments to avoid false positives
    content = content.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, "$1");

    // Map variable name -> base path (namespace.keyPrefix)
    const tVarBasePaths = new Map<string, string>();

    // Find all getFixedT calls and track the variable name with its base path
    // Pattern: getFixedT(lang, "namespace", "keyPrefix") or getFixedT(lang, "namespace") or getFixedT(lang, null, "keyPrefix")
    // Supports: const t = foo.bar.getFixedT(...) or const t = i18next.getFixedT(...)
    const fixedTRegex =
      /(?:const|let|var)\s+(\w+)\s*=\s*[\w.]+\.getFixedT\s*\(\s*[^,]+,\s*(?:"([^"]+)"|'([^']+)'|null)\s*(?:,\s*(?:"([^"]+)"|'([^']+)'|null))?\s*\)/g;

    let match;
    while ((match = fixedTRegex.exec(content)) !== null) {
      const varName = match[1];
      const namespace = match[2] || match[3] || "";
      const keyPrefix = match[4] || match[5] || "";

      let basePath = "";
      if (namespace) basePath = namespace;
      if (keyPrefix) basePath = basePath ? `${basePath}.${keyPrefix}` : keyPrefix;

      tVarBasePaths.set(varName, basePath);
      if (isVerbose) console.log(chalk.gray(`   Found getFixedT: ${varName} -> "${basePath}" in ${fileName}`));
    }

    // Also find TFunction type annotations for function parameters
    // Pattern: t: TFunction<"namespace", "keyPrefix"> or t: TFunction<"namespace">
    const tFunctionTypeRegex = /(\w+)\s*:\s*TFunction\s*<\s*["']([^"']+)["'](?:\s*,\s*["']([^"']+)["'])?\s*>/g;

    while ((match = tFunctionTypeRegex.exec(content)) !== null) {
      const varName = match[1];
      const namespace = match[2] || "";
      const keyPrefix = match[3] || "";

      let basePath = "";
      if (namespace) basePath = namespace;
      if (keyPrefix) basePath = basePath ? `${basePath}.${keyPrefix}` : keyPrefix;

      // Only add if not already set (getFixedT takes precedence)
      if (!tVarBasePaths.has(varName)) {
        tVarBasePaths.set(varName, basePath);
        if (isVerbose)
          console.log(chalk.gray(`   Found TFunction type: ${varName} -> "${basePath}" in ${path.basename(f)}`));
      }
    }

    // Now scan for selector usages: t(($) => $.foo.bar) or t($ => $.foo[dynamic])
    // We need to find t(...) calls and extract the selector path

    // Pattern for exact selectors: $.foo.bar.baz (no bracket at end)
    const selectorCallRegex = /(\w+)\s*\(\s*\(?\s*\$\s*\)?\s*=>\s*\$\.([a-zA-Z0-9_\-.]+)(?:\s*[,)])/g;

    while ((match = selectorCallRegex.exec(content)) !== null) {
      const varName = match[1];
      const selectorPath = match[2];
      const basePath = tVarBasePaths.get(varName) || "";
      const fullPath = basePath ? `${basePath}.${selectorPath}` : selectorPath;
      exactSelectors.add(fullPath);
    }

    // Pattern for dynamic selectors: $.foo[dynamic] or $.foo.bar[dynamic]
    const dynamicSelectorRegex = /(\w+)\s*\(\s*\(?\s*\$\s*\)?\s*=>\s*\$\.([a-zA-Z0-9_\-.]+)\s*\[/g;

    while ((match = dynamicSelectorRegex.exec(content)) !== null) {
      const varName = match[1];
      const selectorPath = match[2];
      const basePath = tVarBasePaths.get(varName) || "";
      const fullPath = basePath ? `${basePath}.${selectorPath}` : selectorPath;
      prefixSelectors.add(fullPath);
    }

    // Pattern for root dynamic: $[dynamic] (e.g., t($ => $[key]))
    const rootDynamicSelectorRegex = /(\w+)\s*\(\s*\(?\s*\$\s*\)?\s*=>\s*\$\s*\[/g;

    while ((match = rootDynamicSelectorRegex.exec(content)) !== null) {
      const varName = match[1];
      const basePath = tVarBasePaths.get(varName) || "";
      if (isVerbose)
        console.log(chalk.gray(`   Root dynamic: varName=${varName}, basePath=${basePath} in ${path.basename(f)}`));
      if (basePath) {
        // If there's a base path, treat it as a prefix (all keys under it are used)
        prefixSelectors.add(basePath);
        if (isVerbose) console.log(chalk.green(`   Added prefix from root dynamic: ${basePath}`));
      } else {
        // True root dynamic - dangerous
        foundRootDynamic = true;
        if (isVerbose) console.log(chalk.yellow(`   ⚠️  Root dynamic access '$[' found in ${path.basename(f)}`));
      }
    }
  });

  return { exact: exactSelectors, prefixes: prefixSelectors, foundRootDynamic };
}

function findUnused(
  allKeys: string[],
  usage: { exact: Set<string>; prefixes: Set<string>; foundRootDynamic: boolean },
) {
  // If you use `$[var]`, we technically can't delete ANYTHING safely at the top level.
  // But usually, people want to clean up sub-keys anyway.
  // We will proceed but warn about top-level safety if strict.

  const exact = Array.from(usage.exact);
  const prefixes = Array.from(usage.prefixes);

  return allKeys.filter((key) => {
    // 1. Config Ignore List
    if (CONFIG.ignoredNamespaces.some((ns) => key.startsWith(ns + "."))) return false;

    // 2. Check Dynamic Prefixes (The Fix for your issue)
    // If code has `$.commands[`, then `commands.ban` and `commands.kick` are SAFE.
    for (const prefix of prefixes) {
      if (key === prefix || key.startsWith(prefix + ".")) return false;
    }

    // 3. Check Exact Matches
    // If code has `$.general.welcome`, then `general.welcome` is SAFE.
    for (const sel of exact) {
      if (key === sel) return false;
      // Also protect children: if code uses `$.general`, preserve `general.welcome`
      if (key.startsWith(sel + ".")) return false;
    }

    // If it passed all checks, it is unused.
    return true;
  });
}

async function processLanguage(
  lang: string,
  usage: { exact: Set<string>; prefixes: Set<string>; foundRootDynamic: boolean },
) {
  console.log(chalk.bold.magenta(`\n🌍 Checking language: ${lang}`));
  const langDir = path.join(CONFIG.localesRoot, lang);

  const nsMap = getNamespaceMap(langDir);
  const keys = loadJsonKeys(nsMap);
  log("info", `Loaded ${keys.length} keys.`);

  const unused = findUnused(keys, usage);

  if (unused.length > 0) {
    if (isFixMode) {
      log("info", `Deleting ${unused.length} unused keys in ${lang}...`);
      const keysByNs: Record<string, string[]> = {};
      const namespaces = Array.from(nsMap.keys()).sort((a, b) => b.length - a.length);

      unused.forEach((k) => {
        for (const mapNs of namespaces) {
          if (k.startsWith(mapNs + ".")) {
            if (!keysByNs[mapNs]) keysByNs[mapNs] = [];
            keysByNs[mapNs].push(k.slice(mapNs.length + 1));
            break;
          }
        }
      });

      Object.keys(keysByNs).forEach((ns) => {
        const keysToRemove = keysByNs[ns];
        const filePath = nsMap.get(ns);
        if (!filePath) return;
        try {
          const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));
          keysToRemove.forEach((keyPath) => deleteNestedKey(content, keyPath));
          cleanEmptyObjects(content);
          fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
          console.log(chalk.green(`  ✔ Updated ${ns} (Removed ${keysToRemove.length})`));
        } catch (e) {
          console.log(chalk.red(`  ✖ Failed to update ${ns}`));
        }
      });
    } else {
      console.log(chalk.yellow(`⚠️  Found ${unused.length} unused keys:`));
      const grouped: Record<string, string[]> = {};
      unused.forEach((k) => {
        const ns = k.split(".")[0];
        if (!grouped[ns]) grouped[ns] = [];
        grouped[ns].push(k);
      });
      Object.entries(grouped).forEach(([ns, kList]) => {
        console.log(chalk.cyan(`  ${ns} (${kList.length})`));
        // Uncomment below to see every single key for every language (spammy)
        // kList.forEach((k) => console.log(chalk.red(`    ${k}`)));
      });
      return true; // Returns true if issues found
    }
  } else {
    console.log(chalk.green(`✨ Clean.`));
  }
  return false;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log(chalk.bold("\n🔍 Selector API Unused Key Scanner (All Languages)"));
  if (isFixMode) console.log(chalk.red.bold("🛠️  RUNNING IN FIX MODE"));

  if (!fs.existsSync(CONFIG.localesRoot)) {
    console.log(chalk.red(`Locales directory not found: ${CONFIG.localesRoot}`));
    process.exit(1);
  }

  // 1. Scan Code ONCE (Usage is the same for all languages)
  const usage = scanSelectorUsage();
  log("success", `Found ${usage.exact.size} exact selectors and ${usage.prefixes.size} prefix selectors in code.`);
  if (usage.foundRootDynamic) {
    log("warn", "Root dynamic access '$[' found - some keys may be falsely reported as unused.");
  }

  // 2. Find all language folders
  const languages = fs.readdirSync(CONFIG.localesRoot).filter((f) => {
    return fs.statSync(path.join(CONFIG.localesRoot, f)).isDirectory();
  });

  console.log(chalk.blue(`Found ${languages.length} languages to check: ${languages.join(", ")}`));

  let totalIssues = 0;

  // 3. Process each language
  for (const lang of languages) {
    const hasIssues = await processLanguage(lang, usage);
    if (hasIssues) totalIssues++;
  }

  if (totalIssues > 0 && !isFixMode) {
    console.log(chalk.red.bold(`\n❌ Found unused keys in ${totalIssues} languages.`));
    console.log(chalk.gray("💡 Run with --fix to clean them up automatically."));
    process.exit(1);
  } else {
    console.log(chalk.bold.green(`\n✨ All checks complete.`));
  }
}

main();
