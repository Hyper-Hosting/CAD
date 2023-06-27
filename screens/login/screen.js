const {
  app,
  BrowserWindow,
  ipcMain,
  globalShortcut
} = require("electron");
const path = require("path");
const fs = require('fs')
const ip = require('ip')
const cadLogInSchema = require('../../mongo/cadLogIn')
const userDataPath = app.getPath('userData');
const MainScreen = require("../main/screen");

class LoginScreen {
  window;

  position = {
    width: 950,
    height: 500,
    maximized: false,
  };

  constructor() {
    this.window = new BrowserWindow({
      width: this.position.width,
      height: this.position.height,
      title: "SALRP CAD",
      show: false,
      removeMenu: true,
      acceptFirstMouse: true,
      autoHideMenuBar: true,
      frame: false,
      transparent: true,
      resizable: false,
      webPreferences: {
        contextIsolation: true,
        preload: path.join(__dirname, "./preload.js"),
      },
    });

    this.window.once("ready-to-show", () => {
      this.window.show();

      if (this.position.maximized) {
        this.window.maximize();
      }
    });

    this.handleMessages();

    let wc = this.window.webContents;
    // wc.openDevTools();

    this.window.loadFile("./screens/login/index.html");
  }

  showMessage(message) {
    this.window.webContents.send("updateMessage", message);
  }

  close() {
    this.window.close();
    ipcMain.removeAllListeners();
  }

  hide() {
    this.window.hide();
  }

  handleMessages() {
    //Ipc functions go here.

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
      
      this.window.webContents.send('logIn:done', {
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
    
        new MainScreen()
        this.window.destroy();
      } else errorLogIn('Failed to log in')
    })
  }
}

module.exports = LoginScreen;