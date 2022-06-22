module.exports = {
  pluginOptions: {
    electronBuilder: {
      // preload: 'src/preload.js',
      nodeIntegration: true,
      // 添加的设置
      builderOptions: {
        appId: 'my-electron13-vue3-template',
        productName: 'my-electron13-vue3-template', // 应用的名字
        copyright: 'Copyright © 2021' //版权声明
        // mac: {
        //   icon: './public/icon.icns' // icon
        // }
      }
    }
  }
}
