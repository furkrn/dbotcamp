import { saveChanges, storage, storageInit } from "../utils/storage.js";
import { banditLink, popupPort } from "../utils/link.js";

const includeAutoRefresh = document.getElementById('includeAutoRefresh');
const includeAutoSwitch = document.getElementById('includeAutoSwitch');

const intervalBox = document.getElementById('intervalbox');
const refreshBox = document.getElementById('refreshbox');
const switchBox = document.getElementById('switchBox');

const tabRefresh = document.querySelector(".tabRefresh");
const tabSwitch = document.querySelector(".tabSwitch");

const intervalRange = document.getElementById('interval');
const refreshRange = document.getElementById('refresh');
const switchRange = document.getElementById('switch');

const saveLabel = document.getElementById('savelabel');

const popopPort = chrome.runtime.connect({ name: popupPort });

async function disableEnable() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true});
    const tabId = tab.id;
    popopPort.postMessage({ tabId, action: "disableEnableState" });
}

function createHistory() {
    alert('not implemented yet!');
}

function onValueChange(input, changed, storageSelect) {
    const val = changed.value;
    input.value = val;
    storageSelect(val)
    saveChanges();
}

function clearValues() {
    storage.battles = { };
    saveChanges();
    saveLabel.textContent = "Cleared!"
}

function onAutoRefreshCheck() {
    const checked = includeAutoRefresh.checked;
    showHideElements(tabRefresh, checked);
    storage.autorefresh = checked;
    saveChanges();
}

function onAutoSwitchCheck() {
    const checked = includeAutoSwitch.checked;
    showHideElements(tabSwitch, checked);
    storage.autoswitch = checked;
    saveChanges();
}

function showHideElements(element, checked) {
    if (checked) {
        element.removeAttribute('hidden');
    }
    else {
        element.setAttribute('hidden', 'hidden');
    }
}

async function loadPopupChanges() {
    await storageInit;

    const autorefresh = storage.autorefresh;
    includeAutoRefresh.checked = autorefresh;
    if (autorefresh) {
        showHideElements(tabRefresh, autorefresh);
    }

    const autoswitch = storage.autoswitch;
    includeAutoSwitch.checked = autoswitch;
    if (autoswitch) {
        showHideElements(tabSwitch, autoswitch);
    }

    intervalBox.value = intervalRange.value = storage.interval;
    refreshBox.value = refreshRange.value = storage.refreshmin;
    switchBox.value = switchRange.value = storage.switchmin;
}

document.getElementById('openbandit').addEventListener('click', () => window.open(banditLink));
document.getElementById('disableEnableButton').addEventListener('click', disableEnable);
document.getElementById('disableAllButton').addEventListener('click', () => popopPort.postMessage({ action: "disableAll" }));
document.getElementById('enableAllButton').addEventListener('click', () => popopPort.postMessage({ action: "enableAll" }));

intervalRange.addEventListener('change', () => onValueChange(intervalBox, intervalRange, (val) => storage.interval = val));
refreshRange.addEventListener('change', () => onValueChange(refreshBox, refreshRange, (val) => storage.refreshmin = val));
switchRange.addEventListener('change', () => onValueChange(switchBox, switchRange, (val) => storage.switchmin = val));

intervalBox.addEventListener('change', () => onValueChange(intervalRange, intervalBox, (val) => storage.interval = val));
refreshBox.addEventListener('change', () => onValueChange(refreshRange, refreshBox, (val) => storage.refreshmin = val));
switchBox.addEventListener('change', () => onValueChange(switchRange, switchBox, (val) => storage.switchmin = val));

document.getElementById('reset').addEventListener('click', clearValues);
document.getElementById('history').addEventListener('click', createHistory);

includeAutoRefresh.addEventListener('change', onAutoRefreshCheck);
includeAutoSwitch.addEventListener('change', onAutoSwitchCheck);

loadPopupChanges();
