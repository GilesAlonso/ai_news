# Custom Comment System Setup Guide

To replace Giscus with a Google Sheets + Apps Script comment system, follow these steps:

## 1. Google Sheets Configuration

1.  **Create a New Google Sheet** (e.g., "Global News Comments").
2.  **Rename the Sheet**: Ensure the first tab is named `Sheet1`.
3.  **Add Headers**: In the first row, add the following headers (case-insensitive):
    *   **Date** (A1)
    *   **Author** (B1)
    *   **Comment** (C1)
    *   **Timestamp** (D1)
    *   **ID** (E1)

## 2. Apps Script Deployment

1.  In your Google Sheet, go to **Extensions > Apps Script**.
2.  Replace any existing code in `Code.gs` with the content of `google-apps-script.js`.
3.  **Deploy the Script**:
    *   Click **Deploy > New Deployment**.
    *   **Select Type**: Click the gear icon next to "Select type" and choose **Web App**.
    *   **Description**: Add a description (e.g., "Comments Backend").
    *   **Execute as**: Select **Me** (your Google account).
    *   **Who has access**: Select **Anyone**.
    *   Click **Deploy**.
    *   **Authorize**: If prompted, authorize the script to access your Google Sheet.
4.  **Copy the Web App URL**: Copy the "Web app URL" provided (it should end in `/exec`).

## 3. Frontend Integration

1.  Open `index.html` in your editor.
2.  Find the `initializeComments` function (around line 731).
3.  Replace the placeholder URL in the `COMMENT_API_URL` variable with your actual Web App URL:
    ```javascript
    const COMMENT_API_URL = 'YOUR_APPS_SCRIPT_WEB_APP_URL_HERE';
    ```

## 4. Testing

1.  Open your news site.
2.  Navigate to any news article.
3.  Try to post a comment.
4.  Verify that:
    *   The comment appears in the comment list.
    *   The comment is added to your Google Sheet.
    *   The comment persists when you refresh the page.

## Notes

-   **CORS**: Google Apps Script handles CORS by redirecting, which modern `fetch` handles automatically.
-   **Rate Limiting**: Google has a daily quota for Apps Script. For consumer accounts, it's roughly 20,000 executions/day.
-   **Security**: This system uses a honeypot field to block simple bots. For advanced spam protection, consider adding a Captcha.
-   **Moderation**: You can moderate comments by manually deleting rows from your Google Sheet.
