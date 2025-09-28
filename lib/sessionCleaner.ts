// Session Cleaner Utility
// Use this to clear all admin sessions and force fresh login

export function clearAllAdminSessions() {
  console.log('🧹 Clearing all admin sessions...');
  
  // Clear localStorage
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('admin') || key.includes('auth') || key.includes('session'))) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => {
    console.log('🗑️ Removing:', key);
    localStorage.removeItem(key);
  });
  
  // Clear sessionStorage as well
  const sessionKeysToRemove: string[] = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && (key.includes('admin') || key.includes('auth') || key.includes('session'))) {
      sessionKeysToRemove.push(key);
    }
  }
  
  sessionKeysToRemove.forEach(key => {
    console.log('🗑️ Removing from session:', key);
    sessionStorage.removeItem(key);
  });
  
  console.log('✅ All admin sessions cleared');
}

export function forceLogout() {
  clearAllAdminSessions();
  window.location.href = '/admin/login';
}
