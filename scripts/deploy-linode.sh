#!/bin/bash

# Linode Object Storage Deployment Script
# Deploys SvelteKit static build to Linode Object Storage

set -e  # Exit on error

# Configuration
BUCKET_NAME="${LINODE_BUCKET_NAME:-solutionsedge-blog}"
REGION="${LINODE_REGION:-us-east-1}"
BUILD_DIR="build"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting deployment to Linode Object Storage...${NC}"

# Check if build directory exists
if [ ! -d "$BUILD_DIR" ]; then
    echo -e "${YELLOW}Build directory not found. Running build...${NC}"
    npm run build
fi

# Check if linode-cli is installed
if ! command -v linode-cli &> /dev/null; then
    echo -e "${RED}linode-cli is not installed. Please install it first:${NC}"
    echo "pip install linode-cli"
    exit 1
fi

# Check if s3cmd is installed (alternative option)
if command -v s3cmd &> /dev/null; then
    echo -e "${GREEN}Using s3cmd for deployment...${NC}"
    
    # Sync files to bucket
    s3cmd sync "$BUILD_DIR/" "s3://$BUCKET_NAME/" \
        --acl-public \
        --delete-removed \
        --guess-mime-type \
        --no-mime-magic \
        --exclude '.DS_Store' \
        --exclude '*.map'
    
    # Set proper content types
    s3cmd modify "s3://$BUCKET_NAME/**.html" --add-header="Content-Type: text/html; charset=utf-8"
    s3cmd modify "s3://$BUCKET_NAME/**.css" --add-header="Content-Type: text/css; charset=utf-8"
    s3cmd modify "s3://$BUCKET_NAME/**.js" --add-header="Content-Type: application/javascript; charset=utf-8"
    s3cmd modify "s3://$BUCKET_NAME/**.json" --add-header="Content-Type: application/json; charset=utf-8"
    
else
    echo -e "${GREEN}Using linode-cli for deployment...${NC}"
    
    # Create bucket if it doesn't exist
    linode-cli obj mb "s3://$BUCKET_NAME" 2>/dev/null || true
    
    # Sync files to bucket
    linode-cli obj sync "$BUILD_DIR/" "s3://$BUCKET_NAME/" \
        --recursive \
        --acl public-read \
        --delete
fi

# Configure bucket for static website hosting
echo -e "${GREEN}Configuring bucket for static website hosting...${NC}"

# Create bucket website configuration
cat > /tmp/website.json << EOF
{
    "index_document": {
        "suffix": "index.html"
    },
    "error_document": {
        "key": "404.html"
    }
}
EOF

# Apply website configuration (if using AWS CLI compatible commands)
if command -v aws &> /dev/null; then
    aws s3api put-bucket-website \
        --bucket "$BUCKET_NAME" \
        --website-configuration file:///tmp/website.json \
        --endpoint-url "https://$REGION.linodeobjects.com" 2>/dev/null || true
fi

# Clean up
rm -f /tmp/website.json

echo -e "${GREEN}Deployment complete!${NC}"
echo -e "Your site is available at: ${GREEN}https://$BUCKET_NAME.website-$REGION.linodeobjects.com${NC}"
echo -e "Or via CDN at: ${GREEN}https://$BUCKET_NAME.$REGION.linodeobjects.com${NC}"