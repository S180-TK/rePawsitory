#!/bin/bash
# Git History Cleanup Script - Removes old passwords from git history
# WARNING: This rewrites git history! Use with caution.

echo "⚠️  GIT HISTORY CLEANUP WARNING"
echo "================================"
echo ""
echo "This script will rewrite your git history to remove old passwords."
echo "This is DESTRUCTIVE and cannot be easily undone!"
echo ""
echo "Before proceeding:"
echo "1. Make sure you're the only one working on this repo"
echo "2. Close any open pull requests"
echo "3. Notify team members if any"
echo ""
read -p "Do you want to continue? (type 'yes' to proceed): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Aborted."
    exit 1
fi

cd "$(dirname "$0")"

echo ""
echo "Creating backup branch..."
git branch backup-before-history-cleanup-$(date +%Y%m%d-%H%M%S)

echo ""
echo "Removing old passwords from git history..."

# Use git filter-repo if available, otherwise use filter-branch
if command -v git-filter-repo &> /dev/null; then
    echo "Using git-filter-repo (recommended)..."
    git filter-repo --invert-paths --path pet-health-backend/.env --force
    git filter-repo --replace-text <(echo "***REMOVED***==>PASSWORD_REMOVED_FROM_HISTORY")
    git filter-repo --replace-text <(echo "***REMOVED***==>PASSWORD_REMOVED_FROM_HISTORY")
else
    echo "git-filter-repo not found. Using git filter-branch..."
    echo "Consider installing git-filter-repo for better performance:"
    echo "  brew install git-filter-repo"
    echo ""
    
    # Remove .env file from history
    git filter-branch --force --index-filter \
        "git rm --cached --ignore-unmatch pet-health-backend/.env" \
        --prune-empty --tag-name-filter cat -- --all
    
    # Replace passwords in all files
    git filter-branch --force --tree-filter \
        "find . -type f -exec sed -i '' 's/***REMOVED***/PASSWORD_REMOVED_FROM_HISTORY/g' {} + 2>/dev/null; \
         find . -type f -exec sed -i '' 's/***REMOVED***/PASSWORD_REMOVED_FROM_HISTORY/g' {} + 2>/dev/null" \
        --tag-name-filter cat -- --all
fi

echo ""
echo "Cleaning up..."
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo ""
echo "✅ History cleaned!"
echo ""
echo "⚠️  IMPORTANT NEXT STEPS:"
echo "1. Force push to GitHub: git push origin main --force"
echo "2. Update MongoDB password in Vercel Dashboard to: ***REMOVED***"
echo "3. All team members must re-clone the repository"
echo "4. Old passwords are now invalid - change them in MongoDB Atlas if not done already"
echo ""
echo "Backup branch created in case you need to restore: backup-before-history-cleanup-*"
echo ""
