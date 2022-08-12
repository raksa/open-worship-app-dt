'use strict';

const { ipcRenderer } = require('electron');
document.onkeydown = function (evt) {
    evt = evt || window.event;
    var isEscape = false;
    if ('key' in evt) {
        isEscape = (evt.key === 'Escape' || evt.key === 'Esc');
    } else {
        isEscape = (evt.keyCode === 27);
    }
    if (isEscape && !removeClassName('selected').length) {
        closeWin();
    }
};
function getRendered() {
    return {
        background: !!getShadow('background').innerHTML,
        foreground: !!getShadow('foreground').innerHTML,
        fullText: !!getFullText().innerHTML,
        alert: !!getShadow('alert').innerHTML,
    };
}
ipcRenderer.on('app:present:get-rendering-info', (event, arg) => {
    const rendered = getRendered();
    ipcRenderer.send(arg, rendered);
});

function closeWin() {
    ipcRenderer.send('present:app:hide-present');
}
function getFullText() {
    return document.getElementById('full-text');
}
function getShadow(id) {
    const element = document.getElementById(id);
    return element.shadowRoot ? element.shadowRoot : element.attachShadow({ mode: 'open' });
}
function backup() {
    localStorage.setItem('backup', JSON.stringify({
        background: getShadow('background').innerHTML || '',
        foreground: getShadow('foreground').innerHTML || '',
        fullText: getFullText().innerHTML || '',
        alert: getShadow('alert').innerHTML || '',
    }));
}
function removeClassName(className) {
    const targets = document.getElementsByClassName(className);
    const arrChildren = Array.from(targets);
    arrChildren.forEach((target) => {
        target.classList.remove(className);
    });
    return arrChildren;
}
function resetClassName(blockId, className, isAdd) {
    const currentBlocks = document.querySelectorAll(`[data-highlight="${blockId}"]`);
    Array.from(currentBlocks).forEach((currentBlock) => {
        if (isAdd) {
            currentBlock.classList.add(className);
        } else {
            currentBlock.classList.remove(className);
        }
    });
}
function addHighlightEvent() {
    const spans = document.getElementsByClassName('highlight');
    Array.from(spans).forEach((span) => {
        span.addEventListener('mouseover', function () {
            resetClassName(this.dataset.highlight, 'hover', true);
        });
        span.addEventListener('mouseout', function () {
            resetClassName(this.dataset.highlight, 'hover', false);
        });
        span.addEventListener('click', function () {
            const arrChildren = removeClassName('selected');
            if (!~arrChildren.indexOf(this)) {
                resetClassName(this.dataset.highlight, 'selected', true);
            }
        });
    });
}
function muteVideos() {
    const bgShadow = getShadow('background');
    Array.from(bgShadow.querySelectorAll('video')).forEach((video) => {
        video.muted = true;
    });
}
function restore() {
    try {
        const data = JSON.parse(localStorage.getItem('backup'));
        getShadow('background').innerHTML = data.background || '';
        getShadow('foreground').innerHTML = data.foreground || '';
        getFullText().innerHTML = data.fullText || '';
        getShadow('alert').innerHTML = data.alert || '';
        addHighlightEvent();
        muteVideos();
    } catch (error) { }
}
function clearOldBackground() {
    setTimeout(() => {
        const background = getShadow('background');
        Array.from(background.children).reverse().forEach((e, i) => {
            if (i !== 0) {
                background.removeChild(e);
            }
        });
    }, 3e3);
}
function onLoad() {
    restore();
    document.addEventListener('wheel', function (e) {
        if (e.ctrlKey && getRendered().fullText) {
            const isUp = e.deltaY < 0;
            ipcRenderer.send('present:app:ctrl-scrolling', isUp);
        }
    });
    document.addEventListener('keyup', function (e) {
        if ((e.ctrlKey || e.altKey)
            && ~['ArrowLeft', 'ArrowRight'].indexOf(e.key)
            && getRendered().fullText) {
            const isNext = e.key === 'ArrowRight';
            ipcRenderer.send('present:app:change-bible', isNext);
        }
    });
    document.body.style.backgroundColor = 'transparent';
}
