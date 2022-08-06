import { useState } from 'react';

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
async function initVideoPosition(video: HTMLVideoElement) {
    const parentElement = video.parentElement;
    if (parentElement === null) {
        return null;
    }
    try {
        const parentWidth = parentElement.clientWidth;
        const parentHeight = parentElement.clientHeight;
        const [videoWidth, videoHeight] = await getVideoDim(video.src);
        const scale = Math.max(parentWidth / videoWidth,
            parentHeight / videoHeight);
        const newVideoWidth = videoWidth * scale;
        const newVideoHeight = videoHeight * scale;
        const offsetH = (newVideoWidth - parentWidth) / 2;
        const offsetV = (newVideoHeight - parentHeight) / 2;
        return {
            transform: `translate(-${offsetH}px, -${offsetV}px)`,
            width: `${newVideoWidth}px`,
        };
    } catch (error) {
        console.log(error);
    }
    return null;
}
export default function PresentBackgroundVideo({ src }: {
    src: string,
}) {
    const [transform, setTransform] = useState<string>('');
    const [width, setWidth] = useState<string>('');
    return (
        <video src={src}
            style={{
                transform,
                width,
            }}
            ref={(video) => {
                if (video !== null && transform === '' && width === '') {
                    initVideoPosition(video).then((result) => {
                        if (result !== null) {
                            setTransform(result.transform);
                            setWidth(result.width);
                        }
                    });
                }
            }}
            autoPlay loop muted playsInline />
    );
}
