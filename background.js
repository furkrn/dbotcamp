import "./background/tabservice.js";
import "./background/pagerefreshservice.js";
import { storageInit } from "./utils/storage.js";

chrome.runtime.onStartup.addListener(async() => storageInit);

chrome.runtime.onInstalled.addListener(() => {
   chrome.storage.local.set({
        autorefresh: true,
        autoswitch: true,
        battles: { },
        includeFree: true,
        interval: 100,
        refreshmin: 10,
        switchmin: 1,
   }); 
});