import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { fileURLToPath } from "url";

// --- Configuration ---
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCALES_DIR = path.join(__dirname, "../locales"); // Adjust path to your locales folder
const EXTENSIONS = [".yml", ".yaml"];

// --- Helper: Convert string to camelCase ---
function toCamelCase(str) {
  return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
}

// --- Helper: Recursive Object Converter ---
function convertKeys(obj) {
  if (Array.isArray(obj)) {
    return obj.map((v) => convertKeys(v));
  } else if (obj !== null && typeof obj === "object") {
    return Object.keys(obj).reduce((result, key) => {
      // Convert the Key
      const camelKey = toCamelCase(key);

      // Recursively convert the Value
      result[camelKey] = convertKeys(obj[key]);

      return result;
    }, {});
  }
  return obj;
}

// --- Main Execution ---
function processDirectory(directory) {
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath); // Recurse
    } else if (EXTENSIONS.includes(path.extname(file))) {
      console.log(`Processing: ${fullPath}`);

      try {
        const content = fs.readFileSync(fullPath, "utf8");
        const parsed = yaml.load(content);

        const converted = convertKeys(parsed);

        // Dump back to YAML (adjust indent/lineWidth to your preference)
        const newContent = yaml.dump(converted, {
          indent: 2,
          lineWidth: -1, // Don't wrap long lines
          noRefs: true, // Don't use aliases
        });

        fs.writeFileSync(fullPath, newContent);
      } catch (e) {
        console.error(`Error processing ${file}:`, e);
      }
    }
  }
}

console.log("🐪 Starting Snake -> Camel conversion...");
if (fs.existsSync(LOCALES_DIR)) {
  processDirectory(LOCALES_DIR);
  console.log("✅ Done!");
} else {
  console.error(`❌ Could not find directory: ${LOCALES_DIR}`);
}
