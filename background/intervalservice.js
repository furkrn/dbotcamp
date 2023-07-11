import { contentPort as port } from "../utils/link.js";

async function setIntervalChanges(changes, area) {
    if (area !== 'local' || !('interval' in changes)) {
        return;
    }

    console.log('interval change');

    const pagesResult = await chrome.storage.session.get([ 'pages' ]);
    for (const page of Object.values(pagesResult.pages)) {
        const interval = changes.interval?.newValue;
        const contentPort = chrome.tabs.connect(page.id, { name: port });
        contentPort.postMessage({ interval, action: 'intervalChange' });
    }
}

chrome.storage.onChanged.addListener(setIntervalChanges);