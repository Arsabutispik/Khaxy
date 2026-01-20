import fs from "fs";
import path from "path";
import chalk from "chalk";

// ============================================================================
// Configuration
// ============================================================================

const baseLang = "en-GB";
const localesDir = path.join(process.cwd(), "locales");

// Enable verbose logging with --verbose flag
const isVerbose = process.argv.includes("--verbose") || process.argv.includes("-v");
// GitHub Actions format with --ci flag
const isCI = process.argv.includes("--ci") || process.env.CI === "true";
const shouldFix = process.argv.includes("--fix");
// ============================================================================
// Logging Utilities
// ============================================================================

interface LogOptions {
  level: "info" | "warn" | "error" | "debug" | "success";
  message: string;
  details?: string[];
  file?: string;
  line?: number;
}

function log({ level, message, details, file, line }: LogOptions): void {
  // GitHub Actions annotation format
  if (isCI && (level === "error" || level === "warn")) {
    const annotation = level === "error" ? "::error" : "::warning";
    const location = file ? `file=${file}${line ? `,line=${line}` : ""}` : "";
    console.log(`${annotation}${location ? ` ${location}` : ""}::${message}`);
    return;
  }

  const timestamp = new Date().toISOString();
  const prefix = isVerbose ? `[${timestamp}] ` : "";

  switch (level) {
    case "info":
      console.log(`${prefix}${chalk.blue("ℹ")} ${message}`);
      break;
    case "warn":
      console.warn(`${prefix}${chalk.yellow("⚠")} ${message}`);
      break;
    case "error":
      console.error(`${prefix}${chalk.red("✖")} ${message}`);
      break;
    case "debug":
      if (isVerbose) {
        console.log(`${prefix}${chalk.gray("⚙")} ${chalk.gray(message)}`);
      }
      break;
    case "success":
      console.log(`${prefix}${chalk.green("✔")} ${message}`);
      break;
  }

  if (details && details.length > 0 && (isVerbose || level === "error")) {
    details.forEach((detail) => console.log(`    ${detail}`));
  }
}

// ============================================================================
// Type Definitions
// ============================================================================

interface TranslationObject {
  [key: string]: string | TranslationObject;
}

interface ValidationResult {
  file: string;
  lang: string;
  missingKeys: string[];
  extraKeys: string[];
  multiLineDifferences: MultiLineDifference[];
  interpolationMismatches: InterpolationMismatch[];
}

interface MultiLineDifference {
  key: string;
  baseLines: string[];
  langLines: string[];
}

interface InterpolationMismatch {
  key: string;
  baseInterpolations: string[];
  langInterpolations: string[];
}

interface ValidationSummary {
  totalMissingKeys: number;
  totalExtraKeys: number;
  totalMultiLineDifferences: number;
  totalInterpolationMismatches: number;
  filesChecked: number;
  languagesChecked: number;
}

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Recursively get all keys from an object with dot notation
 */
function getKeys(obj: TranslationObject, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const prefixedKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === "object" && value !== null) {
      return getKeys(value as TranslationObject, prefixedKey);
    }

    return [prefixedKey];
  });
}

/**
 * Get a nested value from an object by dot notation key
 */
function getNestedValue(obj: TranslationObject, key: string): string | TranslationObject | undefined {
  return key.split(".").reduce<string | TranslationObject | undefined>((o, k) => {
    if (o && typeof o === "object" && k in o) {
      return o[k];
    }
    return undefined;
  }, obj);
}

/**
 * Write object to JSON file with consistent formatting
 */
function writeJson(filePath: string, data: TranslationObject): void {
  try {
    // 2-space indentation and a trailing newline
    const content = JSON.stringify(data, null, 2) + "\n";
    fs.writeFileSync(filePath, content, "utf-8");
    log({ level: "success", message: `Updated file: ${filePath}` });
  } catch (e) {
    log({ level: "error", message: `Failed to write file: ${filePath}` });
  }
}

/**
 * Extract interpolation keys from a translation string
 * Matches patterns like {{key}} or {{key.nested}}
 */
function extractInterpolations(value: string): string[] {
  const matches = value.match(/{{([^}]+)}}/g);
  if (!matches) return [];
  return matches.map((match) => match.slice(2, -2)).sort();
}

