import { setIcon, activeState, disabledState, unknownState } from '../utils/icons.js';
import { popupPort } from '../utils/link.js';
import { saveChanges, storage } from '../utils/storage.js';

function setAllDisabledState(disabled) {
    storage.disabled = disabled;
    saveChanges();
}

async function ondisableEnableTab(response) {
    if (response.action !== "disableEnableState") {
        return;
    }

    const id = response.tabId;
    console.log(id);
    await setSessionPages(function (pagesMap) {
        if (!(id in pagesMap)) {
            return false;
        }
    
        console.log('âaaa');
        const pageStatus = pagesMap[id];
        pageStatus.disabled = !pageStatus.disabled;
    
        chrome.tabs.reload(id);
        return true;
    });
}

async function setAll(response) {
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

    await setSessionPages(function (pagesMap) {
        for (const [id, pageStatus] of Object.entries(pagesMap))
        {
            console.log(`${id} ${pageStatus}`);
            pageStatus.disabled = disabled;
    
            chrome.tabs.reload(pageStatus.id);
        }

        return true;
    });
}

async function onContentLoad(response, sender, sendResponse) {
    if (response.action !== "contentLoad") {
        return;
    }

    const tabId = sender.tab.id;
    await setSessionPages(function (pagesMap) {
        if (!(tabId in pagesMap)) {
            pagesMap[tabId] = { disabled: false, id: tabId };
        }
    
        console.log(tabId);
    
        const pageState = pagesMap[tabId];
        const extensionDisabled = pageState.disabled;
    
        console.log(pageState);
        const iconState = extensionDisabled ? disabledState : activeState;
        setIcon(iconState);
    
        sendResponse({ extensionDisabled });
        return true;
    });
}

async function onPageRemove(tabId, _removeInfo) {
    await setSessionPages(function (pagesMap) {
        if (tabId in pagesMap) {
            if (pagesMap.size === 1) {
                const state = pagesMap[tabId];
                setAllDisabledState(state.disabled);
            }
            delete pagesMap[tabId];
            return true;
        }
    });
}

async function onPageSwitch(tab) {
    await setSessionPages(function (pagesMap) {
        const id = tab.tabId;
        if (id in pagesMap) {
            const iconState = pagesMap[id].disabled ? disabledState : activeState;

            setIcon(iconState)
        }
        else {
            setIcon(unknownState);
        }
        return false;
    });
}

async function setSessionPages(pageSetterFn) {
    await chrome.storage.local.get(['pages'], function(result) {
        let pagesMap = result.pages;
        if (!pagesMap) {
            pagesMap = { };
        }

        const fnResult = pageSetterFn(pagesMap);
        if (fnResult !== undefined && fnResult) {
            chrome.storage.local.set({ pages: pagesMap });
        }
    });
}

chrome.runtime.onMessage.addListener(onContentLoad);
chrome.runtime.onConnect.addListener(function (port) {
    if (port.name === popupPort) {
        port.onMessage.addListener(ondisableEnableTab);
        port.onMessage.addListener(setAll);
    }
})
chrome.tabs.onActivated.addListener(onPageSwitch);
chrome.tabs.onRemoved.addListener(onPageRemove);
chrome.runtime.onStartup.addListener(() => chrome.storage.local.set({ pages: { }}));