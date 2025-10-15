const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

// Create directory for new HTML dumps
const dumpsDir = 'html_dumps3';
if (!fs.existsSync(dumpsDir)) {
    fs.mkdirSync(dumpsDir);
}

// Array of URLs to download
const urls = [
    'https://www.economy.gov.mk/mk-MK/javni-objavi',
    'https://www.economy.gov.mk/mk-MK/dokumenti/sektorski-programi',
    'https://kb.mk/eib-vii-msp-kapitalizirani-pretprijatija-i-zelena-tranzicija.nspx',
    'https://www.sparkasse.mk/mk/business-clients/finansiranje/posebni-programi-za-finansiranje',
    'https://www.sparkasse.mk/mk/business-clients/finansiranje/investiciski-krediti-proekti',
    'https://www.mzsv.gov.mk/Events.aspx?IdLanguage=1&IdRoot=1&News=3977',
    'https://www.ipardpa.gov.mk/mk/Home/Index',
    'https://www.mbdp.com.mk/mk/Products/KreditnaLinijaProizvod/16'
];

// Function to create slug from URL
function createSlug(url) {
    try {
        const urlObj = new URL(url);
        let slug = urlObj.hostname + urlObj.pathname + urlObj.search;
        // Remove protocol and www
        slug = slug.replace(/^www\./, '');
        // Replace special characters with underscores
        slug = slug.replace(/[^a-zA-Z0-9._-]/g, '_');
        // Remove multiple consecutive underscores
        slug = slug.replace(/_+/g, '_');
        // Remove leading/trailing underscores
        slug = slug.replace(/^_|_$/g, '');
        return slug;
    } catch (error) {
        console.error(`Error creating slug for ${url}:`, error.message);
        return 'unknown';
    }
}

// Function to download a URL
function downloadUrl(url, filename) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https:') ? https : http;

        const request = protocol.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        }, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`HTTP ${response.statusCode} for ${url}`));
                return;
            }

            const fileStream = fs.createWriteStream(filename);
            response.pipe(fileStream);

            fileStream.on('finish', () => {
                fileStream.close();
                resolve();
            });

            fileStream.on('error', (error) => {
                fs.unlink(filename, () => {}); // Delete the file on error
                reject(error);
            });
        });

        request.on('error', (error) => {
            reject(error);
        });

        // Set timeout
        request.setTimeout(30000, () => {
            request.destroy();
            reject(new Error('Request timeout'));
        });
    });
}

// Download all URLs
async function downloadAll() {
    console.log('Starting download of new grant sources...\n');

    for (const url of urls) {
        const slug = createSlug(url);
        const filename = path.join(dumpsDir, `${slug}.html`);

        try {
            console.log(`Downloading: ${url}`);
            console.log(`Saving to: ${filename}`);

            await downloadUrl(url, filename);

            // Check if file was created and has content
            if (fs.existsSync(filename) && fs.statSync(filename).size > 0) {
                console.log(`✅ Successfully downloaded: ${filename}\n`);
            } else {
                console.log(`❌ Downloaded file is empty: ${filename}\n`);
            }
        } catch (error) {
            console.error(`❌ Failed to download ${url}:`, error.message, '\n');
        }

        // Small delay to be respectful to servers
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('Download complete!');
}

downloadAll().catch(console.error);