import "./background/tabservice.js";
import "./background/pagerefreshservice.js";
import { storageInit } from "./utils/storage.js";

chrome.runtime.onStartup.addListener(async() => storageInit);

chrome.runtime.onInstalled.addListener(() => {
   chrome.storage.local.set({
        autorefresh: true,
        battles: { },
        includeFree: true,
        includePaid: false,
        interval: 100,
        maximumFee: 0,
        minimumFee: 0,
        refreshmin: 10,
   }); 
});