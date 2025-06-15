#!/bin/bash

# Deployment script for SvelteKit blog to Linode Object Storage

# Configuration
BUCKET_NAME="solutionsedge-io"
CLUSTER="us-east-1"
BUILD_DIR="./build"

echo "🚀 Deploying SvelteKit blog to Linode Object Storage"
echo "=================================================="

# Step 1: Build the site
echo "📦 Building the site..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build completed successfully!"

# Step 2: Configure Linode CLI (only needed once)
if ! linode-cli --version &> /dev/null; then
    echo "❌ Linode CLI not found. Please install it with: brew install linode-cli"
    exit 1
fi

# Check if CLI is configured
if ! linode-cli account view &> /dev/null; then
    echo "⚙️  Linode CLI not configured. Running configuration..."
    linode-cli configure
fi

# Step 3: Create bucket if it doesn't exist
echo "🪣 Checking if bucket exists..."
if ! linode-cli obj ls | grep -q "$BUCKET_NAME"; then
    echo "Creating bucket $BUCKET_NAME in $CLUSTER..."
    linode-cli obj mb "s3://$BUCKET_NAME" --cluster "$CLUSTER"
    
    # Enable static website hosting
    echo "Configuring bucket for static website hosting..."
    linode-cli obj ws-create "$BUCKET_NAME" --cluster "$CLUSTER" --ws-index "index.html" --ws-error "404.html"
else
    echo "✅ Bucket $BUCKET_NAME already exists"
fi

# Step 4: Upload files
echo "📤 Uploading files to Linode Object Storage..."

# Function to set correct MIME types
set_content_type() {
    local file=$1
    case "$file" in
        *.html) echo "text/html" ;;
        *.css) echo "text/css" ;;
        *.js) echo "application/javascript" ;;
        *.json) echo "application/json" ;;
        *.png) echo "image/png" ;;
        *.jpg|*.jpeg) echo "image/jpeg" ;;
        *.gif) echo "image/gif" ;;
        *.svg) echo "image/svg+xml" ;;
        *.ico) echo "image/x-icon" ;;
        *.webmanifest) echo "application/manifest+json" ;;
        *) echo "application/octet-stream" ;;
    esac
}

# Upload all files with proper content types
find "$BUILD_DIR" -type f | while read -r file; do
    # Get relative path
    relative_path=${file#$BUILD_DIR/}
    
    # Get content type
    content_type=$(set_content_type "$file")
    
    # Upload file
    echo "Uploading: $relative_path"
    linode-cli obj put "$file" "s3://$BUCKET_NAME/$relative_path" \
        --cluster "$CLUSTER" \
        --acl-public \
        --content-type "$content_type"
done

# Step 5: Display access information
echo ""
echo "✅ Deployment complete!"
echo "=================================================="
echo "🌐 Your site is available at:"
echo "   https://$BUCKET_NAME.$CLUSTER.linodeobjects.com"
echo ""
echo "📝 To use a custom domain:"
echo "   1. Add a CNAME record pointing to: $BUCKET_NAME.$CLUSTER.linodeobjects.com"
echo "   2. Configure SSL/TLS in Linode Cloud Manager"
echo ""
echo "🚀 To enable CDN (Akamai):"
echo "   1. Go to Linode Cloud Manager"
echo "   2. Navigate to Object Storage > $BUCKET_NAME"
echo "   3. Enable CDN option"
echo ""