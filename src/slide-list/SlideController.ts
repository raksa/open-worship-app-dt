import { defaultSlide } from '../editor/slideType';
import { toastEventListener } from '../event/ToastEventListener';
import { getPresentScreenInfo } from '../helper/appHelper';
import {
    checkFileExist,
    createFile,
    deleteFile,
    FileSourceType,
    genFileSource,
    renameFile,
} from '../helper/fileHelper';
import { getSlideItemSelectedSetting, setSlideItemSelectedSetting } from '../helper/settingHelper';

// TODO: implement class
export default class SlideController {
    _fileSource: FileSourceType;
    _isSelected = false;
    constructor(fileSource: FileSourceType) {
        this._fileSource = fileSource;
        const filePathSelected = getSlideItemSelectedSetting();
        this._isSelected = this.filePath === filePathSelected;
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
    get isSelected() {
        return this._isSelected;
    }
    set isSelected(isSelected: boolean) {
        setSlideItemSelectedSetting(isSelected ? this.filePath : '');
        this._isSelected = isSelected;
    }
    deleteFile() {
        return deleteFile(this._fileSource.filePath);
    }
    static createSlideController(basePath: string, slideName: string): SlideController | null {
        if (checkFileExist(basePath, slideName)) {
            toastEventListener.showSimpleToast({
                title: 'Creating Slide',
                message: `Slide file with name: ${slideName} already exist!`,
            });
            return null;
        }
        const dim = getPresentScreenInfo();
        const defaultSlideText = defaultSlide(dim.width, dim.height);
        if (createFile(JSON.stringify(defaultSlideText), basePath, slideName)) {
            const fileSource = genFileSource(basePath, slideName);
            return new SlideController(fileSource);
        } else {
            toastEventListener.showSimpleToast({
                title: 'Creating Slide',
                message: 'Unable to create slide due to internal error',
            });
        }
        return null;
    }
    rename(newFileName: string): boolean {
        if (renameFile(this.basePath, this.fileName, newFileName)) {
            toastEventListener.showSimpleToast({
                title: 'Rename Slide',
                message: `Slide has been renamed to ${newFileName}`,
            });
            return true;
        } else {
            toastEventListener.showSimpleToast({
                title: 'Rename Slide',
                message: 'Unable to rename slide',
            });
        }
        return false;
    }
}