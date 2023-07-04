var extensionDisabled = false;
function onClicked(tab){ 
  let icons;
  extensionDisabled = !extensionDisabled;
  if (extensionDisabled) {
    icons = {
        path:{
      16: "assets/icons/disabled/icon_16.png",
      48: "assets/icons/disabled/icon_48.png",
      128: "assets/icons/disabled/icon_128.png"
    }};
  }
  else {
    icons = {
        path: {
      16: "assets/icons/active/icon_16.png",
      48: "assets/icons/active/icon_48.png",
      128: "assets/icons/active/icon_128.png"
    }};
  }
  
  chrome.action.setIcon(icons);

  if (tab.url !== undefined)
  {
    chrome.tabs.reload(tab.id);
  }
}

function onContentLoadMessage(request, _sender, sendResponse) {
  if (request.action === "contentLoad") {
    sendResponse({ extensionDisabled });
  }
}

chrome.runtime.onMessage.addListener(onContentLoadMessage)
chrome.action.onClicked.addListener(onClicked);