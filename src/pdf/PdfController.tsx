import pdfjsLibType, {
    PDFDocumentProxy,
} from 'pdfjs-dist';

export type PdfImageDataType = {
    width: number;
    height: number;
    src: string,
};

export default class PdfController {
    static _instance: PdfController | null = null;
    static pdfjsLib: typeof pdfjsLibType | null = null;
    get pdfjsLib() {
        if (PdfController.pdfjsLib === null) {
            const pdfjsLib = require('pdfjs-dist/build/pdf') as typeof pdfjsLibType;
            pdfjsLib.GlobalWorkerOptions.workerSrc = '/js/pdf.worker.js';
            PdfController.pdfjsLib = pdfjsLib;
        }
        return PdfController.pdfjsLib;
    }
    async genPdfImages(pdfPath: string) {
        const loadingTask = this.pdfjsLib.getDocument(pdfPath);
        const pdf = await loadingTask.promise;
        return this._genImages(pdf);
    }
    _genImages(pdf: PDFDocumentProxy) {
        return new Promise<PdfImageDataType[]>((resolve, reject) => {
            const pageNumbers = Array.from(Array(pdf.numPages).keys());
            const promises = pageNumbers.map((pageNumber) => {
                return this._genImage(pdf, pageNumber + 1);
            });
            Promise.all(promises).then(resolve).catch(reject);
        });
    }
    _genImage(pdf: PDFDocumentProxy, pageNumber: number) {
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
                    reject(error);
                });
            });
        });
    }
    static getInstance() {
        if (PdfController._instance === null) {
            PdfController._instance = new PdfController();
        }
        return PdfController._instance;
    }
}
