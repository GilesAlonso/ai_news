/**
 * Google Apps Script for custom comment system
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a Google Sheet
 * 2. Add columns: Date, Author, Comment, Timestamp, ID
 * 3. Go to Extensions > Apps Script
 * 4. Paste this code and save
 * 5. Deploy > New Deployment > Web App
 * 6. Set "Execute as: Me" and "Who has access: Anyone"
 * 7. Copy the Web App URL for use in index.html
 * 
 * CORS CONFIGURATION:
 * After updating this code, you MUST redeploy the web app:
 * 1. Deploy > Manage deployments
 * 2. Edit the active deployment  
 * 3. Click "Deploy" to apply the changes
 * 
 * IMPORTANT: The frontend must use JSONP (callback parameter) for cross-origin requests.
 * Update your frontend fetch call to include a callback parameter, e.g.:
 *   fetch('https://.../exec?callback=handleResponse&date=2026-03-31')
 *   Or use a CORS proxy
 */

const SHEET_NAME = 'Sheet1'; // Change if your sheet has a different name

/**
 * Handle GET requests - retrieve comments
 * Supports JSONP via callback parameter for CORS
 */
function doGet(e) {
  const date = e.parameter.date;
  const callback = e.parameter.callback; // JSONP callback function name
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  
  const comments = data
    .filter(row => !date || row[0] === date)
    .map(row => {
      let obj = {};
      headers.forEach((header, i) => {
        obj[header.toLowerCase()] = row[i];
      });
      return obj;
    })
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Newest first

  const jsonString = JSON.stringify(comments);
  
  // If callback is provided, return JSONP format
  if (callback) {
    return ContentService.createTextOutput(`${callback}(${jsonString})`)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  
  // Otherwise return regular JSON
  return ContentService.createTextOutput(jsonString)
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle POST requests - add new comment
 */
function doPost(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    const { date, author, comment, website } = params;
    
    // Honeypot check for spam prevention
    if (website) {
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Spam detected' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (!date || !author || !comment) {
      throw new Error('Missing required fields');
    }
    
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    const timestamp = new Date().toISOString();
    const id = Utilities.getUuid();
    
    sheet.appendRow([date, author, comment, timestamp, id]);
    
    return ContentService.createTextOutput(JSON.stringify({ 
      status: 'success', 
      comment: { date, author, comment, timestamp, id } 
    }))
    .setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 
      status: 'error', 
      message: error.toString() 
    }))
    .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle OPTIONS preflight requests for CORS
 * This allows the browser to make cross-origin requests
 */
function doOptions(e) {
  const output = ContentService.createTextOutput('');
  output.setMimeType(ContentService.MimeType.TEXT);
  return output;
}
