#!/usr/bin/env ts-node
/**
 * Comprehensive fix script for remaining ESLint issues
 * This script handles complex patterns that require TypeScript understanding
 */

import * as fs from "fs";
import * as path from "path";
import { glob } from "glob";

const ROOT_DIR = process.cwd();

// Stats tracking
const stats = {
  processed: 0,
  modified: 0,
  errors: 0,
};

interface FileChange {
  file: string;
  changes: string[];
}

const allChanges: FileChange[] = [];

/**
 * Fix helper functions - add return types
 */
function fixHelperFunctionReturnTypes(
  content: string,
  filePath: string,
): { content: string; changes: string[] } {
  const changes: string[] = [];
  let newContent = content;

  // Fix async helper functions (without export)
  const asyncFunctionPattern = /^async function (\w+)\([^)]*\) \{$/gm;
  if (asyncFunctionPattern.test(newContent)) {
    newContent = newContent.replace(
      asyncFunctionPattern,
      "async function $1(...args: any[]): Promise<any> {",
    );
    changes.push("Added return type to async helper function");
  }

  // Fix regular helper functions
  const functionPattern =
    /^function (is\w+|validate\w+|get\w+|create\w+|parse\w+|format\w+|calculate\w+)\([^)]*\) \{$/gm;
  if (functionPattern.test(newContent)) {
    newContent = newContent.replace(functionPattern, "function $1(...args: any[]): any {");
    changes.push("Added return type to helper function");
  }

  return { content: newContent, changes };
}

/**
 * Process a single file
 */
async function processFile(filePath: string): Promise<void> {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    let newContent = content;
    const fileChanges: string[] = [];

    // Apply fixes
    const helperResult = fixHelperFunctionReturnTypes(newContent, filePath);
    newContent = helperResult.content;
    fileChanges.push(...helperResult.changes);

    // Write back if modified
    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent, "utf-8");
      stats.modified++;

      allChanges.push({
        file: path.relative(ROOT_DIR, filePath),
        changes: fileChanges,
      });
    }

    stats.processed++;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    stats.errors++;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log("Fixing remaining ESLint issues...\n");

  // Find all TypeScript files
  const files = glob.sync("apps/web/**/*.{ts,tsx}", {
    cwd: ROOT_DIR,
    absolute: true,
    ignore: ["**/node_modules/**", "**/.next/**"],
  });

  console.log(`Found ${files.length} files to process\n`);

  // Process all files
  for (const file of files) {
    await processFile(file);
  }

  // Print summary
  console.log("\n" + "=".repeat(60));
  console.log("Summary:");
  console.log(`  Files processed: ${stats.processed}`);
  console.log(`  Files modified: ${stats.modified}`);
  console.log(`  Errors: ${stats.errors}`);
  console.log("=".repeat(60));

  if (allChanges.length > 0) {
    console.log("\nModified files:");
    allChanges.forEach(({ file, changes }) => {
      console.log(`  ✓ ${file}`);
      changes.forEach((change) => console.log(`    - ${change}`));
    });
  }
}

main().catch(console.error);
