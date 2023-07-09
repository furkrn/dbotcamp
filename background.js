import "./background/tabservice.js";
import "./background/pagerefreshservice.js";
import { storageInit } from "./utils/storage.js";

chrome.runtime.onStartup.addListener(async() => storageInit);