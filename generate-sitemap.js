const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://ai-news-br.vercel.app';
const DATES_FILE = path.join(__dirname, 'available-dates.json');
const SITEMAP_FILE = path.join(__dirname, 'sitemap.xml');
const INDEX_FILE = path.join(__dirname, 'index.html');
const RSS_FILE = path.join(__dirname, 'rss.xml');

try {
    const datesData = fs.readFileSync(DATES_FILE, 'utf8');
    const dates = JSON.parse(datesData);
    if (dates.length === 0) throw new Error("No dates found");

    const latestDate = dates[0];
    
    // ==========================================
    // 1. GENERATE SITEMAP
    // ==========================================
    let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    sitemapContent += `  <url>\n    <loc>${BASE_URL}/</loc>\n    <lastmod>${latestDate}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
    dates.forEach(date => {
        sitemapContent += `  <url>\n    <loc>${BASE_URL}/post/${date}</loc>\n    <lastmod>${date}</lastmod>\n    <changefreq>never</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    });
    sitemapContent += `</urlset>`;
    fs.writeFileSync(SITEMAP_FILE, sitemapContent);

    // ==========================================
    // 2. GENERATE RSS FEED
    // ==========================================
    let rssContent = `<?xml version="1.0" encoding="UTF-8" ?>\n<rss version="2.0">\n<channel>\n`;
    rssContent += `  <title>Global News Digest</title>\n  <link>${BASE_URL}</link>\n`;
    rssContent += `  <description>Daily AI-generated summaries of the world's most critical topics.</description>\n`;
    rssContent += `  <image>\n    <url>${BASE_URL}/images/${latestDate}.png</url>\n    <title>Global News Digest</title>\n    <link>${BASE_URL}</link>\n  </image>\n`;
    dates.slice(0, 15).forEach(date => { // Limit to latest 15 for RSS
        const niceDate = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
        rssContent += `  <item>\n    <title>Global News Digest for ${niceDate}</title>\n`;
        rssContent += `    <link>${BASE_URL}/post/${date}</link>\n`;
        rssContent += `    <guid>${BASE_URL}/post/${date}</guid>\n`;
        rssContent += `    <pubDate>${new Date(date).toUTCString()}</pubDate>\n  </item>\n`;
    });
    rssContent += `</channel>\n</rss>`;
    fs.writeFileSync(RSS_FILE, rssContent);

    // ==========================================
    // 3. PRE-RENDER HTML FILES FOR SOCIAL MEDIA
    // ==========================================
    let baseHtml = fs.readFileSync(INDEX_FILE, 'utf8');
    baseHtml = baseHtml.replace(/<!-- OG_TAGS_START -->[\s\S]*?<!-- OG_TAGS_END -->\n?/g, ''); // Clean old tags

    // Helper function to build tags for a specific date
    const createOgTags = (date) => `<!-- OG_TAGS_START -->
    <meta property="og:title" content="Global News Digest | ${date}" />
    <meta property="og:description" content="AI-generated summary of global events for ${date}." />
    <meta property="og:image" content="${BASE_URL}/images/${date}.png" />
    <meta property="og:url" content="${BASE_URL}/post/${date}" />
    <meta property="og:type" content="article" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Global News Digest | ${date}" />
    <meta name="twitter:description" content="AI-generated summary of global events for ${date}." />
    <meta name="twitter:image" content="${BASE_URL}/images/${date}.png" />
    <!-- OG_TAGS_END -->`;

    // 3A. Update Main index.html
    const mainHtml = baseHtml.replace('</head>', `${createOgTags(latestDate)}\n</head>`);
    fs.writeFileSync(INDEX_FILE, mainHtml);

    // 3B. Create a folder and index.html for EVERY single date!
    const postDirBase = path.join(__dirname, 'post');
    if (!fs.existsSync(postDirBase)) fs.mkdirSync(postDirBase);

    dates.forEach(date => {
        const specificDir = path.join(postDirBase, date);
        if (!fs.existsSync(specificDir)) fs.mkdirSync(specificDir, { recursive: true });
        
        // Inject the specific date's tags into a clone of the HTML
        const specificHtml = baseHtml.replace('</head>', `${createOgTags(date)}\n</head>`);
        fs.writeFileSync(path.join(specificDir, 'index.html'), specificHtml);
    });

    console.log(`✅ Build Complete! Pre-rendered ${dates.length} static article pages.`);

} catch (error) {
    console.error('❌ Error during build:', error.message);
    process.exit(1);
}
