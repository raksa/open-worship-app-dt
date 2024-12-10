import pdfJsLibType, { PDFDocumentProxy } from 'pdfjs-dist';

export type PdfImageDataType = {
    width: number;
    height: number;
    src: string,
};

function getPdfJsLib() {
    return new Promise<typeof pdfJsLibType>((resolve, reject) => {
        const checkPdfJsLib = (waitCount: number) => {
            if (--waitCount <= 0) {
                return reject(new Error('Fail to load pdfjsLib'));
            }
            const pdfjsLib = (window as any).pdfjsLib;
            if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
                pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
            }
            if (pdfjsLib) {
                return resolve(pdfjsLib);
            }
            setTimeout(checkPdfJsLib, 1e3);
        };
        checkPdfJsLib(20);
    });
}
let instance: PdfController | null = null;
export default class PdfController {
    async genPdfImages(pdfPath: string) {
        const pdfjsLib = await getPdfJsLib();
        const loadingTask = pdfjsLib.getDocument(pdfPath);
        const pdf = await loadingTask.promise;
        const pdfImageDataList = await this.genImages(pdf);
        return pdfImageDataList;
    }
    private genImages(pdf: PDFDocumentProxy) {
        return new Promise<PdfImageDataType[]>((resolve, reject) => {
            const pageNumbers = Array.from(Array(pdf.numPages).keys());
            const promises = pageNumbers.map((pageNumber) => {
                return this.genImage(pdf, pageNumber + 1);
            });
            Promise.all(promises).then(resolve).catch(reject);
        });
    }
    private genImage(pdf: PDFDocumentProxy, pageNumber: number) {
        return new Promise<PdfImageDataType>((resolve, reject) => {
            pdf.getPage(pageNumber).then((page) => {
                const viewport = page.getViewport({ scale: 1 });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                if (context === null) {
                    return reject(new Error('Fail init canvas'));
                }
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                const renderContext = {
                    canvasContext: context,
                    viewport: viewport,
                };
                const renderTask = page.render(renderContext);
                renderTask.promise.then(() => {
                    const dataURL = canvas.toDataURL();
                    resolve({
                        width: viewport.width,
                        height: viewport.height,
                        src: dataURL,
                    });
                }).catch((error) => {
                    reject(new Error(error));
                });
            });
        });
    }
    static getInstance() {
        if (instance === null) {
            instance = new PdfController();
        }
        return instance;
    }
}
