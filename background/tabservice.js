import { setIcon, activeState, disabledState, unknownState } from '../utils/icons.js';
import { saveChanges, storage } from '../utils/storage.js';

const pageStatuses = new Map();

function setAllDisabledState(disabled) {
    storage.disabled = disabled;
    saveChanges();
}

function ondisableEnableTab(response) {
    if (response.action !== "disableEnableState") {
        return;
    }

    console.log("aaa")
    const id = response.tabId;
    console.log(id);
    if (!pageStatuses.has(id)) {
        return;
    }

    const pageStatus = pageStatuses.get(id);
    pageStatus.disabled = !pageStatus.disabled;

    chrome.tabs.reload(id);
}

function setAll(response) {
    let disabled;
    switch (response.action) {
        case "disableAll":
            disabled = true;
            break;
        case "enableAll":
            disabled = false;
            break;
        default:
            return;
    };

    for (const [tabId, pageStatus] of pageStatuses.entries())
    {
        pageStatus.disabled = disabled;
        chrome.tabs.reload(tabId);
    }
}


function onContentLoad(response, sender, sendResponse) {
    if (response.action !== "contentLoad") {
        return;
    }

    const id = sender.tab.id;
    if (!pageStatuses.has(id)) {
        pageStatuses.set(id, {
            disabled: false,
        });
    }

    console.log(id);

    const pageState = pageStatuses.get(id);
    const extensionDisabled = pageState.disabled;

    console.log(pageState);
    const iconState = extensionDisabled ? disabledState : activeState;
    setIcon(iconState);

    sendResponse({ extensionDisabled });
}

function onPageRemove(tabId, _removeInfo) {
    if (pageStatuses.has(tabId)) {

        if (pageStatuses.size === 1) {
            const state = pageStatuses.get(tabId);
            setAllDisabledState(state.disabled);
        }
        pageStatuses.delete(tabId);
    }
}

function onPageSwitch(tab) {
    const id = tab.tabId;
    if (pageStatuses.has(id)) {
        const pageStatus = pageStatuses.get(id);
        const iconState = pageStatus.disabled ? disabledState : activeState;

        setIcon(iconState)
    }
    else {
        setIcon(unknownState);
    }
}

chrome.runtime.onMessage.addListener(onContentLoad);
chrome.runtime.onConnect.addListener(function (port) {
    if (port.name === "popupMessaging") {
        port.onMessage.addListener(ondisableEnableTab);
        port.onMessage.addListener(setAll);
    }
})
chrome.tabs.onActivated.addListener(onPageSwitch);
chrome.tabs.onRemoved.addListener(onPageRemove);