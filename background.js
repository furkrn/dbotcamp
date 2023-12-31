import "./background/tabservice.js";
import "./background/pageservice.js";
import "./background/intervalservice.js";
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
   chrome.storage.session.set({ pages: { }, 
      refreshserviceid: null, 
      switchserviceid: null 
   });
});