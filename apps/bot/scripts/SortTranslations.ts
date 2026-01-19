import fs from "fs";
import path from "path";
import chalk from "chalk";

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  localesDir: path.join(process.cwd(), "locales"),
};

// ============================================================================
// HELPERS
// ============================================================================

const isCheckMode = process.argv.includes("--check");
const isCI = process.argv.includes("--ci") || process.env.CI === "true";

function log(level: "info" | "error" | "warn" | "success", message: string) {
  if (isCI && (level === "error" || level === "warn")) {
    console.log(`::${level}::${message}`);
    return;
  }
  const colors = { info: chalk.blue, success: chalk.green, warn: chalk.yellow, error: chalk.red };
  const icons = { info: "ℹ", success: "✔", warn: "⚠", error: "✖" };
  console.log(`${icons[level]} ${colors[level](message)}`);
}

function getAllFiles(dir: string, fileList: string[] = []) {
  if (!fs.existsSync(dir)) return fileList;
  fs.readdirSync(dir).forEach((file) => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (file.endsWith(".json")) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

function sortObject(obj: any): any {
  if (typeof obj !== "object" || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(sortObject);

  const sortedKeys = Object.keys(obj).sort((a, b) => {
    return a.toLowerCase().localeCompare(b.toLowerCase());
  });

  const result: Record<string, any> = {};
  sortedKeys.forEach((key) => {
    result[key] = sortObject(obj[key]);
  });
  return result;
}

// ============================================================================
// MAIN
// ============================================================================

console.log(chalk.bold("\n🔤 i18n JSON Sorter"));
if (isCheckMode) console.log(chalk.yellow("🛡️  Running in CHECK mode (No changes will be written)"));

if (!fs.existsSync(CONFIG.localesDir)) {
  log("error", `Locales directory not found: ${CONFIG.localesDir}`);
  process.exit(1);
}

const files = getAllFiles(CONFIG.localesDir);
let issues = 0;

files.forEach((filePath) => {
  try {
    const contentRaw = fs.readFileSync(filePath, "utf-8");
    const content = JSON.parse(contentRaw);
    const sortedContent = sortObject(content);

    const oldString = JSON.stringify(content, null, 2);
    // Ensure we have a newline at EOF for standard formatting
    const newString = JSON.stringify(sortedContent, null, 2) + "\n";

    // Compare trimmed versions to ignore purely whitespace/newline differences at EOF
    if (oldString.trim() !== newString.trim()) {
      issues++;
      const relativeName = path.relative(process.cwd(), filePath);

      if (isCheckMode) {
        log("error", `File is not sorted: ${relativeName}`);
      } else {
        fs.writeFileSync(filePath, newString);
        log("success", `Sorted: ${relativeName}`);
      }
    }
  } catch (error) {
    log("error", `Error processing ${path.basename(filePath)}`);
  }
});

if (issues > 0) {
  if (isCheckMode) {
    console.log(chalk.red.bold(`\n✖ Found ${issues} unsorted files.`));
    console.log(chalk.gray("💡 Run 'npm run i18n:fix' to sort them automatically."));
    process.exit(1); // Fail CI
  } else {
    console.log(chalk.green.bold(`\n✨ Success! Sorted ${issues} files.`));
    process.exit(0);
  }
} else {
  console.log(chalk.green.bold(`\n✨ All files are sorted.`));
  process.exit(0);
}
