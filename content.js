const battles = [ ];

function joinBattle() {
  const nodes = document.querySelectorAll(".message-token, .href");
  const lastNode = nodes[nodes.length - 1];
  const redirectLink = lastNode.href;

  if (redirectLink !== undefined && redirectLink.includes("crate-battles") && !battles.includes(redirectLink)) {
    const openWindow = window.open(redirectLink);
		if (openWindow) { 
			battles.push(redirectLink);
		}
    else {
      alert("disable your popup & redirect blocker or you will be sad :(");
      return;
    }

    handleOpenWindow(openWindow);
  }
}

function enableSpecifiedExtension(response) {
  if (response.action !== "sendState") {
    return;
  }
  const disabled = response.extensionDisabled;
  console.log(`Extension disabled == ${disabled}`)
  if (!disabled) {
    setInterval(joinBattle, 100);
  }
}

function handleOpenWindow(openWindow) {
  openWindow.addEventListener('load', async () => {
    let state;
    if (canJoin(openWindow.document)) {
      console.log("joinable -free- battle found!");

      const buttons = openWindow.document.querySelectorAll(".empty-ctn");
      const specifiedNumber = getRandom(buttons.length);
      const button = buttons[specifiedNumber];
  
      clickButton(button);
      state = 'JOINED';
    }
    else {
      openWindow.close();
      state = 'NOT_FREE'
    }

    await appendValue(openWindow.location, state);
  });
}

async function appendValue(url, state) {
  await chrome.storage.local.get(['battles'], function(result) {
    let entries = result.battles;
    if (!entries) {
      entries = { };
    };

    entries[url] = state;

    chrome.storage.local.set({ 'battles': entries });
  });
}

// Special thanks to https://stackoverflow.com/questions/55059006/simulate-a-real-human-mouse-click-in-pure-javascript#comment131936413_55068681
function clickButton(theButton) {
  var box = theButton.getBoundingClientRect(),
  coordX = box.left + (box.right - box.left) / 2,
  coordY = box.top + (box.bottom - box.top) / 2;

  theButton.dispatchEvent(new MouseEvent("click", {
    view: window,
    bubbles: true,
    cancelable: true,
    clientX: coordX,
    clientY: coordY,
    button: 0
  }));
}

function canJoin(document) {
  const nullableGamePrice = document.querySelector(".game-price") 
  return nullableGamePrice !== null // it's not great but will help.
    ? nullableGamePrice.getElementsByTagName("span")[0].innerText === 'Free'
    : false;
}

function getRandom(max) {
  return Math.floor(Math.random() * max);
}

const contentScriptPort = chrome.runtime.connect({ name: "contentPort" });
contentScriptPort.postMessage({ action: "contentLoad" });
contentScriptPort.onMessage.addListener(enableSpecifiedExtension);