import fs from "fs";
import path from "path";
import chalk from "chalk";
import yaml from "js-yaml";

const baseLang = "en-GB";
const localesDir = path.join(process.cwd(), "locales");

// Recursively get all keys from an object
function getKeys(obj, prefix = "") {
  return Object.entries(obj).flatMap(([key, value]) => {
    const prefixedKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === "object" && value !== null) {
      return getKeys(value, prefixedKey);
    }

    return [prefixedKey];
  });
}

// Safely read YAML file
function safeReadYaml(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    const content = fs.readFileSync(filePath, "utf-8").trim();
    if (!content) return {}; // treat empty file as empty object
    return yaml.load(content);
  } catch (e) {
    console.error(chalk.red(`❌ Error reading or parsing: ${filePath}\n${e.message}`));
    return null;
  }
}

// Validate keys and multi-line values between base and another language
function validateKeys(baseLangFilePath, langFilePath, lang, file) {
  const baseObj = safeReadYaml(baseLangFilePath);
  const langObj = safeReadYaml(langFilePath);

  if (!baseObj) return null;

  // Handle empty or unreadable translation file
  if (!langObj || Object.keys(langObj).length === 0) {
    console.warn(chalk.yellow(`⚠️  Empty translation file detected: ${langFilePath}`));
    const baseKeys = getKeys(baseObj);
    return { file, lang, missingKeys: baseKeys, extraKeys: [], multiLineDifferences: [] };
  }

  const baseKeys = getKeys(baseObj);
  const langKeys = getKeys(langObj);

  const missingKeys = baseKeys.filter((key) => !langKeys.includes(key));
  const extraKeys = langKeys.filter((key) => !baseKeys.includes(key));

  // Check for multi-line differences
  const multiLineDifferences = [];
  baseKeys.forEach((key) => {
    const baseValue = key.split(".").reduce((o, k) => o?.[k], baseObj);
    const langValue = key.split(".").reduce((o, k) => o?.[k], langObj);

    if (typeof baseValue === "string" && typeof langValue === "string") {
      const baseLines = baseValue.split("\n").map((l) => l.trim());
      const langLines = langValue.split("\n").map((l) => l.trim());

      if (baseLines.length !== langLines.length) {
        multiLineDifferences.push({ key, baseLines, langLines });
      }
    }
  });

  return { file, lang, missingKeys, extraKeys, multiLineDifferences };
}

// Get all YAML files in a directory
function getAllYamlFiles(dir) {
  return fs.readdirSync(dir).filter((file) => file.endsWith(".yml") || file.endsWith(".yaml"));
}

// Main logic
const baseLangDir = path.join(localesDir, baseLang);
const otherLangDirs = fs.readdirSync(localesDir).filter((lang) => lang !== baseLang);

let allIssues = [];
let totalMissingKeys = 0;
let totalExtraKeys = 0;
let totalMultiLineDifferences = 0;

otherLangDirs.forEach((lang) => {
  const langDir = path.join(localesDir, lang);
  const baseFiles = getAllYamlFiles(baseLangDir);

  baseFiles.forEach((file) => {
    const baseLangFilePath = path.join(baseLangDir, file);
    const langFilePath = path.join(langDir, file);

    // Handle missing translation file
    if (!fs.existsSync(langFilePath)) {
      console.error(chalk.red(`❌ Missing translation file: ${langFilePath}`));
      const baseObj = safeReadYaml(baseLangFilePath);
      const baseKeys = baseObj ? getKeys(baseObj) : [];
      allIssues.push({
        file,
        lang,
        missingKeys: baseKeys,
        extraKeys: [],
        multiLineDifferences: [],
      });
      totalMissingKeys += baseKeys.length;
      return;
    }

    // Validate keys
    const result = validateKeys(baseLangFilePath, langFilePath, lang, file);
    if (
      result &&
      (result.missingKeys.length > 0 || result.extraKeys.length > 0 || result.multiLineDifferences.length > 0)
    ) {
      allIssues.push(result);
      totalMissingKeys += result.missingKeys.length;
      totalExtraKeys += result.extraKeys.length;
      totalMultiLineDifferences += result.multiLineDifferences.length;
    }
  });
});

// Reporting
if (allIssues.length > 0) {
  console.error(chalk.red.bold(`\n🚨 Translation issues detected:`));

  allIssues.forEach(({ lang, file, missingKeys, extraKeys, multiLineDifferences }) => {
    console.error(`\n🌍 ${chalk.blue.bold(lang)} ➜ ${chalk.cyan.bold(file)}`);

    if (missingKeys.length > 0) {
      console.error(chalk.red(`  ❌ Missing keys (${missingKeys.length}):`));
      missingKeys.forEach((key) => console.error(`    ${chalk.red.bold("- " + key)}`));
    }

    if (extraKeys.length > 0) {
      console.error(chalk.yellow(`  ⚠️ Extra keys (${extraKeys.length}):`));
      extraKeys.forEach((key) => console.error(`    ${chalk.yellow.bold("- " + key)}`));
    }

    if (multiLineDifferences.length > 0) {
      console.error(chalk.magenta(`  ⚠️ Multi-line differences (${multiLineDifferences.length}):`));
      multiLineDifferences.forEach(({ key, baseLines, langLines }) => {
        console.error(
          chalk.magenta(`    - ${key}: base(${baseLines.length} lines) vs lang(${langLines.length} lines)`),
        );
      });
    }
  });

  console.error(chalk.blue.bold(`\n📊 Summary:`));
  console.error(chalk.red(`  ❌ Total missing keys: ${totalMissingKeys}`));
  console.error(chalk.yellow(`  ⚠️ Total extra keys: ${totalExtraKeys}`));
  console.error(chalk.magenta(`  ⚠️ Total multi-line differences: ${totalMultiLineDifferences}`));

  process.exit(1);
} else {
  console.log(chalk.green.bold("✅ All translation files are valid."));
  process.exit(0);
}
