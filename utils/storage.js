export const storage = { };

export const storageInit = chrome.storage.local.get()
    .then((result) => Object.assign(storage, result));

export function saveChanges() {
    chrome.storage.local.set(storage);
}