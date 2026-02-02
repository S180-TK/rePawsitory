#!/bin/bash
# COMPLETE GIT HISTORY CLEANUP - Removes ALL old passwords
# This will rewrite your entire git history!

set -e

echo "🔥 COMPLETE GIT HISTORY CLEANUP 🔥"
echo "===================================="
echo ""
echo "This will remove ALL traces of old passwords from git history:"
echo "  - RVOCW6b97JJt5ipw"
echo "  - WbMxrXce2IZWjffs"
echo "  - 90LHSMLavN1l1KaA"
echo ""
echo "⚠️  WARNING: This REWRITES git history completely!"
echo ""
read -p "Type 'CLEANUP' to proceed: " confirm

if [ "$confirm" != "CLEANUP" ]; then
    echo "Aborted."
    exit 1
fi

cd "$(dirname "$0")"

echo ""
echo "Step 1: Creating backup branch..."
git branch backup-before-complete-cleanup-$(date +%Y%m%d-%H%M%S) || true

echo ""
echo "Step 2: Creating password replacement file..."
cat > /tmp/passwords-to-remove.txt << 'EOF'
RVOCW6b97JJt5ipw==>***REMOVED***
WbMxrXce2IZWjffs==>***REMOVED***
90LHSMLavN1l1KaA==>***REMOVED***
EOF

echo ""
echo "Step 3: Removing ALL occurrences of old passwords from entire git history..."
git filter-repo --replace-text /tmp/passwords-to-remove.txt --force

echo ""
echo "Step 4: Cleaning up..."
rm -f /tmp/passwords-to-remove.txt

echo ""
echo "✅ Git history has been completely cleaned!"
echo ""
echo "Next steps:"
echo "1. Verify the cleanup: git log -p | grep -i 'REMOVED' (should see ***REMOVED***)"
echo "2. Force push to GitHub: git push --force --all origin"
echo "3. IMPORTANT: After pushing, go to GitHub repo Settings → Change visibility to Private and back to Public"
echo "   This forces GitHub to purge their cache of the old commits"
echo ""
echo "⚠️  Note: Anyone who has cloned your repo will still have the old history."
echo "    They need to delete their clone and re-clone from GitHub."
