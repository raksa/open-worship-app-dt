import pdfjsLibType from 'pdfjs-dist';
const pdfjsLib = require('pdfjs-dist/build/pdf') as typeof pdfjsLibType;

pdfjsLib.GlobalWorkerOptions.workerSrc = '/js/pdf.worker.js';

const url = '/pdf/hello-world.pdf';
const loadingTask = pdfjsLib.getDocument(url);
loadingTask.promise.then((pdf) => {
  const pageNumber = 1;
  pdf.getPage(pageNumber).then(function (page) {
    const scale = 1.5;
    const viewport = page.getViewport({ scale: scale });
    // Prepare canvas using PDF page dimensions
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (context === null) {
      return;
    }
    const root = document.getElementById('root');
    if (root === null) {
      return;
    }
    const rootDiv = root as HTMLDivElement;
    rootDiv.innerHTML = '';
    rootDiv.appendChild(canvas);
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    // Render PDF page into canvas context
    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };
    const renderTask = page.render(renderContext);
    renderTask.promise.then(() => {
      console.log('Page rendered');
    });
  });
}, (error) => {
  console.error(error);
});
