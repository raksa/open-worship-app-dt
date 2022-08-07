import { useEffect, useRef } from 'react';
import { usePMEvents } from './presentHelpers';

function getVideoDim(src: string) {
    return new Promise<[number, number]>((resolve, reject) => {
        const video = document.createElement('video');
        video.addEventListener('loadedmetadata', () => {
            resolve([video.videoWidth, video.videoHeight]);
        }, false);
        video.onerror = () => {
            reject(new Error('Fail to load video:' + src));
        };
        video.src = src;
    });
}
async function initPosition(element: HTMLVideoElement | null) {
    if (element === null || element.parentElement === null) {
        return;
    }
    const parentElement = element.parentElement;
    try {
        const parentWidth = parentElement.clientWidth;
        const parentHeight = parentElement.clientHeight;
        const [videoWidth, videoHeight] = await getVideoDim(element.src);
        const scale = Math.max(parentWidth / videoWidth,
            parentHeight / videoHeight);
        const newVideoWidth = videoWidth * scale;
        const newVideoHeight = videoHeight * scale;
        const offsetH = (newVideoWidth - parentWidth) / 2;
        const offsetV = (newVideoHeight - parentHeight) / 2;
        element.style.transform = `translate(-${offsetH}px, -${offsetV}px)`;
        element.width = newVideoWidth;
    } catch (error) {
        console.log(error);
    }
}
export default function PresentBackgroundVideo({ src }: {
    src: string,
}) {
    const myRef = useRef<HTMLVideoElement>(null);
    useEffect(() => {
        initPosition(myRef.current);
    });
    usePMEvents(['resize'], undefined, () => {
        initPosition(myRef.current);
    });
    return (
        <video src={src}
            ref={myRef}
            autoPlay loop muted playsInline />
    );
}
