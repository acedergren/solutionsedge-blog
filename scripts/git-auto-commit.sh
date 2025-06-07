#!/bin/bash

# Git Auto-Commit Script
# This script automatically commits and pushes changes to the remote repository

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
COMMIT_PREFIX="Auto-commit:"
DEFAULT_BRANCH="main"
MAX_COMMIT_MESSAGE_LENGTH=100

# Function to log messages
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    error "Not in a git repository!"
    exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
if [ -z "$CURRENT_BRANCH" ]; then
    CURRENT_BRANCH=$DEFAULT_BRANCH
fi

# Check for changes
if [ -z "$(git status --porcelain)" ]; then
    log "No changes to commit"
    exit 0
fi

# Add all changes
log "Adding all changes..."
git add -A

# Generate commit message
CHANGED_FILES=$(git diff --cached --name-only | wc -l)
CHANGE_SUMMARY=$(git diff --cached --stat | tail -1)

# Create detailed commit message
if [ "$1" ]; then
    # Use provided commit message
    COMMIT_MESSAGE="$1"
else
    # Auto-generate commit message
    COMMIT_MESSAGE="$COMMIT_PREFIX Update $CHANGED_FILES files"
    
    # Add change details
    if [ $CHANGED_FILES -le 5 ]; then
        FILES_LIST=$(git diff --cached --name-only | sed 's/^/  - /')
        COMMIT_MESSAGE="$COMMIT_MESSAGE

Modified files:
$FILES_LIST

$CHANGE_SUMMARY"
    else
        COMMIT_MESSAGE="$COMMIT_MESSAGE

$CHANGE_SUMMARY"
    fi
fi

# Commit changes
log "Committing changes..."
git commit -m "$COMMIT_MESSAGE"

if [ $? -eq 0 ]; then
    log "Commit successful"
else
    error "Commit failed"
    exit 1
fi

# Check if remote exists
if git remote | grep -q origin; then
    # Push to remote
    log "Pushing to remote origin/$CURRENT_BRANCH..."
    git push origin $CURRENT_BRANCH
    
    if [ $? -eq 0 ]; then
        log "Push successful"
    else
        warning "Push failed - trying to set upstream..."
        git push --set-upstream origin $CURRENT_BRANCH
        
        if [ $? -eq 0 ]; then
            log "Push successful (upstream set)"
        else
            error "Push failed"
            exit 1
        fi
    fi
else
    warning "No remote 'origin' found. Commit saved locally only."
    warning "To add a remote, run: git remote add origin <repository-url>"
fi

log "Git auto-commit completed successfully!"