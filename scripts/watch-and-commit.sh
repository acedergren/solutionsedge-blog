#!/bin/bash

# File Watcher and Auto-Commit Script
# Watches for file changes and automatically commits them

# Configuration
WATCH_INTERVAL=300  # Check every 5 minutes (300 seconds)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
AUTO_COMMIT_SCRIPT="$SCRIPT_DIR/git-auto-commit.sh"
PID_FILE="$SCRIPT_DIR/.watch-and-commit.pid"

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Function to log messages
log() {
    echo -e "${GREEN}[WATCHER]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Function to check if another instance is running
check_running() {
    if [ -f "$PID_FILE" ]; then
        OLD_PID=$(cat "$PID_FILE")
        if ps -p $OLD_PID > /dev/null 2>&1; then
            error "Another instance is already running (PID: $OLD_PID)"
            exit 1
        else
            rm "$PID_FILE"
        fi
    fi
}

# Function to cleanup on exit
cleanup() {
    log "Stopping file watcher..."
    rm -f "$PID_FILE"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Check if auto-commit script exists
if [ ! -f "$AUTO_COMMIT_SCRIPT" ]; then
    error "Auto-commit script not found at: $AUTO_COMMIT_SCRIPT"
    exit 1
fi

# Parse command line arguments
case "$1" in
    start)
        check_running
        echo $$ > "$PID_FILE"
        log "Starting file watcher (PID: $$)"
        log "Checking for changes every $WATCH_INTERVAL seconds"
        
        while true; do
            # Check for changes
            if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
                log "Changes detected, auto-committing..."
                "$AUTO_COMMIT_SCRIPT" "Auto-commit: Scheduled update at $(date '+%Y-%m-%d %H:%M:%S')"
            fi
            
            sleep $WATCH_INTERVAL
        done
        ;;
        
    stop)
        if [ -f "$PID_FILE" ]; then
            PID=$(cat "$PID_FILE")
            if ps -p $PID > /dev/null 2>&1; then
                kill $PID
                log "Stopped file watcher (PID: $PID)"
                rm -f "$PID_FILE"
            else
                error "Process not found (PID: $PID)"
                rm -f "$PID_FILE"
            fi
        else
            error "No running instance found"
        fi
        ;;
        
    status)
        if [ -f "$PID_FILE" ]; then
            PID=$(cat "$PID_FILE")
            if ps -p $PID > /dev/null 2>&1; then
                info "File watcher is running (PID: $PID)"
            else
                info "File watcher is not running (stale PID file)"
            fi
        else
            info "File watcher is not running"
        fi
        ;;
        
    daemon)
        check_running
        nohup "$0" start > "$SCRIPT_DIR/watch-and-commit.log" 2>&1 &
        echo $! > "$PID_FILE"
        log "Started file watcher in daemon mode (PID: $!)"
        ;;
        
    *)
        echo "Usage: $0 {start|stop|status|daemon}"
        echo ""
        echo "Commands:"
        echo "  start   - Start the file watcher in foreground"
        echo "  stop    - Stop the running file watcher"
        echo "  status  - Check if file watcher is running"
        echo "  daemon  - Start the file watcher in background"
        exit 1
        ;;
esac