var lastOpenedLink = "";

function joinBattle() {
  const nodes = document.querySelectorAll(".message-token, .href");
  const lastNode = nodes[nodes.length - 1];
  const redirectLink = lastNode.href;

  if (redirectLink !== undefined && redirectLink.includes("crate-battles") && redirectLink !== lastOpenedLink) {
    const openWindow = window.open(redirectLink);
		if (openWindow) { 
			lastOpenedLink = redirectLink;
		}
    else {
      alert("disable your popup & redirect blocker or you will be sad :(");
      return;
    }

    handleOpenWindow(openWindow);
  }
}

function enableSpecifiedExtension(response) {
  const disabled = response.extensionDisabled;
  console.log(`Extension disabled == ${disabled}`)
  if (!disabled) {
    setInterval(joinBattle, 100);
  }
}

function handleOpenWindow(openWindow) {
  openWindow.addEventListener('load', () => {
    if (!canJoin(openWindow.document)) {
      openWindow.close();
      return;
    }

    console.log("joinable -free- battle found!");

    const buttons = openWindow.document.querySelectorAll(".empty-ctn");
    const specifiedNumber = getRandom(buttons.length);
    const button = buttons[specifiedNumber];

    clickButton(button);
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

chrome.runtime.sendMessage({ action: "contentLoad" }, enableSpecifiedExtension);