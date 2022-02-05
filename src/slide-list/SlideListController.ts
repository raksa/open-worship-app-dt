import SlideListEventListener from '../event/SlideListEventListener';
import { listFiles, MimetypeNameType } from '../helper/fileHelper';
import SlideController from './SlideController';

// TODO: implement class
const FILE_TYPE: MimetypeNameType = 'slide';
export default class SlideListController {
    _dir: string;
    _slideControllers: SlideController[] = [];
    eventListener: SlideListEventListener;
    constructor(dir: string) {
        this._dir = dir;
        this.eventListener = new SlideListEventListener();
    }
    get slideController() {
        return this._slideControllers;
    }
    loadSlide() {
        this._slideControllers = [];
        if (this._dir !== null) {
            const slideList = listFiles(this._dir, FILE_TYPE);
            if (slideList !== null) {
                slideList.forEach((slideSource) => {
                    this._slideControllers.push(new SlideController(slideSource));
                });
            }
        }
        this.eventListener.refresh();
    }
    getSlideController(index: number): SlideController | null {
        return this._slideControllers[index] || null;
    }
    addSlideController(fileName: string): SlideController | null {
        const slideController = SlideController.createSlideController(this._dir, fileName);
        if (slideController !== null) {
            this._slideControllers.push(slideController);
            this.eventListener.slideItemAdded(slideController);
        }
        return slideController;
    }
    renameSlide(slideController: SlideController, newFileName: string): boolean {
        if (slideController.rename(newFileName)) {
            this.eventListener.refresh();
            return true;
        }
        return false;
    }
    deleteSlideController(index: number): SlideController | null {
        const slideController = this.getSlideController(index);
        if (slideController !== null) {
            slideController.deleteFile();
            this._slideControllers = this._slideControllers.filter((_, i) => {
                return i !== index;
            });
            this.eventListener.slideItemRemoved(slideController);
        }
        return slideController;
    }
}