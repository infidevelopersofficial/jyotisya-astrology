#!/bin/bash

# Comprehensive ESLint Fix Script
# This script fixes common ESLint errors across the codebase

set -e

echo "Starting comprehensive ESLint fixes..."

# Function to add return types to API route handlers
fix_api_routes() {
    echo "Fixing API route handlers..."

    # Find all route.ts files
    find apps/web/app/api -name "route.ts" -type f | while read -r file; do
        echo "Processing: $file"

        # Fix async GET without return type
        sed -i.bak 's/export async function GET()/export async function GET(): Promise<NextResponse>/g' "$file"
        sed -i.bak 's/export async function GET(request: Request)/export async function GET(request: Request): Promise<NextResponse>/g' "$file"

        # Fix async POST without return type
        sed -i.bak 's/export async function POST()/export async function POST(): Promise<NextResponse>/g' "$file"
        sed -i.bak 's/export async function POST(request: Request)/export async function POST(request: Request): Promise<NextResponse>/g' "$file"

        # Fix async PATCH without return type
        sed -i.bak 's/export async function PATCH()/export async function PATCH(): Promise<NextResponse>/g' "$file"
        sed -i.bak 's/export async function PATCH(request: Request)/export async function PATCH(request: Request): Promise<NextResponse>/g' "$file"

        # Fix async PUT without return type
        sed -i.bak 's/export async function PUT()/export async function PUT(): Promise<NextResponse>/g' "$file"
        sed -i.bak 's/export async function PUT(request: Request)/export async function PUT(request: Request): Promise<NextResponse>/g' "$file"

        # Fix async DELETE without return type
        sed -i.bak 's/export async function DELETE()/export async function DELETE(): Promise<NextResponse>/g' "$file"
        sed -i.bak 's/export async function DELETE(request: Request)/export async function DELETE(request: Request): Promise<NextResponse>/g' "$file"

        rm -f "$file.bak"
    done
}

# Function to fix admin app files
fix_admin_app() {
    echo "Fixing admin app files..."

    # Fix admin dashboard page
    if [ -f "apps/admin/app/(dashboard)/page.tsx" ]; then
        sed -i.bak 's/export default function DashboardPage()/export default function DashboardPage(): React.ReactElement/g' "apps/admin/app/(dashboard)/page.tsx"
        rm -f "apps/admin/app/(dashboard)/page.tsx.bak"
    fi

    # Fix admin layout
    if [ -f "apps/admin/app/layout.tsx" ]; then
        sed -i.bak 's/}: {$/}: { children: React.ReactNode }): React.ReactElement {/g' "apps/admin/app/layout.tsx"
        rm -f "apps/admin/app/layout.tsx.bak"
    fi
}

# Run the fixes
fix_api_routes
fix_admin_app

echo "Basic fixes applied. Running manual TypeScript fixes..."
