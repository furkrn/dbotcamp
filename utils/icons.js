const states = [ "disabled", "active", "unknown" ];

export const activeState = "active";
export const disabledState = "disabled";
export const unknownState = "unknown";

export function setIcon(state) {
    if (!states.includes(state)) {
        error(`Unkown extension state ${state}`)
    }

    chrome.action.setIcon({
        path: {
        16: `../assets/icons/${state}/icon_16.png`,
        48: `../assets/icons/${state}/icon_48.png`,
        128: `../assets/icons/${state}/icon_128.png`,
    }});

    return state === activeState;
}