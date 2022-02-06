import { FileSourceType } from '../helper/fileHelper';

export default class FileController {
    _fileSource: FileSourceType;
    constructor(fileSource: FileSourceType) {
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
