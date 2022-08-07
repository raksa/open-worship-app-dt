import { useRef, useEffect } from 'react';
import { usePMEvents } from './presentHelpers';

function getImageDim(src: string) {
    return new Promise<[number, number]>((resolve, reject) => {
        const img = document.createElement('img');
        img.src = src;
        img.onload = () => {
            resolve([img.naturalWidth, img.naturalHeight]);
        };
        img.onerror = () => {
            reject(new Error('Fail to load image:' + src));
        };
    });
}
async function initPosition(element: HTMLImageElement | null) {
    if (element === null || element.parentElement === null) {
        return;
    }
    const parentElement = element.parentElement;
    try {
        const parentWidth = parentElement.clientWidth;
        const parentHeight = parentElement.clientHeight;
        const [imageWidth, imageHeight] = await getImageDim(element.src);
        const scale = Math.max(parentWidth / imageWidth,
            parentHeight / imageHeight);
        const newImageWidth = imageWidth * scale;
        const newImageHeight = imageHeight * scale;
        const offsetH = (newImageWidth - parentWidth) / 2;
        const offsetV = (newImageHeight - parentHeight) / 2;
        element.style.transform = `translate(-${offsetH}px, -${offsetV}px)`;
        element.width = newImageWidth;
    } catch (error) {
        console.log(error);
    }
}
export default function PresentBackgroundImage({ src }: {
    src: string,
}) {
    const myRef = useRef<HTMLImageElement>(null);
    useEffect(() => {
        initPosition(myRef.current);
    });
    usePMEvents(['resize'], undefined, () => {
        initPosition(myRef.current);
    });
    return (
        <img ref={myRef} src={src} />
    );
}
