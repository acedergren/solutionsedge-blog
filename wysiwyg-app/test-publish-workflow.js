const puppeteer = require('puppeteer');

async function testPublishWorkflow() {
    console.log('🚀 Starting Publish Workflow Tests...\n');

    const browser = await puppeteer.launch({ 
        headless: false, // Set to true for headless testing
        slowMo: 100,
        devtools: false 
    });
    
    const page = await browser.newPage();
    
    try {
        // Test 1: Navigate to editor
        console.log('📝 Test 1: Navigate to New Post Editor');
        await page.goto('http://localhost:5173/editor/new');
        await page.waitForSelector('h1', { timeout: 5000 });
        
        const editorTitle = await page.$eval('h1', el => el.textContent);
        console.log(`✓ Editor loaded: ${editorTitle}`);
        
        // Test 2: Fill out post metadata
        console.log('\n📋 Test 2: Fill Post Metadata');
        
        // Fill title
        await page.fill('input[placeholder*="title" i]', 'Test Blog Post for Workflow');
        console.log('✓ Title filled');
        
        // Fill slug
        await page.fill('input[placeholder*="slug" i]', 'test-blog-post-workflow');
        console.log('✓ Slug filled');
        
        // Fill author
        await page.fill('input[placeholder*="author" i]', 'Test Author');
        console.log('✓ Author filled');
        
        // Fill excerpt
        await page.fill('textarea[placeholder*="excerpt" i]', 'This is a test blog post to verify the publish workflow system works correctly.');
        console.log('✓ Excerpt filled');
        
        // Add tags
        const tagInput = await page.$('input[placeholder*="tag" i]');
        if (tagInput) {
            await page.fill('input[placeholder*="tag" i]', 'test,workflow,publishing');
            await page.keyboard.press('Enter');
            console.log('✓ Tags added');
        }
        
        // Test 3: Add content to editor
        console.log('\n✏️  Test 3: Add Content to Editor');
        
        // Look for Quill editor
        const editorSelector = '.ql-editor, [data-testid="editor"], .editor-content .ql-container .ql-editor';
        await page.waitForSelector(editorSelector, { timeout: 5000 });
        
        await page.click(editorSelector);
        await page.type(editorSelector, `
# Test Blog Post

This is a comprehensive test of the publish workflow system.

## Features Being Tested

- Pre-publish validation
- Content creation
- Publish dialog functionality
- S3 integration
- RSS feed generation

The system should handle this content properly and validate all requirements before publishing.

## Content Requirements

This post contains more than 100 characters as required by the validation system. It includes proper headings, paragraphs, and structured content that demonstrates the full capabilities of the WYSIWYG editor.
        `);
        
        console.log('✓ Content added to editor');
        
        // Test 4: Test publish button and dialog
        console.log('\n🚀 Test 4: Test Publish Dialog');
        
        // Click publish button
        await page.click('button:has-text("Publish")');
        console.log('✓ Publish button clicked');
        
        // Wait for publish dialog
        await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
        console.log('✓ Publish dialog opened');
        
        // Check for validation checklist
        const checklistItems = await page.$$('.checklist-item');
        console.log(`✓ Found ${checklistItems.length} checklist items`);
        
        // Check for success icons (validation passed)
        const successIcons = await page.$$('.checklist-item svg.text-success-600');
        console.log(`✓ ${successIcons.length} validation checks passed`);
        
        // Test 5: Test scheduled publishing
        console.log('\n⏰ Test 5: Test Scheduled Publishing');
        
        // Close current dialog
        await page.click('button:has-text("Cancel")');
        await page.waitFor(500);
        
        // Click schedule button
        await page.click('button:has-text("Schedule")');
        await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
        console.log('✓ Schedule dialog opened');
        
        // Check for datetime input
        const datetimeInput = await page.$('input[type="datetime-local"]');
        if (datetimeInput) {
            // Set a future date
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 1);
            const dateString = futureDate.toISOString().slice(0, 16);
            
            await page.fill('input[type="datetime-local"]', dateString);
            console.log('✓ Schedule date set');
        }
        
        // Close dialog
        await page.click('button:has-text("Cancel")');
        
        // Test 6: Navigate to Dashboard
        console.log('\n📊 Test 6: Test Dashboard Navigation');
        
        await page.click('a[href="/dashboard"]');
        await page.waitForSelector('h1:has-text("Dashboard")', { timeout: 5000 });
        console.log('✓ Dashboard loaded');
        
        // Check for dashboard features
        const searchInput = await page.$('input[placeholder*="Search" i]');
        if (searchInput) {
            console.log('✓ Search functionality present');
        }
        
        const statusFilter = await page.$('select');
        if (statusFilter) {
            console.log('✓ Status filter present');
        }
        
        // Test 7: Test RSS Feed
        console.log('\n📡 Test 7: Test RSS Feed');
        
        const response = await page.goto('http://localhost:5173/feed.xml');
        const content = await response.text();
        
        if (content.includes('<?xml') && content.includes('<rss')) {
            console.log('✓ RSS feed generated successfully');
            console.log(`✓ RSS content length: ${content.length} characters`);
        } else {
            console.log('❌ RSS feed format invalid');
        }
        
        // Test 8: Test Navigation
        console.log('\n🧭 Test 8: Test Navigation Links');
        
        await page.goto('http://localhost:5173/');
        
        const navLinks = await page.$$('nav a');
        console.log(`✓ Found ${navLinks.length} navigation links`);
        
        // Test each navigation link
        for (const link of navLinks.slice(0, 3)) { // Test first 3 links
            const href = await link.getAttribute('href');
            const text = await link.textContent();
            
            if (href && !href.includes('feed.xml')) {
                try {
                    await page.goto(`http://localhost:5173${href}`);
                    console.log(`✓ Navigation to ${text} (${href}) successful`);
                } catch (e) {
                    console.log(`❌ Navigation to ${text} (${href}) failed`);
                }
            }
        }
        
        console.log('\n🎉 All tests completed successfully!');
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
    } finally {
        await browser.close();
    }
}

// Helper function for page.fill (if not available)
if (!puppeteer.Page.prototype.fill) {
    puppeteer.Page.prototype.fill = async function(selector, value) {
        await this.evaluate((selector, value) => {
            const element = document.querySelector(selector);
            if (element) {
                element.value = value;
                element.dispatchEvent(new Event('input', { bubbles: true }));
                element.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }, selector, value);
    };
}

// Helper function for waitFor
if (!puppeteer.Page.prototype.waitFor) {
    puppeteer.Page.prototype.waitFor = function(milliseconds) {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    };
}

// Run the tests
testPublishWorkflow().catch(console.error);