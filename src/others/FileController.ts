import FileSource from '../helper/FileSource';

export default class FileController {
    _fileSource: FileSource;
    constructor(fileSource: FileSource) {
        this._fileSource = fileSource;
    }
    get basePath() {
        return this._fileSource.basePath;
    }
    get fileName() {
        return this._fileSource.fileName;
    }
    get filePath() {
        return this._fileSource.filePath;
    }
    get fileSrc() {
        return this._fileSource.src;
    }
}
