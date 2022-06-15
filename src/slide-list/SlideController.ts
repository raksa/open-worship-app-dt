import { defaultSlide } from '../helper/slideHelper';
import { slideListEventListenerGlobal } from '../event/SlideListEventListener';
import { toastEventListener } from '../event/ToastEventListener';
import fileHelpers, {
    FileSourceType,
    genFileSource,
} from '../helper/fileHelper';
import {
    getSetting,
    getSlideItemSelectedSetting,
    setSlideItemSelectedSetting,
} from '../helper/settingHelper';
import FileController from '../others/FileController';
import { THUMB_SELECTED_SETTING_NAME } from '../slide-presenting/SlideThumbsController';
import { parseSlideItemThumbSelected } from '../helper/helpers';
import { getAllDisplays } from '../helper/displayHelper';

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
    async deleteFile() {
        try {
            await fileHelpers.deleteFile(this._fileSource.filePath);
            toastEventListener.showSimpleToast({
                title: 'Deleting Slide',
                message: 'File has been deleted',
            });
            return true;
        } catch (error: any) {
            toastEventListener.showSimpleToast({
                title: 'Listing SlideList',
                message: error.message,
            });
        }
        return false;
    }
    static async createSlideController(basePath: string, slideName: string) {
        if (await fileHelpers.checkFileExist(basePath, slideName)) {
            toastEventListener.showSimpleToast({
                title: 'Creating Slide',
                message: `Slide file with name: ${slideName} already exist!`,
            });
            return null;
        }
        const { presentDisplay } = getAllDisplays();
        const defaultSlideText = defaultSlide(presentDisplay.bounds.width, presentDisplay.bounds.height);
        try {
            await fileHelpers.createFile(JSON.stringify(defaultSlideText), basePath, slideName);
            const fileSource = genFileSource(basePath, slideName);
            return new SlideController(fileSource);
        } catch (error: any) {
            toastEventListener.showSimpleToast({
                title: 'Creating Slide',
                message: error.message,
            });
        }
        return null;
    }
}
