/*
 * @Description:
 * @Version: 1.0
 * @Autor: Bourne
 * @Date: 2022-04-01 15:45:03
 * @LastEditors: Bourne
 * @LastEditTime: 2022-04-01 15:45:04
 */
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer
})
