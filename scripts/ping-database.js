#!/usr/bin/env node

/**
 * Simple Website Ping Script
 * 
 * This script pings your deployed application to keep the database active.
 * Much simpler than direct database connections!
 * 
 * Usage:
 *   node scripts/ping-database.js [URL]
 *   WEBSITE_URL=https://your-app.vercel.app node scripts/ping-database.js
 * 
 * Requirements:
 *   - WEBSITE_URL environment variable OR URL as first argument
 */

const https = require('https');
const http = require('http');
require('dotenv').config({ path: '.env.local' });

async function pingWebsite() {
    try {
        // Get URL from argument or environment variable
        const url = process.argv[2] || process.env.WEBSITE_URL;

        if (!url) {
            console.error('❌ No URL provided!');
            console.error('Usage:');
            console.error('  node scripts/ping-database.js https://voice-lms.vercel.app/');
            console.error('  OR set WEBSITE_URL environment variable');
            process.exit(1);
        }

        console.log(`🔄 Pinging deployed application...`);
        console.log(`🌐 URL: ${url}`);

        const urlObj = new URL(url);
        const client = urlObj.protocol === 'https:' ? https : http;

        const response = await new Promise((resolve, reject) => {
            const req = client.get(url, (res) => {
                resolve(res);
            });

            req.on('error', (error) => {
                reject(error);
            });

            req.setTimeout(10000, () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });
        });

        if (response.statusCode >= 200 && response.statusCode < 400) {
            console.log(`✅ Website ping successful! (HTTP ${response.statusCode})`);
            console.log('� Database should now be active');
            console.log(`⏰ Pinged at: ${new Date().toISOString()}`);
        } else {
            console.log(`⚠️ Website returned HTTP ${response.statusCode}`);
            console.log('This might still be enough to keep the database active');
        }

    } catch (error) {
        console.error('❌ Website ping failed:', error.message);
        console.error('\nPossible issues:');
        console.error('- Check your internet connection');
        console.error('- Verify the website URL is correct');
        console.error('- Ensure the website is deployed and accessible');
        process.exit(1);
    }
}

// Run the ping function
pingWebsite();
