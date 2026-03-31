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
 */

const SHEET_NAME = 'Sheet1'; // Change if your sheet has a different name

function doGet(e) {
  const date = e.parameter.date;
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

  return ContentService.createTextOutput(JSON.stringify(comments))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    const { date, author, comment, website } = params;
    
    // Honeypot check
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
