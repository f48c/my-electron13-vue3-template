/*
 * @Description:
 * @Version: 1.0
 * @Autor: Bourne
 * @Date: 2022-03-31 14:50:47
 * @LastEditors: Bourne
 * @LastEditTime: 2022-06-22 10:25:55
 */
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

createApp(App).use(store).use(router).mount("#app");
