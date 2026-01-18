#!/bin/bash

# Release script for XDownload

echo "🚀 Preparing XDownload Release"

# Build the application
echo "📦 Building application..."
pnpm tauri build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "📋 Release files created in:"
    echo "   - src-tauri/target/release/bundle/"
    echo ""
    echo "🎯 Next steps:"
    echo "   1. Go to GitHub repository"
    echo "   2. Click 'Releases'"
    echo "   3. 'Draft a new release'"
    echo "   4. Tag: v0.1.0"
    echo "   5. Upload build files"
    echo "   6. Publish!"
else
    echo "❌ Build failed!"
    exit 1
fi