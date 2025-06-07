#!/bin/bash

# Deployment script for Linode Object Storage
# Requires: s3cmd or aws-cli configured with Linode Object Storage credentials

# Configuration
BUCKET_NAME="solutionsedge-blog"
REGION="us-east-1"  # Adjust based on your Linode region
BUILD_DIR="build"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "🚀 Starting deployment to Linode Object Storage..."

# Build the project
echo "📦 Building SvelteKit project..."
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build successful!${NC}"

# Deploy to Linode Object Storage using s3cmd
echo "☁️  Uploading to Linode Object Storage..."

# Sync the build directory to the bucket
# Note: You'll need to configure s3cmd with your Linode credentials first
# Run: s3cmd --configure
# Use Linode's S3-compatible endpoint: https://us-east-1.linodeobjects.com

s3cmd sync --delete-removed --acl-public --no-mime-magic \
    --guess-mime-type --recursive \
    ${BUILD_DIR}/ s3://${BUCKET_NAME}/

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Deployment failed!${NC}"
    exit 1
fi

# Set proper content types for specific files
echo "🔧 Setting content types..."
s3cmd modify s3://${BUCKET_NAME}/index.html --add-header="Content-Type:text/html"
s3cmd modify s3://${BUCKET_NAME}/**/*.html --add-header="Content-Type:text/html"
s3cmd modify s3://${BUCKET_NAME}/**/*.css --add-header="Content-Type:text/css"
s3cmd modify s3://${BUCKET_NAME}/**/*.js --add-header="Content-Type:application/javascript"
s3cmd modify s3://${BUCKET_NAME}/**/*.json --add-header="Content-Type:application/json"

# Set cache headers for assets
echo "⚡ Setting cache headers..."
s3cmd modify s3://${BUCKET_NAME}/_app/**/* --add-header="Cache-Control:public, max-age=31536000, immutable"
s3cmd modify s3://${BUCKET_NAME}/images/**/* --add-header="Cache-Control:public, max-age=31536000"

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo "🌐 Your site should be available at: https://${BUCKET_NAME}.website-${REGION}.linodeobjects.com"
echo ""
echo "📝 Note: Make sure to configure your Linode Object Storage bucket for static website hosting:"
echo "   1. Enable static website hosting on the bucket"
echo "   2. Set index.html as the index document"
echo "   3. Configure your custom domain if needed"