/**
 * Safely read and parse a JSON file
 */
function safeReadJson(filePath: string): TranslationObject | null {
  try {
    if (!fs.existsSync(filePath)) {
      log({ level: "debug", message: `File not found: ${filePath}` });
      return null;
    }

    const content = fs.readFileSync(filePath, "utf-8").trim();
    if (!content) {
      log({ level: "debug", message: `Empty file: ${filePath}` });
      return {};
    }

    return JSON.parse(content) as TranslationObject;
  } catch (e) {
    const error = e as Error;
    log({
      level: "error",
      message: `Failed to read or parse: ${filePath}`,
      details: [error.message],
      file: filePath,
    });
    return null;
  }
}

/**
 * Recursively syncs target object to match base object structure.
 * - Adds missing keys (using base value).
 * - Removes extra keys.
 * - Sorts keys to MATCH the project's sorting logic (Case-Insensitive).
 */
function syncObjects(base: TranslationObject, target: TranslationObject): TranslationObject {
  const newTarget: TranslationObject = {};

  // CRITICAL: Match the sorting logic from SortTranslations.ts
  const baseKeys = Object.keys(base).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

  for (const key of baseKeys) {
    const baseValue = base[key];
    const targetValue = target[key];

    if (typeof baseValue === "object" && baseValue !== null) {
      // Nested Object
      if (typeof targetValue === "object" && targetValue !== null && !Array.isArray(targetValue)) {
        newTarget[key] = syncObjects(baseValue as TranslationObject, targetValue as TranslationObject);
      } else {
        // Target is missing this object or is a string, recreate structure
        newTarget[key] = syncObjects(baseValue as TranslationObject, {});
      }
    } else {
      // String Value
      if (targetValue === undefined) {
        newTarget[key] = ""; // Fill missing with empty string
      } else if (typeof targetValue === "string") {
        newTarget[key] = targetValue; // Keep existing (even if it's empty, we assume it's intentional or pending)
      } else {
        newTarget[key] = ""; // Type mismatch -> Reset to empty
      }
    }
  }

  return newTarget;
}

/**
 * Validate keys and values between base language and target language
 */
function validateTranslations(
  baseLangFilePath: string,
  langFilePath: string,
  lang: string,
  file: string,
): ValidationResult | null {
  log({ level: "debug", message: `Validating ${lang}/${file}` });

  const baseObj = safeReadJson(baseLangFilePath);
  let langObj = safeReadJson(langFilePath);

  if (!baseObj) {
    log({ level: "error", message: `Base language file unreadable: ${baseLangFilePath}`, file: baseLangFilePath });
    return null;
  }

  // Handle empty or unreadable translation file
  if (!langObj && shouldFix) {
    langObj = {};
  } else if (!langObj || Object.keys(langObj).length === 0) {
    log({
      level: "warn",
      message: `Empty translation file: ${langFilePath}`,
      file: langFilePath,
    });
    const baseKeys = getKeys(baseObj);
    return {
      file,
      lang,
      missingKeys: baseKeys,
      extraKeys: [],
      multiLineDifferences: [],
      interpolationMismatches: [],
    };
  }
  if (shouldFix) {
    const syncedObj = syncObjects(baseObj, langObj);

    // Check if changes are actually needed before writing?
    // For simplicity, we write if strictly syncing.
    // In a real app, you might want to compare stringified versions first.
    writeJson(langFilePath, syncedObj);

    // After fixing, we reload the object to validate it passes
    // (It should pass missing/extra checks, but might still have interpolation issues)
    langObj = syncedObj;
  }
  const baseKeys = getKeys(baseObj);
  const langKeys = getKeys(langObj);

  const missingKeys = baseKeys.filter((key) => !langKeys.includes(key));
  const extraKeys = langKeys.filter((key) => !baseKeys.includes(key));

  // Check for multi-line differences
  const multiLineDifferences: MultiLineDifference[] = [];
  // Check for interpolation mismatches
  const interpolationMismatches: InterpolationMismatch[] = [];

  baseKeys.forEach((key) => {
    const baseValue = getNestedValue(baseObj, key);
    const langValue = getNestedValue(langObj, key);

    if (typeof baseValue === "string" && typeof langValue === "string") {
      // Skip empty translations
      if (langValue === "") return;
      // Check multi-line differences
      const baseLines = baseValue.split("\n").map((l) => l.trim());
      const langLines = langValue.split("\n").map((l) => l.trim());

      if (baseLines.length !== langLines.length) {
        multiLineDifferences.push({ key, baseLines, langLines });
      }

      // Check interpolation mismatches
      const baseInterpolations = extractInterpolations(baseValue);
      const langInterpolations = extractInterpolations(langValue);

      const missingInterpolations = baseInterpolations.filter((i) => !langInterpolations.includes(i));
      const extraInterpolations = langInterpolations.filter((i) => !baseInterpolations.includes(i));

      if (missingInterpolations.length > 0 || extraInterpolations.length > 0) {
        interpolationMismatches.push({ key, baseInterpolations, langInterpolations });
      }
    }
  });

  return { file, lang, missingKeys, extraKeys, multiLineDifferences, interpolationMismatches };
}

