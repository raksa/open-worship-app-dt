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
async function initImagePosition(img: HTMLImageElement) {
    const parentElement = img.parentElement;
    if (parentElement === null) {
        return;
    }
    try {
        const parentWidth = parentElement.clientWidth;
        const parentHeight = parentElement.clientHeight;
        const [imageWidth, imageHeight] = await getImageDim(img.src);
        const scale = Math.max(parentWidth / imageWidth,
            parentHeight / imageHeight);
        const newImageWidth = imageWidth * scale;
        const newImageHeight = imageHeight * scale;
        const offsetH = (newImageWidth - parentWidth) / 2;
        const offsetV = (newImageHeight - parentHeight) / 2;
        img.style.transform = `translate(-${offsetH}px, -${offsetV}px)`;
        img.width = newImageWidth;
    } catch (error) {
        console.log(error);
    }
}
export default function PresentBackgroundImage({ src }: {
    src: string,
}) {
    return (
        <img ref={(img) => {
            if (img !== null) {
                initImagePosition(img);
            }
        }} src={src} />
    );
}
