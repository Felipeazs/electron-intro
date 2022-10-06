const path = require('path')
const os = require('os')
const fs = require('fs')
const resizeImg = require('resize-img')
const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron')

const isDev = process.env.NODE_ENV !== 'production'
const isMac = process.platform === 'darwin'

//Create a window
let mainWindow
function createMainWindow() {
    mainWindow = new BrowserWindow({
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


    mainWindow.on('closed',()=> (mainWindow = null) )

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

//respnd to ipcRender
ipcMain.on('image:resize', (e, options) => {
    options.dest = path.join(os.homedir(), 'imageresizer')
    resizeImage(options)
})

async function resizeImage({ imgPath, width, height, dest }) {
    try {
        const newPath = await resizeImg(fs.readFileSync(imgPath), {
            width: +width,
            height: +height
        })

        const filename = path.basename(imgPath)

        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest)
        }


        fs.writeFileSync(path.join(dest, filename), newPath)

        mainWindow.webContents.send('image:done')
        shell.openPath(dest)

    } catch (err) {
    }

}

app.on('window-all-closed', () => {
    if (!isMac) {
        app.quit()
    }
})
