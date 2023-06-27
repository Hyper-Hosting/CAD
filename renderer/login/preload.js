const os = require('os');
const path = require('path');
const {
  contextBridge,
  ipcRenderer
} = require('electron');
const Toastify = require('toastify-js');
const DiscordOauth2 = require('discord-oauth2');

contextBridge.exposeInMainWorld('os', {
  homedir: () => os.homedir(),
});

contextBridge.exposeInMainWorld('path', {
  join: (...args) => path.join(...args),
});

contextBridge.exposeInMainWorld('ipcRenderer', {
  send: (channel, data) => ipcRenderer.send(channel, data),
  on: (channel, func) =>
    ipcRenderer.on(channel, (event, ...args) => func(...args)),
});

contextBridge.exposeInMainWorld('Toastify', {
  toast: (options) => Toastify(options).showToast(),
});

contextBridge.exposeInMainWorld('Process', {
  env: (item) => process.env[item],
  generateAuthUrl: (id) => new DiscordOauth2({
    clientId: process.env.clientId,
    clientSecret: process.env.clientSecret
  }).generateAuthUrl({
    scope: ["identify", "guilds", "guilds.members.read"],
    state: id,
    redirectUri: `http://localhost:4000/cad-log-in`
    // redirectUri: `https://salrp.hyperhostings.com/cad-log-in`
  }),
})

contextBridge.exposeInMainWorld('shell', {
  openExternal: (url) => require('electron').shell.openExternal(url),
})