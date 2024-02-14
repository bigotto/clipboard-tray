// @ts-check
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
    content: 'bruno',
    type: 'text',
  },
  {
    content: '',
    type: 'image',
    image: image.toDataURL()
  }
]);

let clipboardHistory = store.get('clipboard-history');

const buildHistory = (history, setContextMenu) => {
  return history.map((item, index) => {
    const clipboardData = {};
    clipboardData[item.type] = item.type == 'image' ? nativeImage.createFromDataURL(item.image): item.content;
    
    return setContextMenu.insert(index, new MenuItem({
      label: item.content,
      type: 'normal',
      icon: item.type == 'image' ? nativeImage.createFromDataURL(item.image).resize({height: 50, width: 50 }): undefined,
      click: () => { clipboard.write(clipboardData) },
      accelerator: process.platform === 'darwin' ? `Alt+Cmd+${index + 1}` : `Alt+Shift+${index + 1}`,
    })
  )
  })
}

function clearHistory() {
  clipboardHistory = []
  store.set('clipboard-history', clipboardHistory)
  app.relaunch();
  app.quit();
}

let tray = null
app.whenReady().then(() => {
  tray = new Tray(trayIcon);
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Clear History', type: 'normal', enabled: Boolean(true), click: () => clearHistory()},
    { type: 'separator'},
    { label: 'Quit', role: 'quit', accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Alt+Shift+I', }
  ]);

  tray.setToolTip('Clipboard Tray');
  tray.setContextMenu(contextMenu);

  if ( clipboardHistory.length ) {
    buildHistory(clipboardHistory, contextMenu);
    tray.setContextMenu(contextMenu);
  }

})

app.dock.hide()
