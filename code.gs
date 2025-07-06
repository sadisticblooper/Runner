function getSheet() {
  const spreadsheetId = 'YOUR_SPREADSHEET_ID1';
  const ss = SpreadsheetApp.openById(spreadsheetId);
  const sheet = ss.getSheetByName('Diary') || ss.insertSheet('Diary');
  
  // Initialize headers if needed
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Date', 'Content', 'Timestamp']);
  }
  return sheet;
}

function getAllEntries() {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  const result = {};
  
  for (let i = 1; i < data.length; i++) {
    let date = data[i][0];
    if (date instanceof Date) {
      date = Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    }
    if (date) {
      result[date] = {
        content: data[i][1] || '',
        timestamp: data[i][2] || ''
      };
    }
  }
  return result;
}

function saveDiaryEntry(params) {
  const {date, entry} = params;
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
  
  for (let i = 1; i < data.length; i++) {
    let sheetDate = data[i][0];
    if (sheetDate instanceof Date) {
      sheetDate = Utilities.formatDate(sheetDate, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    }
    if (sheetDate === date) {
      sheet.getRange(i+1, 2).setValue(entry);
      sheet.getRange(i+1, 3).setValue(timestamp);
      return {status: 'Updated', timestamp};
    }
  }
  
  sheet.appendRow([date, entry, timestamp]);
  return {status: 'Saved', timestamp};
}

function deleteDiaryEntry(params) {
  const {date} = params;
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    let sheetDate = data[i][0];
    if (sheetDate instanceof Date) {
      sheetDate = Utilities.formatDate(sheetDate, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    }
    if (sheetDate === date) {
      sheet.deleteRow(i+1);
      return {status: 'Deleted'};
    }
  }
  return {status: 'Not found'};
}

function searchEntries(params) {
  const {keyword} = params;
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  const results = [];
  const searchTerm = keyword.toLowerCase();
  
  for (let i = 1; i < data.length; i++) {
    const content = (data[i][1] || '').toString().toLowerCase();
    if (content.includes(searchTerm)) {
      let date = data[i][0];
      if (date instanceof Date) {
        date = Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd');
      }
      results.push({
        date,
        content: data[i][1],
        timestamp: data[i][2]
      });
    }
  }
  return results;
}
