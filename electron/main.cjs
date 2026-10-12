const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const fs = require('node:fs/promises');
let writeQueue = Promise.resolve();
function registerStorage() {
  const file = path.join(app.getPath('userData'), 'focus-beat-data.json');
  ipcMain.handle('focus-beat:read', async () => {
    try { return JSON.parse(await fs.readFile(file, 'utf8')); } catch (error) { if (error.code === 'ENOENT') return null; throw new Error('Saved data could not be read'); }
  });
  ipcMain.handle('focus-beat:write', async (_event, data) => {
    if (!data || ![1,2].includes(data.schemaVersion)) throw new Error('Invalid data');
    const json = JSON.stringify(data);
    if (Buffer.byteLength(json) > 10 * 1024 * 1024) throw new Error('Data is too large; export a backup');
    writeQueue = writeQueue.catch(() => {}).then(async () => {
      await fs.mkdir(path.dirname(file), { recursive: true });
      try { await fs.copyFile(file, file + '.bak'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
      await fs.writeFile(file + '.tmp', json, 'utf8');
      await fs.rename(file + '.tmp', file);
    });
    await writeQueue;
  });
}
function createWindow() {
  const window = new BrowserWindow({ width: 1120, height: 1040, minWidth: 650, minHeight: 700, backgroundColor: '#0c1019', webPreferences: { preload: path.join(__dirname, 'preload.cjs'), nodeIntegration: false, contextIsolation: true, backgroundThrottling: false } });
  window.setMenuBarVisibility(false);
  window.loadFile(path.join(__dirname, '../dist/index.html'));
}
app.whenReady().then(() => { registerStorage(); createWindow(); app.on('activate', () => { if (!BrowserWindow.getAllWindows().length) createWindow(); }); });
app.on('window-all-closed', () => { if (process.platform !== 'darwin') writeQueue.then(() => app.quit(), () => app.quit()); });
