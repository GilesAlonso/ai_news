# Daily News

This is a simple daily news application that displays news articles for different dates.

## Features

- **Date Selection**: Users can select a date from a list to view the news for that day.
- **Dynamic News Loading**: News content is loaded dynamically from HTML files.
- **Responsive Sidebar**: A collapsible sidebar for navigating through dates, which works on both mobile and desktop.
- **Search Functionality**: Users can search for news articles using keywords.

## Technologies Used

- **HTML**: The structure of the web page.
- **Tailwind CSS**: For styling the user interface.
- **JavaScript**: For application logic, including fetching data and handling user interactions.
- **Lunr.js**: For implementing the client-side search functionality.

## Getting Started

To run this project, you need to serve the files using a local web server. This is because the `fetch` API is used to load JSON and HTML files, which may be restricted by browser CORS policies if you open `index.html` directly from the file system.

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   ```

2. **Navigate to the project directory:**
   ```bash
   cd <project-directory>
   ```

3. **Start a local web server.** If you have Python installed, you can use its built-in HTTP server:
   - For Python 3:
     ```bash
     python -m http.server
     ```
   - For Python 2:
     ```bash
     python -m SimpleHTTPServer
     ```

   Alternatively, you can use other tools like `live-server` for Node.js.

4. **Open your browser** and navigate to `http://localhost:8000` (or the port specified by your server).
