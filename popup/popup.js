import { saveChanges, storage } from "../utils/storage.js";
import { banditLink } from "../utils/link.js";

const includeFreeCheckBox = document.getElementById('includeFree');
const includePaidCheckBox = document.getElementById('includePay');

const minLabel = document.getElementById('payminlabel');
const maxLabel = document.getElementById('paymaxlabel');
const intervalLabel = document.getElementById('intervallabel');

const paidRanges = document.querySelectorAll(".paidRanges");

const minRange = document.getElementById('payminrange');
const maxRange = document.getElementById('paymaxrange');
const intervalRange = document.getElementById('interval');

const saveLabel = document.getElementById('savelabel');

const popopPort = chrome.runtime.connect({ name: "popupMessaging" });

function notImplemented() { alert('not Implemented'); }

function setElementsState() {
    includeFreeCheckBox.checked = storage.includeFree;
    const includePaid = staoge.includePaid;
    includePaidCheckBox.checked = includePaid;
    if (includePaid) {
        minRange.value = storage.minRange,
        maxRange.value = storage.maxRange;
    }

    intervalRange.value = storage.intervalRange;
    console.log(`Elements changed thanks to : ${result}`)
    saveChanges();
}

async function disableEnable() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true});
    const tabId = tab.id;
    popopPort.postMessage({ tabId, action: "disableEnableState" });
}

function createHistory() {
    notImplemented();
}

function onSliderChange(label, slider) {
    label.innerText = slider.value;
    notImplemented();
}

function resetValues() {
    notImplemented();
}

function onPaidBattleCheck() {
    const checked = includePaidCheckBox.checked;
    for (const paidRange of paidRanges) {
        if (checked) {
            paidRange.removeAttribute('hidden');
        }
        else {
            paidRange.setAttribute('hidden', 'hidden');
        }
    }

    storage.includePaid = checked;

    saveChanges();
}

function onfreeBattleCheck() {
    storage.includeFree = includeFreeCheckBox.checked;
    saveChanges();
}

document.getElementById('openbandit').addEventListener('click', () => window.open(banditLink));
document.getElementById('disableEnableButton').addEventListener('click', disableEnable);
document.getElementById('disableAllButton').addEventListener('click', () => popopPort.postMessage({ action: "disableAll" }));
document.getElementById('enableAllButton').addEventListener('click', () => popopPort.postMessage({ action: "enableAll" }));

minRange.addEventListener('change', () => onSliderChange(minLabel, minRange));
maxRange.addEventListener('change', () => onSliderChange(maxLabel, maxRange));
intervalRange.addEventListener('change', () => onSliderChange(intervalLabel, intervalRange));

document.getElementById('reset').addEventListener('click', resetValues);
document.getElementById('history').addEventListener('click', createHistory);

includePaidCheckBox.addEventListener('change', onPaidBattleCheck);
includeFreeCheckBox.addEventListener('change', onfreeBattleCheck);

window.addEventListener('online', setElementsState);
