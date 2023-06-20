var lastOpenedLink = "";

function joinBattle() {
  const nodes = document.querySelectorAll(".chat-message");
  const lastNode = nodes[nodes.length - 1];
  const lastMessage = lastNode.querySelector(".message-content");
  const messageToken = lastMessage.querySelector(".message-token");

  if (messageToken !== null) {
    const redirectLink = messageToken.href;

    if (redirectLink.includes("crate-battles") && redirectLink !== lastOpenedLink) {
      const handled = window.open(redirectLink);
			if (handled) { 
				lastOpenedLink = redirectLink;
			}
      else {
        alert("disable your popup & redirect blocker or you will be sad :(");
      }
    }
  }
}

function enableSpecifiedExtension(response) {
  const disabled = response.extensionDisabled;
  console.log(`Extension disabled == ${disabled}`)
  if (!disabled) {
    setInterval(joinBattle, 1000);
  }
}

// Special thanks to https://stackoverflow.com/questions/55059006/simulate-a-real-human-mouse-click-in-pure-javascript#comment131936413_55068681
function simulateMouseEvent(element, eventName, coordX, coordY) {
  element.dispatchEvent(new MouseEvent(eventName, {
    view: window,
    bubbles: true,
    cancelable: true,
    clientX: coordX,
    clientY: coordY,
    button: 0
  }));
}

function clickButton() {
  var theButton = document.querySelector(".v-btn");

  var box = theButton.getBoundingClientRect(),
  coordX = box.left + (box.right - box.left) / 2,
  coordY = box.top + (box.bottom - box.top) / 2;

  simulateMouseEvent(theButton, "click", coordX, coordY)
}

chrome.runtime.sendMessage({ action: "contentLoad" }, enableSpecifiedExtension);