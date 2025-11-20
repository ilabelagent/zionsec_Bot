const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

// Simple in-memory store for settings (replace electron-store for now)
const settings = {
  serverPort: 5000,
  httpsPort: 5443,
  theme: 'dark',
  autoStart: false
};

let mainWindow;
let serverProcess;
let isServerRunning = false;

class CyberLabManager {
  constructor() {
    this.isServerRunning = false;
  }

  async startServer() {
    if (this.isServerRunning) return true;

    try {
      const serverPath = path.join(__dirname, '..', 'server.js');
      
      // Check if server.js exists
      if (!fs.existsSync(serverPath)) {
        console.error('Server.js not found at:', serverPath);
        return false;
      }
      
      serverProcess = spawn('node', [serverPath], {
        env: { 
          ...process.env, 
          PORT: settings.serverPort,
          HTTPS_PORT: settings.httpsPort,
          NODE_ENV: 'production'
        },
        cwd: path.join(__dirname, '..'),
        shell: true
      });

      serverProcess.stdout.on('data', (data) => {
        console.log(`[SERVER] ${data.toString()}`);
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('server-log', data.toString());
        }
      });

      serverProcess.stderr.on('data', (data) => {
        console.error(`[SERVER ERROR] ${data.toString()}`);
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('server-error', data.toString());
        }
      });

      serverProcess.on('close', (code) => {
        console.log(`Server process exited with code ${code}`);
        this.isServerRunning = false;
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('server-stopped');
        }
      });

      serverProcess.on('error', (error) => {
        console.error('Failed to start server process:', error);
        this.isServerRunning = false;
      });

      // Wait a bit for server to start
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      this.isServerRunning = true;
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('server-started');
      }
      
      return true;
    } catch (error) {
      console.error('Failed to start server:', error);
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('server-error', error.message);
      }
      return false;
    }
  }

  stopServer() {
    if (serverProcess) {
      try {
        // Kill the process
        if (process.platform === 'win32') {
          spawn('taskkill', ['/pid', serverProcess.pid, '/f', '/t']);
        } else {
          serverProcess.kill('SIGTERM');
        }
        serverProcess = null;
      } catch (error) {
        console.error('Error stopping server:', error);
      }
    }
    this.isServerRunning = false;
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('server-stopped');
    }
  }

  getStatus() {
    return this.isServerRunning;
  }
}

const labManager = new CyberLabManager();

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    icon: path.join(__dirname, '..', 'assets', 'icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    },
    show: false
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Show welcome message on first run
    if (!fs.existsSync(path.join(__dirname, '.initialized'))) {
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'Welcome to GodBrain CyberLab',
        message: 'Professional CEH Training Environment',
        detail: 'This tool is for educational purposes and authorized penetration testing only.',
        buttons: ['I Understand']
      });
      
      // Create initialization marker
      fs.writeFileSync(path.join(__dirname, '.initialized'), '');
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    labManager.stopServer();
  });

  createMenu();
}

function createMenu() {
  const menuTemplate = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Training Session',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            if (mainWindow) mainWindow.webContents.send('new-session');
          }
        },
        {
          label: 'Export Lab Data',
          accelerator: 'CmdOrCtrl+E',
          click: () => {
            if (mainWindow) mainWindow.webContents.send('export-data');
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => app.quit()
        }
      ]
    },
    {
      label: 'Lab',
      submenu: [
        {
          label: 'Start Server',
          accelerator: 'F5',
          click: () => labManager.startServer()
        },
        {
          label: 'Stop Server',
          accelerator: 'Shift+F5',
          click: () => labManager.stopServer()
        },
        { type: 'separator' },
        {
          label: 'Open in Browser',
          accelerator: 'CmdOrCtrl+B',
          click: () => shell.openExternal(`http://localhost:${settings.serverPort}`)
        },
        {
          label: 'Clear Lab Data',
          click: () => {
            if (mainWindow) mainWindow.webContents.send('clear-data');
          }
        }
      ]
    },
    {
      label: 'Tools',
      submenu: [
        {
          label: 'Network Scanner',
          click: () => {
            if (mainWindow) mainWindow.webContents.send('open-tool', 'network-scanner');
          }
        },
        {
          label: 'Payload Generator',
          click: () => {
            if (mainWindow) mainWindow.webContents.send('open-tool', 'payload-generator');
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Documentation',
          click: () => shell.openExternal('https://github.com/godbrain-ai/cyberlab#readme')
        },
        {
          label: 'CEH Training Guide',
          click: () => shell.openExternal('https://www.eccouncil.org/programs/certified-ethical-hacker-ceh/')
        },
        { type: 'separator' },
        {
          label: 'About',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About GodBrain CyberLab',
              message: 'GodBrain CyberLab v2.0.0',
              detail: 'Professional CEH Training Environment\n\nDeveloped by GodBrain AI\nFor educational and authorized testing purposes only.'
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
}

// IPC handlers
ipcMain.handle('start-server', async () => {
  return await labManager.startServer();
});

ipcMain.handle('stop-server', () => {
  labManager.stopServer();
  return true;
});

ipcMain.handle('get-server-status', () => {
  return labManager.getStatus();
});

ipcMain.handle('get-lab-stats', async () => {
  try {
    // Simple fetch implementation for stats
    const http = require('http');
    return new Promise((resolve) => {
      const req = http.get(`http://localhost:${settings.serverPort}/api/stats`, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch {
            resolve({ incidents: 0, sessions: 0, uptime: 0, connections: 0 });
          }
        });
      });
      req.on('error', () => {
        resolve({ incidents: 0, sessions: 0, uptime: 0, connections: 0 });
      });
      req.end();
    });
  } catch {
    return { incidents: 0, sessions: 0, uptime: 0, connections: 0 };
  }
});

ipcMain.handle('get-settings', () => {
  return settings;
});

ipcMain.handle('save-settings', (event, newSettings) => {
  Object.assign(settings, newSettings);
  return true;
});

ipcMain.handle('open-external', (event, url) => {
  shell.openExternal(url);
});

ipcMain.handle('export-lab-data', async () => {
  try {
    const result = await dialog.showSaveDialog(mainWindow, {
      title: 'Export Lab Data',
      defaultPath: `cyberlab-data-${new Date().toISOString().split('T')[0]}.json`,
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (!result.canceled) {
      // Fetch data from server
      const http = require('http');
      const data = await new Promise((resolve) => {
        http.get(`http://localhost:${settings.serverPort}/api/incidents`, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => resolve(data));
        }).on('error', () => resolve('[]'));
      });
      
      fs.writeFileSync(result.filePath, data);
      return { success: true, path: result.filePath };
    }
    return { success: false };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// App event handlers
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    labManager.stopServer();
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  labManager.stopServer();
});

// Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});
