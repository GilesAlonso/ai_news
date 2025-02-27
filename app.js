// Fetch available dates from JSON file
fetch('available-dates.json')
    .then(response => response.json())
    .then(dates => {
        const dateList = document.getElementById('date-list');
        dates.forEach(date => {
            const li = document.createElement('li');
            li.innerHTML = `<a href="#" data-date="${date}" class="text-blue-400 hover:text-red-500">${date}</a>`;
            dateList.appendChild(li);
        });

        // Load the most recent news by default
        if (dates.length > 0) {
            loadNews(dates[0]);
        }
    })
    .catch(error => {
        console.error('Error loading available dates:', error);
    });

// Load news content when a date is clicked
document.getElementById('date-list').addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link) {
        e.preventDefault();
        const date = link.getAttribute('data-date');
        loadNews(date);
    }
});

// Function to load news content
function loadNews(date) {
    fetch(`news/${date}.html`)
        .then(response => response.text())
        .then(html => {
            document.getElementById('news-content').innerHTML = html;
        })
        .catch(() => {
            document.getElementById('news-content').innerHTML = '<p class="text-gray-400">News not found for this date.</p>';
        });
}

// Toggle sidebar visibility
const sidebar = document.getElementById('sidebar');
const toggleButtonMobile = document.getElementById('toggle-sidebar');
const toggleButtonDesktop = document.getElementById('toggle-sidebar-desktop');
let isSidebarVisible = true;

function toggleSidebar() {
    isSidebarVisible = !isSidebarVisible;
    sidebar.classList.toggle('sidebar-hidden', !isSidebarVisible);
    toggleButtonMobile.textContent = isSidebarVisible ? '✕' : '☰';
    toggleButtonDesktop.textContent = isSidebarVisible ? '✕' : '☰';
}

toggleButtonMobile.addEventListener('click', toggleSidebar);
toggleButtonDesktop.addEventListener('click', toggleSidebar);

// Search functionality
let newsIndex;
let newsDocs = [];

async function loadAllNews() {
    newsDocs = [];
    const dates = await fetch('available-dates.json').then(res => res.json());
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

document.getElementById('search-input').addEventListener('input', () => {
    const query = document.getElementById('search-input').value;
    if (query.length > 2) {
        const results = newsIndex.search(query);
        const matchingDates = results.map(result => result.ref);
        document.querySelectorAll('#date-list a').forEach(a => {
            const date = a.getAttribute('data-date');
            a.classList.toggle('bg-red-500', matchingDates.includes(date));
            a.classList.toggle('text-white', matchingDates.includes(date));
        });
    } else {
        document.querySelectorAll('#date-list a').forEach(a => {
            a.classList.remove('bg-red-500', 'text-white');
        });
    }
});
