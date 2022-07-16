import PresentScrollCont from '../full-text-present/PresentScrollCont';
import { capturePresentScreen } from '../helper/appHelper';

let domImg: HTMLImageElement | null = null;
async function renderCapture() {
    const data = await capturePresentScreen();
    if (domImg) {
        if (data !== null) {
            if (domImg.src !== data) {
                domImg.src = data;
            }
            setTimeout(() => {
                window.requestAnimationFrame(renderCapture);
            }, 1e3 / 24);
        }
    }
}
export default function PresentScreenPreviewer() {
    return (
        <>
            <img className='captured-present-screen image-in' alt='preview'
                ref={(dom) => {
                    domImg = dom;
                    renderCapture();
                }} />
            <div className='scroll-controller w-100'>
                <PresentScrollCont />
            </div>
        </>
    );
}
