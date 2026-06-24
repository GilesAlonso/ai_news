const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'https://ai-news-br.vercel.app';
const DATES_FILE = path.join(__dirname, 'available-dates.json');
const SITEMAP_FILE = path.join(__dirname, 'sitemap.xml');

try {
    // 1. Read the array of dates your AI generated
    const datesData = fs.readFileSync(DATES_FILE, 'utf8');
    const dates = JSON.parse(datesData);

    // 2. Start building the XML string
    let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    sitemapContent += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // 3. Add the homepage (Using the most recent date as lastmod, or today)
    const latestDate = dates.length > 0 ? dates[0] : new Date().toISOString().split('T')[0];
    sitemapContent += `   <url>\n`;
    sitemapContent += `      <loc>${BASE_URL}/</loc>\n`;
    sitemapContent += `      <lastmod>${latestDate}</lastmod>\n`;
    sitemapContent += `      <changefreq>daily</changefreq>\n`;
    sitemapContent += `      <priority>1.0</priority>\n`;
    sitemapContent += `   </url>\n`;

    // 4. Loop through the JSON array and add an entry for every single date
    dates.forEach(date => {
        sitemapContent += `   <url>\n`;
        sitemapContent += `      <loc>${BASE_URL}/?date=${date}</loc>\n`;
        sitemapContent += `      <lastmod>${date}</lastmod>\n`;
        sitemapContent += `      <changefreq>never</changefreq>\n`;
        sitemapContent += `      <priority>0.8</priority>\n`;
        sitemapContent += `   </url>\n`;
    });

    // 5. Close the XML tag
    sitemapContent += `</urlset>`;

    // 6. Write the final string to sitemap.xml
    fs.writeFileSync(SITEMAP_FILE, sitemapContent);
    console.log(`✅ Sitemap successfully generated with ${dates.length + 1} URLs!`);

} catch (error) {
    console.error('❌ Error generating sitemap:', error.message);
    process.exit(1);
}
