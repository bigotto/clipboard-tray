const { app, Menu, Tray, nativeImage, clipboard, MenuItem, shell} = require('electron')
const Store = require('./store.js');

const image = nativeImage.createFromPath('imageTemplate.png')
const trayIcon = image.resize({ width: 16 });
trayIcon.setTemplateImage(true);

const store = new Store({
  configName: 'user-preferences',
});

store.set('clipboard-history', [
  { 
    label: 'bruno',
    type: 'normal', 
    click: () => { clipboard.writeText('bruno')}, 
    accelerator: process.platform === 'darwin' ? 'Alt+Cmd+I' : 'Alt+Shift+I',
  },
  {
    label: '', 
    icon: image.resize({height: 50, width: 50}),
    type: 'normal',
  },
  {
    type: 'separator',
  }
]);

clipboardHistory = store.get('clipboard-history');

const buildHistory = (history, setContextMenu) => {
  return history.map((item, index) => {
    return setContextMenu.insert(index, new MenuItem(item))
  })
}

function clearHistory() {
  clipboardHistory = []
  store.set('clipboard-history', clipboardHistory)
  tray.setContextMenu(contextMenu)
}

let tray = null
app.whenReady().then(() => {
  tray = new Tray(trayIcon);
  const contextMenu = Menu.buildFromTemplate([
    // { type: 'separator'},
    { label: 'Clear History', type: 'normal', enabled: Boolean(true), click: () => clearHistory()},
    { type: 'separator'},
    { label: 'Quit', role: 'quit', accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Alt+Shift+I', }
  ]);

  tray.setToolTip('This is my application.');
  tray.setContextMenu(contextMenu);

  buildHistory(clipboardHistory, contextMenu);
  tray.setContextMenu(contextMenu);
})

app.dock.hide()
