import pdfjsLibType, {
    PDFDocumentProxy,
} from 'pdfjs-dist';

export type PDFImageData = {
    width: number;
    height: number;
    src: string,
};

export default class PDFManager {
    static _instance: PDFManager | null = null;
    static pdfjsLib: typeof pdfjsLibType | null = null;
    get pdfjsLib() {
        if (PDFManager.pdfjsLib === null) {
            const pdfjsLib = require('pdfjs-dist/build/pdf') as typeof pdfjsLibType;
            pdfjsLib.GlobalWorkerOptions.workerSrc = '/js/pdf.worker.js';
            PDFManager.pdfjsLib = pdfjsLib;
        }
        return PDFManager.pdfjsLib;
    }
    async genPDFImages(pdfPath: string) {
        const loadingTask = this.pdfjsLib.getDocument(pdfPath);
        const pdf = await loadingTask.promise;
        return this._genImages(pdf);
    }
    _genImages(pdf: PDFDocumentProxy) {
        return new Promise<PDFImageData[]>((resolve, reject) => {
            const pageNumbers = Array.from(Array(pdf.numPages).keys());
            const promises = pageNumbers.map((pageNumber) => {
                return this._genImage(pdf, pageNumber + 1);
            });
            Promise.all(promises).then(resolve).catch(reject);
        });
    }
    _genImage(pdf: PDFDocumentProxy, pageNumber: number) {
        return new Promise<PDFImageData>((resolve, reject) => {
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
        if (PDFManager._instance === null) {
            PDFManager._instance = new PDFManager();
        }
        return PDFManager._instance;
    }
}
