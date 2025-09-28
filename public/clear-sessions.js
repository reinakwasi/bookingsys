// Immediate session cleaner - run this in browser console to clear all admin sessions
console.log('🧹 CLEARING ALL ADMIN SESSIONS...');

// Clear localStorage
const localKeys = [];
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key && (key.includes('admin') || key.includes('auth') || key.includes('session'))) {
    localKeys.push(key);
  }
}

localKeys.forEach(key => {
  console.log('🗑️ Removing from localStorage:', key);
  localStorage.removeItem(key);
});

// Clear sessionStorage
const sessionKeys = [];
for (let i = 0; i < sessionStorage.length; i++) {
  const key = sessionStorage.key(i);
  if (key && (key.includes('admin') || key.includes('auth') || key.includes('session'))) {
    sessionKeys.push(key);
  }
}

sessionKeys.forEach(key => {
  console.log('🗑️ Removing from sessionStorage:', key);
  sessionStorage.removeItem(key);
});

console.log('✅ ALL ADMIN SESSIONS CLEARED!');
console.log('🔄 Reloading page...');
window.location.reload();
