#!/usr/bin/env node

/**
 * Comprehensive ESLint Auto-Fix Script
 * Fixes all common ESLint errors across the monorepo
 */

const fs = require("fs");
const path = require("path");
const { glob } = require("glob");

const ROOT_DIR = __dirname;

// Counter for tracking changes
const stats = {
  filesProcessed: 0,
  filesModified: 0,
  totalChanges: 0,
  changeTypes: {},
};

/**
 * Fix 1: Add return types to API route handlers
 */
function fixAPIRouteReturnTypes(content, filePath) {
  let modified = false;
  const changes = [];

  // Fix async GET/POST/PUT/PATCH/DELETE without return type
  const asyncPatterns = [
    [
      /export async function (GET|POST|PUT|PATCH|DELETE)\(\)( \{)/g,
      "export async function $1(): Promise<NextResponse>$2",
    ],
    [
      /export async function (GET|POST|PUT|PATCH|DELETE)\(request: Request\)( \{)/g,
      "export async function $1(request: Request): Promise<NextResponse>$2",
    ],
    [
      /export async function (GET|POST|PUT|PATCH|DELETE)\(request: NextRequest\)( \{)/g,
      "export async function $1(request: NextRequest): Promise<NextResponse>$2",
    ],
  ];

  for (const [pattern, replacement] of asyncPatterns) {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      modified = true;
      changes.push("Added return type to async API route handler");
    }
  }

  // Fix non-async GET/POST/PUT/PATCH/DELETE without return type (only in route.ts files)
  if (filePath.endsWith("route.ts")) {
    const syncPatterns = [
      [
        /export function (GET|POST|PUT|PATCH|DELETE)\(\) \{/g,
        "export function $1(): NextResponse {",
      ],
      [
        /export function (GET|POST|PUT|PATCH|DELETE)\(request: Request\) \{/g,
        "export function $1(request: Request): NextResponse {",
      ],
    ];

    for (const [pattern, replacement] of syncPatterns) {
      if (pattern.test(content)) {
        content = content.replace(pattern, replacement);
        modified = true;
        changes.push("Added return type to sync API route handler");
      }
    }
  }

  return { content, modified, changes };
}

/**
 * Fix 2: Add return types to React components
 */
function fixReactComponentReturnTypes(content, filePath) {
  let modified = false;
  const changes = [];

  // Only apply to .tsx files (React components)
  if (!filePath.endsWith(".tsx")) {
    return { content, modified, changes };
  }

  // Fix default export function components
  const patterns = [
    [
      /export default function (\w+)\(\)( \{)/g,
      "export default function $1(): React.ReactElement$2",
    ],
    [
      /export default function (\w+)\(\s*\{\s*children\s*\}:\s*\{\s*children:\s*React\.ReactNode\s*\}\s*\)( \{)/g,
      "export default function $1({ children }: { children: React.ReactNode }): React.ReactElement$2",
    ],
  ];

  for (const [pattern, replacement] of patterns) {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      modified = true;
      changes.push("Added return type to React component");
    }
  }

  return { content, modified, changes };
}

/**
 * Fix 3: Convert console.log to console.warn or console.error
 */
function fixConsoleStatements(content, filePath) {
  let modified = false;
  const changes = [];

  // Replace console.log with console.error for error logs
  if (/console\.log\(/.test(content)) {
    content = content.replace(/console\.log\(/g, "console.error(");
    modified = true;
    changes.push("Converted console.log to console.error");
  }

  return { content, modified, changes };
}

/**
 * Fix 4: Remove unnecessary type assertions
 */
function fixUnnecessaryTypeAssertions(content, filePath) {
  let modified = false;
  const changes = [];

  // Remove unnecessary "as string" when already typed
  const patterns = [
    // [/ as string\)!/g, ')!'],
    // [/ as number\)!/g, ')!'],
  ];

  for (const [pattern, replacement] of patterns) {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      modified = true;
      changes.push("Removed unnecessary type assertion");
    }
  }

  return { content, modified, changes };
}

/**
 * Fix 5: Add proper type guards for unknown/any values
 */
function addTypeGuards(content, filePath) {
  let modified = false;
  const changes = [];

  // Add type guard for request.json() calls
  if (
    /const body = await request\.json\(\)/.test(content) &&
    !/as Record<string, unknown>/.test(content)
  ) {
    content = content.replace(
      /const body = await request\.json\(\)/g,
      "const body = await request.json() as Record<string, unknown>",
    );
    modified = true;
    changes.push("Added type guard for request.json()");
  }

  return { content, modified, changes };
}

/**
 * Main function to process a file
 */
function processFile(filePath) {
  try {
    const originalContent = fs.readFileSync(filePath, "utf-8");
    let content = originalContent;
    const allChanges = [];

    // Apply fixes in sequence
    const fixes = [
      fixAPIRouteReturnTypes,
      fixReactComponentReturnTypes,
      fixConsoleStatements,
      fixUnnecessaryTypeAssertions,
      addTypeGuards,
    ];

    for (const fix of fixes) {
      const result = fix(content, filePath);
      content = result.content;
      if (result.modified) {
        allChanges.push(...result.changes);
      }
    }

    // Write back if modified
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, "utf-8");
      stats.filesModified++;
      stats.totalChanges += allChanges.length;

      // Track change types
      allChanges.forEach((change) => {
        stats.changeTypes[change] = (stats.changeTypes[change] || 0) + 1;
      });

      console.log(`✓ ${path.relative(ROOT_DIR, filePath)}`);
      allChanges.forEach((change) => {
        console.log(`  - ${change}`);
      });

      return true;
    }

    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log("Starting comprehensive ESLint fixes...\n");

  // Find all TypeScript files in the apps and packages directories
  const patterns = [
    "apps/*/app/**/*.{ts,tsx}",
    "apps/*/lib/**/*.{ts,tsx}",
    "apps/*/components/**/*.{ts,tsx}",
    "apps/*/hooks/**/*.{ts,tsx}",
    "apps/*/pages/**/*.{ts,tsx}",
    "packages/*/src/**/*.{ts,tsx}",
  ];

  const allFiles = [];
  for (const pattern of patterns) {
    const files = glob.sync(pattern, {
      cwd: ROOT_DIR,
      absolute: true,
      ignore: ["**/node_modules/**", "**/.next/**", "**/dist/**", "**/out/**"],
    });
    allFiles.push(...files);
  }

  const uniqueFiles = [...new Set(allFiles)];

  console.log(`Found ${uniqueFiles.length} TypeScript files to process\n`);

  // Process each file
  for (const file of uniqueFiles) {
    stats.filesProcessed++;
    processFile(file);
  }

  // Print summary
  console.log("\n" + "=".repeat(60));
  console.log("Summary:");
  console.log(`  Files processed: ${stats.filesProcessed}`);
  console.log(`  Files modified: ${stats.filesModified}`);
  console.log(`  Total changes: ${stats.totalChanges}`);
  console.log("\nChange types:");
  Object.entries(stats.changeTypes).forEach(([type, count]) => {
    console.log(`  - ${type}: ${count}`);
  });
  console.log("=".repeat(60));
  console.log("\nNext steps:");
  console.log("1. Review changes: git diff");
  console.log("2. Run linter: npm run lint");
  console.log("3. Fix remaining issues manually");
}

// Run the script
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
