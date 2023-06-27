const {
  app,
  BrowserWindow,
  ipcMain,
  globalShortcut
} = require("electron");
const path = require("path");

class MainScreen {
  window;

  position = {
    width: 950,
    height: 500,
    maximized: true,
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

    this.window.loadFile("./screens/main/index.html");
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
  }
}

module.exports = MainScreen;