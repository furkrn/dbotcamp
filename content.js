var lastOpenedLink = "";

function joinBattle() {
    const nodes = document.querySelectorAll(".chat-message");

    const lastNode = nodes[nodes.length - 1];
    const lastMessage = lastNode.querySelector(".message-content");
    const messageToken = lastMessage.querySelector(".message-token");

    if (messageToken !== null) {
        const redirectLink = messageToken.href;

        if (redirectLink.includes("crate-battles") && redirectLink !== lastOpenedLink) {
            window.open(redirectLink);
            lastOpenedLink = redirectLink;
        }
    }
}

setInterval(joinBattle, 1000);

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "loadBanditCamp") {
    chrome.tabs.create({url: "https://www.banditcamp.com"});
  }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "loadContentScript") {
    chrome.tabs.executeScript(sender.tab.id, {file: "content.js"});
  }
});
