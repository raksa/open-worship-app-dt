import { useEffect, useState } from 'react';
import PdfController, {
    PdfImageDataType,
} from './pdf/PdfController';
import PdfItemViewer from './pdf/PdfItemViewer';
import appProvider from './server/appProvider';

function usePdfImage(pdfPath: string) {
    const [images, setImages] = useState<PdfImageDataType[] | null>(null);
    useEffect(() => {
        if (images === null) {
            const pdfManager = PdfController.getInstance();
            pdfManager.genPdfImages(pdfPath).then((images) => {
                setImages(images);
            }).catch((error) => {
                setImages([]);
                console.log(error);

                appProvider.appUtils.handleError(error);
            });
        }
    }, [images, pdfPath]);
    return images === null ? [] : images;
}

export default function AppPdfTest() {
    const images = usePdfImage('/pdf/hello-world.pdf');
    return (
        <PdfItemViewer images={images} />
    );
}
