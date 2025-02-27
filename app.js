const dateList = document.getElementById('date-list');
const newsContent = document.getElementById('news-content');
const searchInput = document.getElementById('search-input');

// Generate list of dates (last 30 days as an example)
const dates = [];
for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    dates.push(dateString);
}

// Populate left menu
dates.forEach(date => {
    const li = document.createElement('li');
    li.innerHTML = `<a href="#" data-date="${date}" class="text-blue-400 hover:text-red-500">${date}</a>`;
    dateList.appendChild(li);
});

// Load news content when a date is clicked
dateList.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
        const date = e.target.getAttribute('data-date');
        loadNews(date);
    }
});

// Function to load news content
function loadNews(date) {
    fetch(`news/${date}.html`)
        .then(response => response.text())
        .then(html => {
            newsContent.innerHTML = html;
        })
        .catch(() => {
            newsContent.innerHTML = '<p class="text-gray-400">News not found for this date.</p>';
        });
}

// Load the most recent news by default
loadNews(dates[0]);

// Search functionality with Lunr.js
let newsIndex;
let newsDocs = [];

async function loadAllNews() {
    newsDocs = [];
    for (const date of dates) {
        try {
            const response = await fetch(`news/${date}.html`);
            const html = await response.text();
            newsDocs.push({ date, content: html });
        } catch (error) {
            console.log(`No news for ${date}`);
        }
    }
    newsIndex = lunr(function () {
        this.ref('date');
        this.field('content');
        newsDocs.forEach(doc => this.add(doc));
    });
}

loadAllNews();

searchInput.addEventListener('input', () => {
    const query = searchInput.value;
    if (query.length > 2) {
        const results = newsIndex.search(query);
        const matchingDates = results.map(result => result.ref);
        dateList.querySelectorAll('a').forEach(a => {
            const date = a.getAttribute('data-date');
            a.classList.toggle('bg-red-500', matchingDates.includes(date));
            a.classList.toggle('text-white', matchingDates.includes(date));
        });
    } else {
        dateList.querySelectorAll('a').forEach(a => {
            a.classList.remove('bg-red-500', 'text-white');
        });
    }
});
