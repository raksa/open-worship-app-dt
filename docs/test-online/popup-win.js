// ======================Messaging======================
// main screen
window.addEventListener('message', (event) => {
    console.log(event);
}, false);
const win = window.open('https://www.openworship.app/', 'present', 'popup=yes');
win.postMessage({ hello: 'world' }, 'https://www.openworship.app/');

// preset screen
window.addEventListener('message', (event) => {
    console.log(event);
}, false);
window.opener.postMessage({ hello: 'world' }, 'https://www.openworship.app/');

// ======================Monitor======================
// https://stackoverflow.com/questions/16363474/window-open-on-a-multi-monitor-dual-monitor-system-where-does-window-pop-up

// Find Left Boundry of current Window
function FindLeftWindowBoundry() {
    // In Internet Explorer window.screenLeft is the window's left boundry
    if (window.screenLeft) {
        return window.screenLeft;
    }
    // In Firefox window.screenX is the window's left boundry
    if (window.screenX) {
        return window.screenX;
    }
    return 0;
}
window.leftWindowBoundry = FindLeftWindowBoundry;
// Find Left Boundry of the Screen/Monitor
function FindLeftScreenBoundry() {
    // Check if the window is off the primary monitor in a positive axis
    // X,Y                  X,Y                    S = Screen, W = Window
    // 0,0  ----------   1280,0  ----------
    //     |          |         |  ---     |
    //     |          |         | | W |    |
    //     |        S |         |  ---   S |
    //      ----------           ----------
    if (window.leftWindowBoundry() > window.screen.width) {
        return window.leftWindowBoundry() - (window.leftWindowBoundry() - window.screen.width);
    }
    // Check if the window is off the primary monitor in a negative axis
    // X,Y                  X,Y                    S = Screen, W = Window
    // 0,0  ----------  -1280,0  ----------
    //     |          |         |  ---     |
    //     |          |         | | W |    |
    //     |        S |         |  ---   S |
    //      ----------           ----------
    // This only works in Firefox at the moment due to a bug in Internet Explorer opening new windows into a negative axis
    // However, you can move opened windows into a negative axis as a workaround
    if (window.leftWindowBoundry() < 0 && window.leftWindowBoundry() > (window.screen.width * -1)) {
        return (window.screen.width * -1);
    }
    // If neither of the above, the monitor is on the primary monitor whose's screen X should be 0
    return 0;
}
window.leftScreenBoundry = FindLeftScreenBoundry;
const params = [
    'resizable=1',
    'scrollbars=1',
    'fullscreen=0',
    'height=' + window.screen.height,
    'width=' + window.screen.width,
    'screenX=' + window.leftScreenBoundry(),
    'left=' + window.leftScreenBoundry(),
    'toolbar=0',
    'menubar=0',
    'status=1',
];
window.open('https://www.openworship.app/', 'present', params.join(','));

// ======================Onclose======================
const timer = setInterval(() => {
    if (win.closed) {
        clearInterval(timer);
        alert('closed');
    }
}, 1000);
