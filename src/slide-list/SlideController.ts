import { defaultSlide } from '../helper/slideHelper';
import { slideListEventListenerGlobal } from '../event/SlideListEventListener';
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
import { getSetting, getSlideItemSelectedSetting, setSlideItemSelectedSetting } from '../helper/settingHelper';
import FileController from '../others/FileController';
import { THUMB_SELECTED_SETTING_NAME } from '../slide-presenting/SlideThumbsController';
import { parseSlideItemThumbSelected } from '../helper/helpers';

export default class SlideController extends FileController {
    _isSelected = false;
    constructor(fileSource: FileSourceType) {
        super(fileSource);
        const filePathSelected = getSlideItemSelectedSetting();
        this._isSelected = this.filePath === filePathSelected;
    }
    get isSelected() {
        return this._isSelected;
    }
    set isSelected(isSelected: boolean) {
        if (isSelected) {
            setSlideItemSelectedSetting(this.filePath);
            slideListEventListenerGlobal.selecting();
        } else {
            setSlideItemSelectedSetting('');

        }
        this._isSelected = isSelected;
    }
    get isThumbSelected() {
        const slideItemThumbSelected = getSetting(THUMB_SELECTED_SETTING_NAME, '');
        const parsed = parseSlideItemThumbSelected(slideItemThumbSelected, this.filePath);
        return !!parsed;
    }
    deleteFile() {
        const isDeleted = deleteFile(this._fileSource.filePath);
        toastEventListener.showSimpleToast({
            title: 'Deleting Slide',
            message: isDeleted ? 'Slide name: ' + this.fileName + ' have been deleted' :
                'Unable to create slide due to internal error',
        });
        return isDeleted;
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
