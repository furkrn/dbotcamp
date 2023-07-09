import { saveChanges, storage, storageInit } from "../utils/storage.js";
import { banditLink, popupPort } from "../utils/link.js";

const includeFreeCheckBox = document.getElementById('includeFree');
const includePaidCheckBox = document.getElementById('includePay');
const includeAutoRefresh = document.getElementById('includeAutoRefresh');

const minBox = document.getElementById('payminbox');
const maxBox = document.getElementById('paymaxbox');
const intervalBox = document.getElementById('intervalbox');
const refreshBox = document.getElementById('refreshbox');

const paidRanges = document.querySelectorAll(".paidRanges");
const tabRefresh = document.querySelector(".tabRefresh");

const minRange = document.getElementById('payminrange');
const maxRange = document.getElementById('paymaxrange');
const intervalRange = document.getElementById('interval');
const refreshRange = document.getElementById('refresh');

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

function onPaidBattleCheck() {
    const checked = includePaidCheckBox.checked;
    showHidePaidRanges(checked);
    storage.includePaid = checked;

    saveChanges();
}

function showHidePaidRanges(checked) {
    for (const paidRange of paidRanges) {
        if (checked) {
            paidRange.removeAttribute('hidden');
        }
        else {
            paidRange.setAttribute('hidden', 'hidden');
        }
    }
}

function onfreeBattleCheck() {
    storage.includeFree = includeFreeCheckBox.checked;
    saveChanges();
}

function onAutoRefreshCheck() {
    const checked = includeAutoRefresh.checked;
    showHideAutoRefreshElements(checked);
    storage.autorefresh = checked;
    saveChanges();
}

function showHideAutoRefreshElements(checked) {
    if (checked) {
        tabRefresh.removeAttribute('hidden');
    }
    else {
        tabRefresh.setAttribute('hidden', 'hidden');
    }
}

async function loadPopupChanges() {
    await storageInit;
    const paid = storage.includePaid;
    includePaidCheckBox.checked = paid;
    if (paid) {
        showHidePaidRanges(paid);
    }

    const autorefresh = storage.autorefresh;
    includeAutoRefresh.checked = autorefresh;
    if (autorefresh) {
        showHideAutoRefreshElements(autorefresh);
    }

    includeFreeCheckBox.checked = storage.includeFree;
    minBox.value = minRange.value = storage.minimumFee;
    maxBox.value = maxRange.value = storage.maximumFee;
    intervalBox.value = intervalRange.value = storage.interval;
    refreshBox.value = refreshRange.value = storage.refreshmin;
}

document.getElementById('openbandit').addEventListener('click', () => window.open(banditLink));
document.getElementById('disableEnableButton').addEventListener('click', disableEnable);
document.getElementById('disableAllButton').addEventListener('click', () => popopPort.postMessage({ action: "disableAll" }));
document.getElementById('enableAllButton').addEventListener('click', () => popopPort.postMessage({ action: "enableAll" }));

minRange.addEventListener('change', () => onValueChange(minBox, minRange, (val) => storage.minimumFee = val));
maxRange.addEventListener('change', () => onValueChange(maxBox, maxRange, (val) => storage.maximumFee = val));
intervalRange.addEventListener('change', () => onValueChange(intervalBox, intervalRange, (val) => storage.interval = val));
refreshRange.addEventListener('change', () => onValueChange(refreshBox, refreshRange, (val) => storage.refreshmin = val));

minBox.addEventListener('change', () => onValueChange(minRange, minBox, (val) => storage.minimumFee = val));
maxBox.addEventListener('change', () => onValueChange(maxBox, maxRange, (val) => storage.maximumFee = val));
intervalBox.addEventListener('change', () => onValueChange(intervalRange, intervalBox, (val) => storage.interval = val));
refreshBox.addEventListener('change', () => onValueChange(refreshRange, refreshBox, (val) => storage.refreshmin = val));

document.getElementById('reset').addEventListener('click', clearValues);
document.getElementById('history').addEventListener('click', createHistory);

includePaidCheckBox.addEventListener('change', onPaidBattleCheck);
includeFreeCheckBox.addEventListener('change', onfreeBattleCheck);
includeAutoRefresh.addEventListener('change', onAutoRefreshCheck);

loadPopupChanges();
