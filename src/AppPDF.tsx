import { useEffect, useState } from 'react';
import PDFManager, {
    PDFImageData,
} from './pdf/PDFManager';
import PDFViewer from './pdf/PDFViewer';
import appProvider from './server/appProvider';

function usePDFImage(pdfPath: string) {
    const [images, setImages] = useState<PDFImageData[] | null>(null);
    useEffect(() => {
        if (images === null) {
            const pdfManager = PDFManager.getInstance();
            pdfManager.genPDFImages(pdfPath).then((images) => {
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

export default function AppPDF() {
    const images = usePDFImage('/pdf/hello-world.pdf');
    return (
        <PDFViewer images={images} />
    );
}
