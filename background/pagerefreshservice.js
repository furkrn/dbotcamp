let pages = { };

function refreshAllPages() {
    for (const [_, page] of Object.entries(pages)) {
        if (!page.disabled) {
            chrome.tabs.reload(page.id);
        }
    }
}

chrome.storage.onChanged.addListener(async (changes, area) => {
    if (area !== "local" || !('refreshmin' in changes) && !('autorefresh' in changes)) {
        return;
    }

    const values = await chrome.storage.session.get([ 'refreshserviceid' ]);
    let refreshserviceid = values.refreshserviceid;
    if (refreshserviceid !== null) {
        clearInterval(refreshserviceid);
    }

    const localvalues = await chrome.storage.local.get([ 'refreshmin', 'autorefresh' ]);
    const autoRefresh = localvalues.autorefresh;
    if (autoRefresh) {
        const newInterval = localvalues.refreshmin * 60000;
        refreshserviceid = setInterval(refreshAllPages, newInterval);
        chrome.storage.session.set({ refreshserviceid });
    }
});

chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "session" || !('pages' in changes)) {
        return;
    }

    pages = changes.pages?.newValue;
});

chrome.storage.local.get([ 'refreshmin', 'autorefresh' ])
    .then((result) => {
        if (result.autorefresh) {
            const interval = result.refreshmin * 60000;
            const refreshserviceid = setInterval(refreshAllPages, interval);
            chrome.storage.session.set({ refreshserviceid });
        }
    });
