const { app, BrowserWindow } = require('electron');
const path = require('node:path');
function createWindow() {
  const window = new BrowserWindow({ width: 1000, height: 800, minWidth: 650, minHeight: 700, backgroundColor: '#101820', webPreferences: { nodeIntegration: false, contextIsolation: true, backgroundThrottling: false } });
  window.setMenuBarVisibility(false);
  window.loadFile(path.join(__dirname, '../dist/index.html'));
}
app.whenReady().then(() => { createWindow(); app.on('activate', () => { if (!BrowserWindow.getAllWindows().length) createWindow(); }); });
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
