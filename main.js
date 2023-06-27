if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const {
  app,
  BrowserWindow,
  ipcMain,
  ipcRenderer
} = require("electron");

const {
  autoUpdater,
  AppUpdater
} = require("electron-updater");

const LoginScreen = require("./screens/login/screen");
const MainScreen = require("./screens/main/screen");
const Globals = require("./globals");
const mongo = require('./mongo');
const fs = require('fs')
const userDataPath = app.getPath('userData');

let curWindow;

//Basic flags
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

function createWindow(type) {
  if (type === 'login') {
    curWindow = new LoginScreen();
  } else if (type === 'main') {
    curWindow = new MainScreen();
  }
}

app.whenReady().then(async () => {
  const data = `{
    "userId": ""
  }`;

  fs.stat(`${userDataPath}\\userData.json`, function (err, stat) {
    if (err == null) {
      const userData = require(`${userDataPath}\\userData.json`);

      if (userData.userId) {
        createWindow('main');
      } else createWindow('login');
    } else if (err.code === 'ENOENT') {
      fs.writeFile(`${userDataPath}\\userData.json`, data, function (err) {})
      createWindow('login');
    }
  });


  await mongo();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length == 0) createWindow('login');
  });

  autoUpdater.checkForUpdates();
  curWindow.showMessage(`Checking for updates. Current version ${app.getVersion()}`);
});

/*New Update Available*/
autoUpdater.on("update-available", (info) => {
  curWindow.showMessage(`Update available. Current version ${app.getVersion()}`);
  let pth = autoUpdater.downloadUpdate();
  curWindow.showMessage(pth);
});

autoUpdater.on("update-not-available", (info) => {
  curWindow.showMessage(`No update available. Current version ${app.getVersion()}`);
});

/*Download Completion Message*/
autoUpdater.on("update-downloaded", (info) => {
  curWindow.showMessage(`Update downloaded | Please restart app.`);
});

autoUpdater.on("error", (info) => {
  curWindow.showMessage(info);
});




//Global exception handler
process.on("uncaughtException", function (err) {
  console.log(err);
});

app.on("window-all-closed", function () {
  if (process.platform != "darwin") app.quit();
});