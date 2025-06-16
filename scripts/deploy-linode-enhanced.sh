#!/bin/bash

# Enhanced Linode Object Storage Deployment Script
# Handles proper routing for SvelteKit static sites

set -e  # Exit on error

# Configuration
BUCKET_NAME="${LINODE_BUCKET_NAME:-solutionsedge-blog}"
REGION="${LINODE_REGION:-us-east-1}"
BUILD_DIR="build"
CLOUDFLARE_ZONE_ID="${CLOUDFLARE_ZONE_ID:-}"
CLOUDFLARE_API_TOKEN="${CLOUDFLARE_API_TOKEN:-}"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}   SolutionsEdge Blog Deployment to Linode${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"

# Check if build directory exists
if [ ! -d "$BUILD_DIR" ]; then
    echo -e "${YELLOW}Build directory not found. Running build...${NC}"
    npm run build
fi

# Remove development-only files from build
echo -e "${GREEN}Removing development-only files...${NC}"
rm -f "$BUILD_DIR/editor.html" 2>/dev/null || true
rm -f "$BUILD_DIR/editor/index.html" 2>/dev/null || true
rm -rf "$BUILD_DIR/editor" 2>/dev/null || true

# Ensure 404.html exists
if [ ! -f "$BUILD_DIR/404.html" ]; then
    echo -e "${YELLOW}Creating 404.html fallback...${NC}"
    cp "$BUILD_DIR/index.html" "$BUILD_DIR/404.html" 2>/dev/null || true
fi

# Create routing rules file for better handling
echo -e "${GREEN}Creating routing configuration...${NC}"

# For each article, ensure proper structure
echo -e "${GREEN}Ensuring proper file structure for routing...${NC}"
find "$BUILD_DIR" -name "*.html" -not -name "index.html" -not -name "404.html" | while read -r file; do
    dir=$(dirname "$file")
    base=$(basename "$file" .html)
    
    # If this HTML file is not in its own directory, create the directory structure
    if [ "$base" != "index" ]; then
        mkdir -p "$dir/$base"
        cp "$file" "$dir/$base/index.html"
        echo -e "  ${BLUE}→${NC} Created $dir/$base/index.html"
    fi
done

# Deploy with s3cmd
if command -v s3cmd &> /dev/null; then
    echo -e "${GREEN}Deploying with s3cmd...${NC}"
    
    # Configure s3cmd for Linode if not already done
    if [ ! -f ~/.s3cfg ] || ! grep -q "linodeobjects.com" ~/.s3cfg; then
        echo -e "${YELLOW}Configuring s3cmd for Linode...${NC}"
        cat > ~/.s3cfg << EOF
[default]
access_key = ${LINODE_ACCESS_KEY}
secret_key = ${LINODE_SECRET_KEY}
host_base = ${REGION}.linodeobjects.com
host_bucket = %(bucket)s.${REGION}.linodeobjects.com
website_endpoint = http://%(bucket)s.website-${REGION}.linodeobjects.com/
use_https = True
EOF
    fi
    
    # Sync files with proper content types and caching
    s3cmd sync "$BUILD_DIR/" "s3://$BUCKET_NAME/" \
        --acl-public \
        --delete-removed \
        --guess-mime-type \
        --no-mime-magic \
        --exclude '.DS_Store' \
        --exclude '*.map' \
        --add-header="Cache-Control: public, max-age=3600" \
        --add-header="X-Content-Type-Options: nosniff"
    
    # Set specific content types and cache headers
    echo -e "${GREEN}Setting content types and cache headers...${NC}"
    
    # HTML files - shorter cache
    s3cmd modify "s3://$BUCKET_NAME/**.html" \
        --add-header="Content-Type: text/html; charset=utf-8" \
        --add-header="Cache-Control: public, max-age=300, must-revalidate"
    
    # CSS files - longer cache with versioning
    s3cmd modify "s3://$BUCKET_NAME/**.css" \
        --add-header="Content-Type: text/css; charset=utf-8" \
        --add-header="Cache-Control: public, max-age=31536000, immutable"
    
    # JS files - longer cache with versioning
    s3cmd modify "s3://$BUCKET_NAME/**.js" \
        --add-header="Content-Type: application/javascript; charset=utf-8" \
        --add-header="Cache-Control: public, max-age=31536000, immutable"
    
    # Images - very long cache
    s3cmd modify "s3://$BUCKET_NAME/**.jpg" \
        --add-header="Cache-Control: public, max-age=31536000, immutable"
    s3cmd modify "s3://$BUCKET_NAME/**.jpeg" \
        --add-header="Cache-Control: public, max-age=31536000, immutable"
    s3cmd modify "s3://$BUCKET_NAME/**.png" \
        --add-header="Cache-Control: public, max-age=31536000, immutable"
    s3cmd modify "s3://$BUCKET_NAME/**.webp" \
        --add-header="Cache-Control: public, max-age=31536000, immutable"
    
    # JSON files
    s3cmd modify "s3://$BUCKET_NAME/**.json" \
        --add-header="Content-Type: application/json; charset=utf-8" \
        --add-header="Cache-Control: public, max-age=3600"
    
    # Font files
    s3cmd modify "s3://$BUCKET_NAME/**.woff2" \
        --add-header="Content-Type: font/woff2" \
        --add-header="Cache-Control: public, max-age=31536000, immutable"
    
else
    echo -e "${RED}s3cmd is not installed. Please install it:${NC}"
    echo "pip install s3cmd"
    exit 1
fi

# Configure bucket for static website hosting
echo -e "${GREEN}Configuring bucket for static website hosting...${NC}"

# Create website configuration with routing rules
cat > /tmp/website.xml << 'EOF'
<WebsiteConfiguration>
    <IndexDocument>
        <Suffix>index.html</Suffix>
    </IndexDocument>
    <ErrorDocument>
        <Key>404.html</Key>
    </ErrorDocument>
    <RoutingRules>
        <RoutingRule>
            <Condition>
                <HttpErrorCodeReturnedEquals>404</HttpErrorCodeReturnedEquals>
            </Condition>
            <Redirect>
                <ReplaceKeyWith>404.html</ReplaceKeyWith>
            </Redirect>
        </RoutingRule>
    </RoutingRules>
</WebsiteConfiguration>
EOF

# Apply website configuration
if command -v s3cmd &> /dev/null; then
    s3cmd ws-create --ws-index=index.html --ws-error=404.html "s3://$BUCKET_NAME/" 2>/dev/null || true
fi

# Create a _redirects file for better client-side routing support
cat > "$BUILD_DIR/_redirects" << 'EOF'
# SPA fallback
/*    /index.html   200
EOF

# Upload the redirects file
s3cmd put "$BUILD_DIR/_redirects" "s3://$BUCKET_NAME/_redirects" --acl-public 2>/dev/null || true

# Clean up
rm -f /tmp/website.xml "$BUILD_DIR/_redirects"

# Clear Cloudflare cache if configured
if [ -n "$CLOUDFLARE_ZONE_ID" ] && [ -n "$CLOUDFLARE_API_TOKEN" ]; then
    echo -e "${GREEN}Clearing Cloudflare cache...${NC}"
    curl -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/purge_cache" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" \
        --data '{"purge_everything":true}' \
        --silent > /dev/null
fi

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e ""
echo -e "Your site is available at:"
echo -e "  ${GREEN}https://$BUCKET_NAME.website-$REGION.linodeobjects.com${NC}"
echo -e "  ${GREEN}https://$BUCKET_NAME.$REGION.linodeobjects.com${NC}"
echo -e ""
echo -e "${YELLOW}Note: Direct URL access to articles should now work properly.${NC}"
echo -e "${YELLOW}The site uses trailing slashes (e.g., /article/name/).${NC}"