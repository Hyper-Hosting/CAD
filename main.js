const {
  autoUpdater,
  AppUpdater
} = require('electron-updater');

autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const mongo = require('./mongo');
const path = require('path');
const fs = require('fs');
const {
  app,
  BrowserWindow,
  Menu,
  ipcMain
} = require('electron');

const isDev = process.env.NODE_ENV !== 'production';
const isMac = process.platform === 'darwin';
const userDataPath = app.getPath('userData');

let loginWindow;
let mainWindow;

// Login Window
function createLogInWindow() {
  loginWindow = new BrowserWindow({
    center: true,
    width: 950,
    height: 500,
    icon: `${__dirname}/assets/icons/Icon_256x256.png`,
    resizable: false,
    movable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, './renderer/login/preload.js'),
    },
    frame: false,
    transparent: true
  });

  // Show devtools automatically if in development
  if (isDev) {
    setTimeout(() => {
      loginWindow.webContents.openDevTools();
    }, 1000)
  }

  loginWindow.loadFile(path.join(__dirname, './renderer/login/index.html'));

  // Remove variable from memory
  loginWindow.on('closed', () => (loginWindow = null));
}

// Main Window
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 950,
    height: 500,
    icon: `${__dirname}/assets/icons/Icon_256x256.png`,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, './renderer/main/preload.js'),
    },
  });

  mainWindow.maximize();
  mainWindow.show();

  // Show devtools automatically if in development
  if (isDev) {
    setTimeout(() => {
      mainWindow.webContents.openDevTools();
    }, 1000)
  }

  mainWindow.loadFile(path.join(__dirname, './renderer/main/index.html'));

  // Remove variable from memory
  mainWindow.on('closed', () => (mainWindow = null));
}

// When the app is ready, create the window
app.whenReady().then(async () => {
  const data = `{
    "userId": ""
  }`;

  fs.stat(`${userDataPath}\\userData.json`, function (err, stat) {
    if (err == null) {
      const userData = require(`${userDataPath}\\userData.json`);

      if (userData.userId) {
        createMainWindow();
      } else createLogInWindow();
    } else if (err.code === 'ENOENT') {
      fs.writeFile(`${userDataPath}\\userData.json`, data, function (err) {})
      createLogInWindow();
    }
  });

  await mongo();

  Menu.setApplicationMenu(null);

  autoUpdater.checkForUpdates();
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  if (!isMac) app.quit();
});

// Open a window if none are open (macOS)
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createLogInWindow();
});


const ip = require('ip')
const cadLogInSchema = require('./mongo/cadLogIn');

ipcMain.on('logIn:create', async () => {
  await cadLogInSchema.findOneAndUpdate({
    ip: ip.address()
  }, {
    ip: ip.address(),
    loggedIn: false
  }, {
    upsert: true
  })

  const item = await cadLogInSchema.findOne({
    ip: ip.address()
  })

  loginWindow.webContents.send('logIn:done', {
    id: item._id.toString()
  })
})


ipcMain.on('logIn:check', async () => {
  const item = await cadLogInSchema.findOne({
    ip: ip.address(),
    loggedIn: true
  })

  if (item) {
    const userData = require(`${userDataPath}\\userData.json`);
    userData.userId = item.userId;

    fs.writeFile(`${userDataPath}\\userData.json`, JSON.stringify(userData, null, 2), function (err) {});

    await cadLogInSchema.findOneAndDelete({
      ip: ip.address(),
      loggedIn: true
    })

    createMainWindow()
    loginWindow.destroy();
  } else errorLogIn('Failed to log in')
})

function errorLogIn(errorMsg) {
  loginWindow.webContents.send('logIn:error', {
    errorMsg
  })
}