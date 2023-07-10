let pages = [ ];

function refreshAllPages() {
    for (const page of pages) {
        if (!page.disabled) {
            chrome.tabs.reload(page.id);
        }
    }
}

function switchPages() {
    chrome.storage.session.get([ 'switched' ])
        .then(result => {
            if (pages.length <= 1) {
                return;
            }

            let switched = result.switched ?? 0;
            if (switched === pages.length - 1) {
               switched = 0; 
            }
            else {
                switched++;
            }

            const nextPage = pages[switched];
            console.log(switched);
            console.log(pages);
            console.log(nextPage);

            chrome.tabs.update(nextPage.id, { selected: true });
            chrome.storage.session.set({ switched });
        })
}

async function changeService(changes, area, serviceid, minutes, used, fn, getFn, setFn) {
    if (area !== 'local' || !(minutes in changes) && !(used in changes)) {
        return;
    }

    const values = await chrome.storage.session.get[ serviceid ];
    let intervalid = getFn(values);
    if (intervalid !== null) {
        clearInterval(intervalid);
    }

    const localValues = await chrome.storage.local.get([ minutes, used ]);
    const canBe = localValues[used];
    if (canBe) {
        const newInterval = localValues[minutes] * 60000;
        intervalid = setInterval(fn, newInterval);
        setFn(intervalid);
    }
}

chrome.storage.onChanged.addListener(async (changes, area) => {
    await changeService(changes, area, 'refreshserviceid', 'refreshmin', 'autorefresh', refreshAllPages, getserviceid, setserviceid);
    function getserviceid(results) {
        return results?.refreshserviceid;
    }
    function setserviceid(refreshserviceid) {
        chrome.storage.session.set({ refreshserviceid });
    }
});

chrome.storage.onChanged.addListener(async (changes, area) => {
    await changeService(changes, area, 'switchserviceid', 'switchmin', 'autoswitch', switchPages, getserviceid, setserviceid);
    function getserviceid(results) {
        return results?.switchserviceid;
    }
    function setserviceid(switchserviceid) {
        chrome.storage.session.set({ switchserviceid });
    }
});

chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "session" || !('pages' in changes)) {
        return;
    }

    const newValue = changes.pages?.newValue;
    pages = Array.from(Object.values(newValue));
});

chrome.storage.local.get([ 'refreshmin', 'switchmin', 'autorefresh', 'autoswitch' ])
    .then((result) => {
        if (result.autorefresh) {
            const interval = result.refreshmin * 60000;
            const refreshserviceid = setInterval(refreshAllPages, interval);
            chrome.storage.session.set({ refreshserviceid });
        }
        if (result.autorefresh) {
            const interval = result.switchmin * 60000;
            const switchserviceid = setInterval(switchPages, interval);
            chrome.storage.session.set({ switchserviceid });
        }
    });
