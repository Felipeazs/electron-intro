const path = require('path')
const { app, BrowserWindow, Menu } = require('electron')

const isDev = process.env.NODE_ENV !== 'production'
const isMac = process.platform === 'darwin'

//Create a window
function createMainWindow() {
    const mainWindow = new BrowserWindow({
        title: 'Image Resizer',
        width: isDev ? 1000 : 500,
        height: 600,

        webPreferences: {
            contextIsolation: true,
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js')
        }
    })

    if (isDev) {
        mainWindow.webContents.openDevTools()
    }

    mainWindow.loadFile(path.join(__dirname, './renderer/index.html'))
}

// Create about window
function createAboutWindow() {

    const aboutWindow = new BrowserWindow({
        title: 'About Image Resizer',
        width: 300,
        height: 300,
    })
    aboutWindow.loadFile(path.join(__dirname, './renderer/about.html'))
}


app.whenReady().then(() => {
    createMainWindow()


    const mainMenu = Menu.buildFromTemplate(menu)
    Menu.setApplicationMenu(mainMenu)

    app.on('active', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createMainWindow()
        }
    })
})

// menu template
const menu = [
    ...(isMac ? [{    //on mac
        label: app.name,
        submenu: [{
            label: 'About',
            click: createAboutWindow

        }]
    }] : []),
    {
        role: 'fileMenu' // Creates a quit menu
    },
    ...(!isMac ? [{   //on Windows
        label: "Help",
        submenu: [{
            label: "About",
            click: createAboutWindow
        }],
    }] : [])
]


app.on('window-all-closed', () => {
    if (!isMac) {
        app.quit()
    }
})
