#!/bin/bash

# Quick fix for routing issues on Linode Object Storage
# Run this after deployment if you have 404 issues with direct URLs

BUCKET_NAME="${LINODE_BUCKET_NAME:-solutionsedge-blog}"
REGION="${LINODE_REGION:-us-east-1}"

echo "Fixing routing for bucket: $BUCKET_NAME"

# Set up website configuration
s3cmd ws-create \
    --ws-index=index.html \
    --ws-error=404.html \
    "s3://$BUCKET_NAME/" \
    --config=.s3cfg.linode

# Make sure all HTML files have correct content type
s3cmd modify \
    "s3://$BUCKET_NAME/**.html" \
    --add-header="Content-Type: text/html; charset=utf-8" \
    --add-header="Cache-Control: public, max-age=0, must-revalidate" \
    --config=.s3cfg.linode

echo "Routing fix applied!"
echo "Your site should now handle direct URLs correctly."