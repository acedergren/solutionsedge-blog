# Git Automation System

This repository includes several scripts and tools to automate git operations, making it easier to maintain version control without manual intervention.

## Available Commands

### Quick Commands (via npm)

```bash
# One-time auto-commit with automatic message
npm run git:commit

# Start file watcher (runs in foreground)
npm run git:auto

# Start file watcher in background
npm run git:watch:daemon

# Stop background file watcher
npm run git:watch:stop

# Check file watcher status
npm run git:watch:status
```

### Direct Script Usage

```bash
# Manual commit with custom message
./scripts/git-auto-commit.sh "Your custom commit message"

# Bash-based file watcher
./scripts/watch-and-commit.sh start    # Run in foreground
./scripts/watch-and-commit.sh daemon   # Run in background
./scripts/watch-and-commit.sh stop     # Stop background process
./scripts/watch-and-commit.sh status   # Check if running
```

## Features

### 1. Auto-Commit Script (`git-auto-commit.sh`)
- Automatically stages all changes
- Generates descriptive commit messages
- Lists changed files (up to 5 files)
- Pushes to remote if available
- Handles upstream branch setup

### 2. File Watcher (`watch-and-commit.sh`)
- Monitors repository for changes
- Commits every 5 minutes if changes detected
- Can run as a background daemon
- Logs all operations

### 3. Node.js File Watcher (`auto-commit.js`)
- Real-time file watching with debouncing
- Ignores common build artifacts and system files
- Provides colored console output
- Commits and pushes automatically
- More efficient than bash polling

### 4. Git Hooks
- **Pre-push hook**: Ensures all changes are committed before pushing
- Prevents accidental data loss

## Setup Remote Repository

To enable automatic pushing, add your remote repository:

```bash
# Add remote repository
git remote add origin https://github.com/yourusername/your-repo.git

# Set upstream branch
git push --set-upstream origin main
```

## Configuration

### Modify Watch Interval
Edit `scripts/watch-and-commit.sh`:
```bash
WATCH_INTERVAL=300  # Change to desired seconds
```

### Modify Debounce Delay (Node.js watcher)
Edit `scripts/auto-commit.js`:
```javascript
debounceDelay: 5000, // Change to desired milliseconds
```

### Customize Ignored Files
Edit `scripts/auto-commit.js`:
```javascript
watchIgnore: [
  '.git',
  'node_modules',
  'build',
  // Add more patterns here
]
```

## Best Practices

1. **Development Mode**: Use `npm run git:auto` during active development for real-time commits
2. **Background Mode**: Use `npm run git:watch:daemon` for passive monitoring
3. **Manual Override**: You can still use regular git commands alongside automation
4. **Commit Messages**: Provide custom messages when needed: `./scripts/git-auto-commit.sh "feat: Add new feature"`

## Stopping Automation

To disable all automation:
```bash
# Stop any running watchers
npm run git:watch:stop

# Remove git hooks (optional)
rm .git/hooks/pre-push
```

## Troubleshooting

### Watcher won't start
- Check if another instance is running: `npm run git:watch:status`
- Check logs: `tail -f scripts/watch-and-commit.log`

### Push failures
- Ensure remote is configured: `git remote -v`
- Check authentication: `git push origin main`
- Set upstream if needed: `git push --set-upstream origin main`

### Too many commits
- Increase the watch interval or debounce delay
- Use `.gitignore` to exclude frequently changing files