/**
 * Get all JSON files in a directory
 */
function getAllJsonFiles(dir: string): string[] {
  try {
    return fs.readdirSync(dir).filter((file) => file.endsWith(".json"));
  } catch (e) {
    log({ level: "error", message: `Failed to read directory: ${dir}` });
    return [];
  }
}

/**
 * Format a validation result for output
 */
function formatValidationResult(result: ValidationResult): void {
  console.log(`\n🌍 ${chalk.blue.bold(result.lang)} ➜ ${chalk.cyan.bold(result.file)}`);

  if (result.missingKeys.length > 0) {
    console.log(chalk.red(`  ❌ Missing keys (${result.missingKeys.length}):`));
    result.missingKeys.forEach((key) => {
      console.log(`    ${chalk.red.bold("- " + key)}`);
      if (isCI) {
        log({
          level: "error",
          message: `Missing translation key: ${key}`,
          file: `locales/${result.lang}/${result.file}`,
        });
      }
    });
  }

  if (result.extraKeys.length > 0) {
    console.log(chalk.yellow(`  ⚠️ Extra keys (${result.extraKeys.length}):`));
    result.extraKeys.forEach((key) => {
      console.log(`    ${chalk.yellow.bold("- " + key)}`);
      if (isCI) {
        log({
          level: "warn",
          message: `Extra translation key not in base: ${key}`,
          file: `locales/${result.lang}/${result.file}`,
        });
      }
    });
  }

  if (result.multiLineDifferences.length > 0) {
    console.log(chalk.magenta(`  ⚠️ Multi-line differences (${result.multiLineDifferences.length}):`));
    result.multiLineDifferences.forEach(({ key, baseLines, langLines }) => {
      console.log(chalk.magenta(`    - ${key}: base(${baseLines.length} lines) vs lang(${langLines.length} lines)`));
    });
  }

  if (result.interpolationMismatches.length > 0) {
    console.log(chalk.red(`  ⚠️ Interpolation mismatches (${result.interpolationMismatches.length}):`));
    result.interpolationMismatches.forEach(({ key, baseInterpolations, langInterpolations }) => {
      const missing = baseInterpolations.filter((i) => !langInterpolations.includes(i));
      const extra = langInterpolations.filter((i) => !baseInterpolations.includes(i));
      console.log(chalk.red(`    - ${key}:`));
      if (missing.length > 0) {
        console.log(chalk.red(`      Missing: ${missing.join(", ")}`));
      }
      if (extra.length > 0) {
        console.log(chalk.yellow(`      Extra: ${extra.join(", ")}`));
      }
      if (isCI) {
        log({
          level: "error",
          message: `Interpolation mismatch in key "${key}": expected [${baseInterpolations.join(", ")}], got [${langInterpolations.join(", ")}]`,
          file: `locales/${result.lang}/${result.file}`,
        });
      }
    });
  }
}

/**
 * Print validation summary
 */
