import { setIcon, activeState, disabledState, unknownState } from '../utils/icons.js';
import { popupPort, contentPort } from '../utils/link.js';
import { saveChanges, storage } from '../utils/storage.js';

function setAllDisabledState(disabled) {
    storage.disabled = disabled;
    saveChanges();
}

async function ondisableEnableTab(response, sendingPort) {
    if (response.action !== "disableEnableState") {
        return;
    }

    const id = response.tabId;
    console.log(id);
    await setSessionPages(function (pagesMap) {
        if (!(id in pagesMap)) {
            return false;
        }
    
        const pageStatus = pagesMap[id];
        pageStatus.disabled = !pageStatus.disabled;
    
        chrome.tabs.reload(id);
        respondWithState(sendingPort, pageStatus.disabled);
        return true;
    });
}

async function setAll(response, sendingPort) {
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

        respondWithState(sendingPort, disabled);
        return true;
    });
}

async function onContentLoad(response, sendingPort) {
    if (response.action !== "contentLoad") {
        return;
    }

    const tabId = sendingPort.sender.tab.id;
    const result = await chrome.storage.local.get([ 'interval' ]);
    const interval = result.interval;
    
    await setSessionPages(function (pagesMap) {
        if (!(tabId in pagesMap)) {
            pagesMap[tabId] = { disabled: false, id: tabId };
        }
    
        const pageState = pagesMap[tabId];
        console.log(pageState);
        const extensionDisabled = pageState.disabled;
    
        const iconState = extensionDisabled ? disabledState : activeState;
        setIcon(iconState);
        
        sendingPort.postMessage({ extensionDisabled, action: 'sendState', interval });        
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

function respondWithState(sendingPort, pageState) {
    sendingPort.postMessage({ action: 'respondWithState', pageState });
}

async function setSessionPages(pageSetterFn) {
    await chrome.storage.session.get(['pages'], function(result) {
        let pagesMap = result.pages;
        if (!pagesMap) {
            pagesMap = { };
        }

        const fnResult = pageSetterFn(pagesMap);
        if (fnResult !== undefined && fnResult) {
            chrome.storage.session.set({ pages: pagesMap });
        }
    });
}

//chrome.runtime.onMessage.addListener(onContentLoad);
chrome.runtime.onConnect.addListener(function (port) {
    if (port.name === popupPort) {
        port.onMessage.addListener(ondisableEnableTab);
        port.onMessage.addListener(setAll);
    }
    else if (port.name === contentPort) {
        port.onMessage.addListener(onContentLoad);
    }
})
chrome.tabs.onActivated.addListener(onPageSwitch);
chrome.tabs.onRemoved.addListener(onPageRemove);
chrome.runtime.onStartup.addListener(() => chrome.storage.session.set({ pages: { }}));