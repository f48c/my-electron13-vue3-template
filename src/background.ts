/*
 * @Description:
 * @Version: 1.0
 * @Autor: Bourne
 * @Date: 2022-03-31 14:54:22
 * @LastEditors: Bourne
 * @LastEditTime: 2022-04-12 15:50:22
 */
"use strict";

import {
  app,
  protocol,
  BrowserWindow,
  screen,
  Menu,
  ipcMain,
  dialog,
} from "electron";
import { KeyboardEvent, MenuItemConstructorOptions } from "electron/main";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension, { VUEJS3_DEVTOOLS } from "electron-devtools-installer";
const isDevelopment = process.env.NODE_ENV !== "production";
import { writeFileSync } from "fs";
import path from "path";

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } },
]);
const template: Array<MenuItemConstructorOptions> = [];
async function createWindow() {
  // Create the browser window.
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  win = new BrowserWindow({
    // width: 800,
    // height: 600,
    width,
    height,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: true, //允许页面集成node模块
      contextIsolation: false, //取消跨域限制
      // preload: path.join(__dirname, "preload.js"),
    },
  });
  console.log(
    "nodeIntegration",
    process.env.ELECTRON_NODE_INTEGRATION as unknown as boolean
  );
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    win.loadURL("app://./index.html");
  }
}

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      // await installExtension(VUEJS3_DEVTOOLS);
      // 新增的：安装vue-devtools
      const { session } = require("electron");
      const path = require("path");
      console.log(
        "装载插件vue-devtools",
        path.resolve(__dirname, "../devTools/chrome")
      );
      session.defaultSession.loadExtension(
        path.resolve(__dirname, "../devTools/chrome") //这个是刚刚build好的插件目录
      );
    } catch (e) {
      console.error("Vue Devtools failed to install:", e.toString());
    }
  }
  createWindow();
  //自定义菜单
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", (data) => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}

// 存储文件
let openedFile = "";
ipcMain.on("save-content", (event: unknown, content: string) => {
  if (openedFile.length > 0) {
    // 直接存储到文件中去
    try {
      writeFileSync(openedFile, content);
      console.log("保存成功");
    } catch (error) {
      console.log("保存失败");
    }
  } else {
    const options = {
      title: "保存文件",
      defaultPath: "new.md",
      filters: [{ name: "Custom File Type", extensions: ["md"] }],
    };
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow) {
      dialog
        .showSaveDialog(focusedWindow, options)
        .then((result: Electron.SaveDialogReturnValue) => {
          if (result.filePath) {
            try {
              writeFileSync(result.filePath, content);
              console.log("保存成功");
              openedFile = result.filePath;
            } catch (error) {
              console.log("保存失败");
            }
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }
});

let win = null;
const openFileDialog = async (oldPath: string = app.getPath("desktop")) => {
  console.log("openFileDialog", oldPath);
  if (!win) return oldPath;

  const { canceled, filePaths } = await dialog.showOpenDialog(win, {
    title: "选择保存位置",
    properties: ["openDirectory", "createDirectory"],
    defaultPath: oldPath,
  });

  return !canceled ? filePaths[0] : oldPath;
};
ipcMain.handle("openFileDialog", (event, oldPath?: string) => {
  console.log("ipcMain openFileDialog", oldPath);
  openFileDialog(oldPath);
});