function printSummary(summary: ValidationSummary, hasIssues: boolean): void {
  console.log(chalk.blue.bold(`\n📊 Validation Summary:`));
  console.log(chalk.gray(`  Files checked: ${summary.filesChecked}`));
  console.log(chalk.gray(`  Languages checked: ${summary.languagesChecked}`));
  console.log(chalk.red(`  ❌ Total missing keys: ${summary.totalMissingKeys}`));
  console.log(chalk.yellow(`  ⚠️ Total extra keys: ${summary.totalExtraKeys}`));
  console.log(chalk.magenta(`  ⚠️ Total multi-line differences: ${summary.totalMultiLineDifferences}`));
  console.log(chalk.red(`  ⚠️ Total interpolation mismatches: ${summary.totalInterpolationMismatches}`));

  if (!hasIssues) {
    log({ level: "success", message: "All translation files are valid!" });
  }
}

// ============================================================================
// Main Execution
// ============================================================================

async function main(): Promise<void> {
  log({ level: "info", message: `Starting i18n validation (base: ${baseLang})` });
  log({ level: "debug", message: `Locales directory: ${localesDir}` });

  // Check if locales directory exists
  if (!fs.existsSync(localesDir)) {
    log({ level: "error", message: `Locales directory not found: ${localesDir}` });
    process.exit(1);
  }

  const baseLangDir = path.join(localesDir, baseLang);

  // Check if base language directory exists
  if (!fs.existsSync(baseLangDir)) {
    log({ level: "error", message: `Base language directory not found: ${baseLangDir}` });
    process.exit(1);
  }

  const otherLangDirs = fs.readdirSync(localesDir).filter((lang) => lang !== baseLang);
  log({ level: "info", message: `Found ${otherLangDirs.length} language(s) to validate: ${otherLangDirs.join(", ")}` });

  const allIssues: ValidationResult[] = [];
  const summary: ValidationSummary = {
    totalMissingKeys: 0,
    totalExtraKeys: 0,
    totalMultiLineDifferences: 0,
    totalInterpolationMismatches: 0,
    filesChecked: 0,
    languagesChecked: otherLangDirs.length,
  };

  for (const lang of otherLangDirs) {
    const langDir = path.join(localesDir, lang);
    const baseFiles = getAllJsonFiles(baseLangDir);

    log({ level: "debug", message: `Checking ${baseFiles.length} files for ${lang}` });

    for (const file of baseFiles) {
      summary.filesChecked++;
      const baseLangFilePath = path.join(baseLangDir, file);
      const langFilePath = path.join(langDir, file);

      // Handle missing translation file
      if (!fs.existsSync(langFilePath)) {
        log({
          level: "error",
          message: `Missing translation file: ${langFilePath}`,
          file: langFilePath,
        });
        const baseObj = safeReadJson(baseLangFilePath);
        const baseKeys = baseObj ? getKeys(baseObj) : [];
        allIssues.push({
          file,
          lang,
          missingKeys: baseKeys,
          extraKeys: [],
          multiLineDifferences: [],
          interpolationMismatches: [],
        });
        summary.totalMissingKeys += baseKeys.length;
        continue;
      }

      // Validate keys
      const result = validateTranslations(baseLangFilePath, langFilePath, lang, file);
      if (result) {
        const hasIssues =
          result.missingKeys.length > 0 ||
          result.extraKeys.length > 0 ||
          result.multiLineDifferences.length > 0 ||
          result.interpolationMismatches.length > 0;

        if (hasIssues) {
          allIssues.push(result);
          summary.totalMissingKeys += result.missingKeys.length;
          summary.totalExtraKeys += result.extraKeys.length;
          summary.totalMultiLineDifferences += result.multiLineDifferences.length;
          summary.totalInterpolationMismatches += result.interpolationMismatches.length;
        }
      }
    }
  }

  // Report results
  const hasIssues = allIssues.length > 0;

  if (hasIssues) {
    console.log(chalk.red.bold(`\n🚨 Translation issues detected:`));
    allIssues.forEach(formatValidationResult);
  }

  printSummary(summary, hasIssues);

  // Exit with appropriate code
  if (hasIssues) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

// Run main function
main().catch((error) => {
  log({ level: "error", message: `Unexpected error: ${error}` });
  process.exit(1);
});
