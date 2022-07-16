import { renderPresent } from './appHelper';

export function renderFG(htmlString: string) {
    renderPresent({
        script: `
const shadow = getShadow('foreground');
shadow.innerHTML = \`${htmlString}\`;
`});
}
export function clearForeground() {
    renderPresent({
        script: `
const shadow = getShadow('foreground');
shadow.innerHTML = '';
    ` });
}

function getBGStyle() {
    return `
ele.style.position = 'absolute';
ele.style.width = '100%';
ele.style.height = '100%';
`;
}

export function renderBGImage(path: string) {
    const src = (new URL(path)).toString();
    renderPresent({
        script: `
const shadow = getShadow('background');
const ele = document.createElement('img');
${getBGStyle()}
ele.src = '${src}';
shadow.appendChild(ele);
clearOldBackground();
` });
}

export function renderBGColor(color: string) {
    renderPresent({
        script: `
const shadow = getShadow('background');
const ele = document.createElement('div');
${getBGStyle()}
ele.style.backgroundColor = '${color}';
shadow.appendChild(ele);
clearOldBackground();
    ` });
}

export function renderBGVideo(src: string) {
    renderPresent({
        script: `
const shadow = getShadow('background');
const ele = document.createElement('video');
${getBGStyle()}
ele.style.objectFit = 'cover';
ele.src = '${src}';
ele.autoplay = true;
ele.loop = true;
ele.playsinline = true;
ele.muted = true;
shadow.appendChild(ele);
clearOldBackground();
` });
}

export function clearBackground() {
    renderPresent({
        script: `
const shadow = getShadow('background');
shadow.innerHTML = '';
` });
}
