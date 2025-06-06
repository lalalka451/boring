#!/usr/bin/env node

/**
 * Script to export game data from Google Sheets to JSON files
 * 
 * Usage:
 *   node scripts/export-sheets.js
 * 
 * Environment variables:
 *   GOOGLE_SHEETS_API_KEY - Google Sheets API key
 *   GOOGLE_SHEETS_ID - The ID of the Google Sheets document
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const CONFIG = {
  apiKey: process.env.GOOGLE_SHEETS_API_KEY,
  sheetId: process.env.GOOGLE_SHEETS_ID,
  outputDir: path.join(__dirname, '../src/data'),
  sheets: {
    eras: 'Eras',
    resources: 'Resources', 
    buildings: 'Buildings',
    achievements: 'Achievements'
  }
};

/**
 * Fetch data from Google Sheets API
 */
function fetchSheetData(sheetName) {
  return new Promise((resolve, reject) => {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.sheetId}/values/${sheetName}?key=${CONFIG.apiKey}`;
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.error) {
            reject(new Error(result.error.message));
          } else {
            resolve(result.values || []);
          }
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

/**
 * Convert sheet rows to JSON objects
 */
function rowsToObjects(rows) {
  if (rows.length < 2) return {};
  
  const headers = rows[0];
  const objects = {};
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const obj = {};
    
    for (let j = 0; j < headers.length; j++) {
      const header = headers[j];
      const value = row[j] || '';
      
      // Parse different data types
      if (value === '') {
        obj[header] = undefined;
      } else if (value === 'TRUE' || value === 'true') {
        obj[header] = true;
      } else if (value === 'FALSE' || value === 'false') {
        obj[header] = false;
      } else if (!isNaN(value) && value !== '') {
        obj[header] = Number(value);
      } else if (value.startsWith('{') || value.startsWith('[')) {
        try {
          obj[header] = JSON.parse(value);
        } catch {
          obj[header] = value;
        }
      } else {
        obj[header] = value;
      }
    }
    
    // Use the first column as the key (usually 'id')
    const key = row[0];
    if (key) {
      objects[key] = obj;
    }
  }
  
  return objects;
}

/**
 * Export a single sheet to JSON file
 */
async function exportSheet(sheetName, fileName) {
  try {
    console.log(`Exporting ${sheetName}...`);
    
    const rows = await fetchSheetData(sheetName);
    const objects = rowsToObjects(rows);
    
    const filePath = path.join(CONFIG.outputDir, `${fileName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(objects, null, 2));
    
    console.log(`✓ Exported ${Object.keys(objects).length} items to ${fileName}.json`);
    return objects;
  } catch (error) {
    console.error(`✗ Failed to export ${sheetName}:`, error.message);
    throw error;
  }
}

/**
 * Validate exported data
 */
function validateExportedData(data) {
  const issues = [];
  
  // Check for required fields
  Object.entries(data.resources || {}).forEach(([id, resource]) => {
    if (!resource.name || !resource.icon) {
      issues.push(`Resource ${id} missing name or icon`);
    }
  });
  
  Object.entries(data.buildings || {}).forEach(([id, building]) => {
    if (!building.name || !building.icon || !building.era) {
      issues.push(`Building ${id} missing required fields`);
    }
  });
  
  if (issues.length > 0) {
    console.warn('Validation issues found:');
    issues.forEach(issue => console.warn(`  - ${issue}`));
  } else {
    console.log('✓ All exported data passed validation');
  }
  
  return issues.length === 0;
}

/**
 * Main export function
 */
async function main() {
  if (!CONFIG.apiKey || !CONFIG.sheetId) {
    console.error('Missing required environment variables:');
    console.error('  GOOGLE_SHEETS_API_KEY - Your Google Sheets API key');
    console.error('  GOOGLE_SHEETS_ID - The ID of your Google Sheets document');
    process.exit(1);
  }
  
  try {
    console.log('Starting Google Sheets export...');
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(CONFIG.outputDir)) {
      fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    }
    
    // Export all sheets
    const exportedData = {};
    for (const [key, sheetName] of Object.entries(CONFIG.sheets)) {
      exportedData[key] = await exportSheet(sheetName, key);
    }
    
    // Validate the exported data
    validateExportedData(exportedData);
    
    console.log('✓ Export completed successfully!');
    
  } catch (error) {
    console.error('Export failed:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { exportSheet, rowsToObjects, validateExportedData };
