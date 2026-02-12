/**
 * AccountManager.gs - Account Management Module
 * 
 * This module handles all Google Ads account CRUD operations.
 * 
 * EXPORTS:
 * - getEnabledAccounts()
 * - getAllAccountsForFrontend(token)
 * - getAccountForFrontend(customerId, token)
 * - saveAccount(accountData, existingCustomerId, token)
 * - deleteAccount(customerId, token)
 * - updateAccountStatus(customerId, status, lastRun)
 * - batchUpdateAccountStatus(customerIds, enabled, token)
 */

// ============================================================================
// ACCOUNT CRUD OPERATIONS
// ============================================================================

/**
 * Get all enabled accounts (for automation workflows)
 * @returns {Array} List of enabled accounts
 */
function getEnabledAccounts() {
  const accounts = supabaseRequest('accounts?enabled=eq.true', 'GET');
  
  return accounts.map(row => {
    const driveIdsStr = row.drive_code_comments || '';
    const driveIds = driveIdsStr.includes('drive.google.com') || driveIdsStr.includes('/folders/') 
      ? driveIdsStr.split(',').map(id => id.trim()).filter(id => id !== '')
      : [];
      
    return {
      customerId: row.customer_id,
      googleSheetLink: row.google_sheet_link,
      driveCodeComments: row.drive_code_comments,
      driveIds: driveIds,
      lastRun: row.last_run,
      status: row.status,
      workflow: row.workflow || 'workflow-0'
    };
  });
}

/**
 * Get all accounts for frontend display (with access control)
 * @param {string} token - Auth token
 * @returns {Array} List of accounts user has access to
 */
function getAllAccountsForFrontend(token) {
  try {
    const user = validateToken(token);
    if (!user) throw new Error('Unauthorized');

    // Always fetch fresh data (no caching) to ensure correct filtering per user
    const allAccounts = supabaseSelect('accounts');
    
    // Filter based on user access
    const filtered = allAccounts.filter(acc => {
      // Managers see everything
      if (user.role === 'Manager') {
        return true;
      }
      
      // Check allowedAccounts
      const allowedList = user.allowedAccounts || [];
      
      // If allowedAccounts contains '*', allow all
      if (allowedList.includes('*')) {
        return true;
      }
      
      // Check if this account ID is in the allowed list
      return allowedList.includes(acc.customer_id);
    });
    
    return filtered.map(acc => ({
      customerId: acc.customer_id,
      googleSheetLink: acc.google_sheet_link,
      driveCodeComments: acc.drive_code_comments,
      enabled: acc.enabled,
      lastRun: acc.last_run,
      status: acc.status || 'Pending',
      createdDate: acc.created_date,
      workflow: acc.workflow || 'workflow-0'
    }));
  } catch (error) {
    throw new Error('Failed to load accounts: ' + error.message);
  }
}

/**
 * Get a single account for frontend display
 * @param {string} customerId - Customer ID
 * @param {string} token - Auth token
 * @returns {Object|null} Account data or null
 */
function getAccountForFrontend(customerId, token) {
  try {
    const user = validateToken(token);
    if (!user) throw new Error('Unauthorized');
    if (!hasAccountAccess(user, customerId)) throw new Error('Access denied');

    const data = supabaseRequest(`accounts?customer_id=eq.${encodeURIComponent(customerId)}`, 'GET');
    if (!data || data.length === 0) return null;
    
    const acc = data[0];
    return {
      customerId: acc.customer_id,
      googleSheetLink: acc.google_sheet_link,
      driveCodeComments: acc.drive_code_comments,
      enabled: acc.enabled,
      lastRun: acc.last_run,
      status: acc.status || 'Pending',
      createdDate: acc.created_date,
      workflow: acc.workflow || 'workflow-0'
    };
  } catch (error) {
    Logger.log('Error in getAccountForFrontend: ' + error.message);
    return null;
  }
}

/**
 * Save (create or update) an account
 * @param {Object} accountData - Account data to save
 * @param {string} existingCustomerId - Existing customer ID (for updates)
 * @param {string} token - Auth token
 * @returns {boolean} Success status
 */
function saveAccount(accountData, existingCustomerId, token) {
  try {
    const user = validateToken(token);
    if (!user) throw new Error('Unauthorized');

    if (user.role !== 'Manager') {
       if (!existingCustomerId || !hasAccountAccess(user, existingCustomerId)) {
          throw new Error('Unauthorized to edit this account');
       }
    }

    const payload = {
      customer_id: accountData.customerId.trim(),
      google_sheet_link: accountData.googleSheetLink.trim(),
      drive_code_comments: accountData.driveCodeComments || '',
      enabled: accountData.enabled,
      workflow: accountData.workflow || 'workflow-0'
    };

    if (existingCustomerId) {
      supabaseRequest(`accounts?customer_id=eq.${encodeURIComponent(existingCustomerId)}`, 'PATCH', payload);
    } else {
      payload.status = 'Pending';
      payload.created_date = new Date().toISOString();
      supabaseRequest('accounts', 'POST', payload);
    }
    
    invalidateCache('accounts'); // Clear cache on mutation
    return true;
  } catch (error) {
    throw new Error('Failed to save account: ' + error.message);
  }
}

/**
 * Delete an account (Manager only)
 * @param {string} customerId - Customer ID to delete
 * @param {string} token - Auth token
 * @returns {boolean} Success status
 */
function deleteAccount(customerId, token) {
  try {
    const user = validateToken(token);
    if (!user || user.role !== 'Manager') throw new Error('Unauthorized');

    supabaseRequest(`accounts?customer_id=eq.${encodeURIComponent(customerId)}`, 'DELETE');
    invalidateCache('accounts'); // Clear cache on mutation
    return true;
  } catch (error) {
    throw new Error('Failed to delete account: ' + error.message);
  }
}

/**
 * Update account status (for automation workflows)
 * @param {string} customerId - Customer ID
 * @param {string} status - New status
 * @param {string} lastRun - Last run timestamp
 */
function updateAccountStatus(customerId, status, lastRun) {
  const payload = { status: status };
  if (lastRun) payload.last_run = lastRun;
  
  supabaseRequest(`accounts?customer_id=eq.${encodeURIComponent(customerId)}`, 'PATCH', payload);
}

/**
 * Batch update account enabled status
 * @param {Array} customerIds - List of customer IDs
 * @param {boolean} enabled - New enabled status
 * @param {string} token - Auth token
 * @returns {Object} Result with success status
 */
function batchUpdateAccountStatus(customerIds, enabled, token) {
  try {
    const user = validateToken(token);
    if (!user) throw new Error('Unauthorized');
    
    // Validate access for all IDs
    if (user.role !== 'Manager') {
      const allowed = user.allowedAccounts || [];
      if (!allowed.includes('*')) {
        for (const id of customerIds) {
           if (!allowed.includes(id)) {
             throw new Error(`Unauthorized access to account ${id}`);
           }
        }
      }
    }

    const payload = { enabled: enabled };
    
    // Construct filter for IN clause properly for Supabase
    const idList = customerIds.map(id => id).join(',');
    supabaseRequest(`accounts?customer_id=in.(${idList})`, 'PATCH', payload);
    
    invalidateCache('accounts');
    return { success: true };
  } catch (error) {
    throw new Error('Batch update failed: ' + error.message);
  }
}
