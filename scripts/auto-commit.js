#!/usr/bin/env node

const { exec } = require('child_process');
const { watch } = require('fs');
const path = require('path');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Configuration
const CONFIG = {
  debounceDelay: 5000, // Wait 5 seconds after last change before committing
  watchIgnore: [
    '.git',
    'node_modules',
    'build',
    '.svelte-kit',
    '*.log',
    '.DS_Store'
  ],
  commitMessagePrefix: 'Auto-commit:',
  maxFilesInMessage: 5
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m'
};

// Logging functions
const log = {
  info: (msg) => console.log(`${colors.blue}[INFO]${colors.reset} ${new Date().toISOString()} - ${msg}`),
  success: (msg) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${new Date().toISOString()} - ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}[WARNING]${colors.reset} ${new Date().toISOString()} - ${msg}`),
  error: (msg) => console.error(`${colors.red}[ERROR]${colors.reset} ${new Date().toISOString()} - ${msg}`)
};

// Debounce timer
let debounceTimer = null;

// Check if path should be ignored
function shouldIgnore(filePath) {
  return CONFIG.watchIgnore.some(pattern => {
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace('*', '.*'));
      return regex.test(filePath);
    }
    return filePath.includes(pattern);
  });
}

// Get git status
async function getGitStatus() {
  try {
    const { stdout } = await execAsync('git status --porcelain');
    return stdout.trim().split('\n').filter(line => line.length > 0);
  } catch (error) {
    log.error('Failed to get git status: ' + error.message);
    return [];
  }
}

// Auto commit function
async function autoCommit() {
  try {
    // Check for changes
    const changes = await getGitStatus();
    if (changes.length === 0) {
      log.info('No changes to commit');
      return;
    }

    log.info(`Found ${changes.length} changed files`);

    // Add all changes
    await execAsync('git add -A');
    
    // Generate commit message
    let commitMessage = `${CONFIG.commitMessagePrefix} Update ${changes.length} files at ${new Date().toLocaleString()}`;
    
    // Add file details if not too many
    if (changes.length <= CONFIG.maxFilesInMessage) {
      const fileList = changes.map(line => {
        const parts = line.trim().split(/\s+/);
        return `  - ${parts[1]} (${parts[0]})`;
      }).join('\n');
      commitMessage += `\n\nModified files:\n${fileList}`;
    }

    // Commit
    await execAsync(`git commit -m "${commitMessage}"`);
    log.success('Changes committed successfully');

    // Try to push if remote exists
    try {
      const { stdout: remotes } = await execAsync('git remote');
      if (remotes.includes('origin')) {
        log.info('Pushing to remote...');
        await execAsync('git push');
        log.success('Changes pushed to remote');
      }
    } catch (pushError) {
      if (pushError.message.includes('no upstream branch')) {
        log.warning('No upstream branch set. Run: git push --set-upstream origin main');
      } else {
        log.warning('Push failed: ' + pushError.message);
      }
    }

  } catch (error) {
    log.error('Auto-commit failed: ' + error.message);
  }
}

// Handle file changes
function handleFileChange(eventType, filename) {
  if (!filename || shouldIgnore(filename)) {
    return;
  }

  log.info(`File ${eventType}: ${filename}`);

  // Clear existing timer
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  // Set new timer
  debounceTimer = setTimeout(() => {
    autoCommit();
  }, CONFIG.debounceDelay);
}

// Main function
async function main() {
  log.info('Starting auto-commit watcher...');
  log.info(`Debounce delay: ${CONFIG.debounceDelay}ms`);
  log.info(`Watching for changes in: ${process.cwd()}`);

  // Check if we're in a git repository
  try {
    await execAsync('git rev-parse --git-dir');
  } catch (error) {
    log.error('Not in a git repository!');
    process.exit(1);
  }

  // Watch current directory recursively
  const watcher = watch(process.cwd(), { recursive: true }, handleFileChange);

  // Handle process termination
  process.on('SIGINT', () => {
    log.info('Stopping auto-commit watcher...');
    watcher.close();
    process.exit(0);
  });

  // Initial commit if there are changes
  const initialChanges = await getGitStatus();
  if (initialChanges.length > 0) {
    log.info('Found uncommitted changes on startup');
    await autoCommit();
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    log.error('Fatal error: ' + error.message);
    process.exit(1);
  });
}

module.exports = { autoCommit, getGitStatus };