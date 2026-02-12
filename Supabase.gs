/**
 * Supabase Client for Google Apps Script
 */

const SUPABASE_URL = String(PropertiesService.getScriptProperties().getProperty('SUPABASE_URL') || '').trim().replace(/\/$/, "");
const SUPABASE_KEY = String(PropertiesService.getScriptProperties().getProperty('SUPABASE_KEY') || '').trim();

/**
 * Generic function to make requests to Supabase
 */
function supabaseRequest(endpoint, method, payload) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error('Supabase URL or Key is missing in Script Properties.');
  }

  const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
  const options = {
    method: method,
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation,resolution=merge-duplicates' 
    },
    muteHttpExceptions: true
  };

  if (payload) {
    options.payload = JSON.stringify(payload);
  }

  const response = UrlFetchApp.fetch(url, options);
  const responseCode = response.getResponseCode();
  const responseBody = response.getContentText();

  if (responseCode >= 300) {
    Logger.log(`Error [${responseCode}] ${endpoint}: ${responseBody}`);
    throw new Error(`Supabase Request Failed: ${responseBody}`);
  }

  try {
    return JSON.parse(responseBody);
  } catch (e) {
    return responseBody;
  }
}

/**
 * DB Helper: Upsert data
 * Uses POST with on_conflict query parameter for proper upsert behavior
 * @param {string} table - Table name
 * @param {Object|Array} data - Data to upsert
 * @param {string} onConflict - Optional comma-separated conflict columns (e.g., 'customer_id,campaign_name')
 */
function supabaseUpsert(table, data, onConflict) {
  if (!Array.isArray(data)) data = [data];
  
  // Build endpoint with on_conflict if specified
  let endpoint = table;
  if (onConflict) {
    endpoint = `${table}?on_conflict=${onConflict}`;
  }
  
  return supabaseRequest(endpoint, 'POST', data);
}

/**
 * DB Helper: Update data with filters
 * Uses PATCH for proper update behavior
 * @param {string} table - Table name
 * @param {Object} data - Data to update
 * @param {Object} filters - Key-value pairs for WHERE clause (e.g., {customer_id: '123', campaign_name: 'test'})
 */
function supabaseUpdate(table, data, filters) {
  // Build query string from filters
  const filterParams = Object.entries(filters)
    .map(([key, value]) => `${key}=eq.${encodeURIComponent(value)}`)
    .join('&');
  
  const endpoint = `${table}?${filterParams}`;
  return supabaseRequest(endpoint, 'PATCH', data);
}

/**
 * DB Helper: Check if record exists
 * @param {string} table - Table name  
 * @param {Object} filters - Key-value pairs for WHERE clause
 */
function supabaseExists(table, filters) {
  const filterParams = Object.entries(filters)
    .map(([key, value]) => `${key}=eq.${encodeURIComponent(value)}`)
    .join('&');
  
  const endpoint = `${table}?${filterParams}&select=*&limit=1`;
  const result = supabaseRequest(endpoint, 'GET');
  return result && result.length > 0;
}

/**
 * DB Helper: Select data
 */
function supabaseSelect(table, columns = '*') {
  return supabaseRequest(`${table}?select=${columns}`, 'GET');
}

function FORCE_AUTHORIZE() {
  Logger.log('Triggering authorization...');
  UrlFetchApp.fetch('https://www.google.com');
  Logger.log('Done!');
}

