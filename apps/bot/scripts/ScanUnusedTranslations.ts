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
  const selectors = new Set<string>();
  const regex = /\$\.([a-zA-Z0-9_\-]+(?:\.[a-zA-Z0-9_\-]+)*)/g;

  files.forEach((f) => {
    const content = fs.readFileSync(f, "utf-8");
    let match;
    while ((match = regex.exec(content)) !== null) {
      selectors.add(match[1]);
    }
  });

  return selectors;
}

function findUnused(allKeys: string[], usedSelectors: Set<string>) {
  const selectors = Array.from(usedSelectors);
  return allKeys.filter((key) => {
    if (CONFIG.ignoredNamespaces.some((ns) => key.startsWith(ns + "."))) return false;
    for (const sel of selectors) {
      if (key === sel) return false;
      if (key.endsWith("." + sel)) return false;
      if (key.includes("." + sel + ".") || key.startsWith(sel + ".")) return false;
    }
    return true;
  });
}

async function processLanguage(lang: string, selectors: Set<string>) {
  console.log(chalk.bold.magenta(`\n🌍 Checking language: ${lang}`));
  const langDir = path.join(CONFIG.localesRoot, lang);

  const nsMap = getNamespaceMap(langDir);
  const keys = loadJsonKeys(nsMap);
  log("info", `Loaded ${keys.length} keys.`);

  const unused = findUnused(keys, selectors);

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
  const selectors = scanSelectorUsage();
  log("success", `Found ${selectors.size} unique selectors in code.`);

  // 2. Find all language folders
  const languages = fs.readdirSync(CONFIG.localesRoot).filter((f) => {
    return fs.statSync(path.join(CONFIG.localesRoot, f)).isDirectory();
  });

  console.log(chalk.blue(`Found ${languages.length} languages to check: ${languages.join(", ")}`));

  let totalIssues = 0;

  // 3. Process each language
  for (const lang of languages) {
    const hasIssues = await processLanguage(lang, selectors);
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
