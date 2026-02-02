#!/bin/bash
# Security Check Script - Run this before committing!

echo "🔒 Security Check for rePawsitory"
echo "=================================="
echo ""

cd "$(dirname "$0")/pet-health-backend"

# Check 1: .env file exists
if [ -f ".env" ]; then
    echo "✅ .env file exists (for local development)"
else
    echo "⚠️  .env file not found - you'll need to create it for local development"
fi

# Check 2: .env is in .gitignore
if grep -q "^\.env$" .gitignore 2>/dev/null || grep -q "^\.env" .gitignore 2>/dev/null; then
    echo "✅ .env is in .gitignore (safe from git)"
else
    echo "❌ ERROR: .env is NOT in .gitignore! Add it immediately!"
fi

# Check 3: .env is not tracked by git
if git ls-files --error-unmatch .env 2>/dev/null; then
    echo "❌ ERROR: .env is tracked by git! Run: git rm --cached .env"
else
    echo "✅ .env is not tracked by git (secure)"
fi

# Check 4: No hardcoded passwords in db.js
if grep -i "mongodb+srv://.*:[^$].*@" db.js 2>/dev/null | grep -v "process.env" | grep -v "YOUR_PASSWORD"; then
    echo "❌ WARNING: Possible hardcoded password found in db.js"
else
    echo "✅ No hardcoded passwords in db.js"
fi

# Check 5: JWT_SECRET uses environment variable
if grep -q "process.env.JWT_SECRET" routes/auth.js 2>/dev/null; then
    echo "✅ JWT_SECRET uses environment variable"
else
    echo "⚠️  JWT_SECRET might be hardcoded in routes/auth.js"
fi

echo ""
echo "=================================="
echo "Security Check Complete!"
echo ""
echo "Next steps:"
echo "1. Make sure to set environment variables in Vercel Dashboard"
echo "2. Never commit the .env file"
echo "3. Run 'git status' and verify .env is NOT listed"
echo ""
