import SlideListEventListener from '../event/SlideListEventListener';
import { copyToClipboard, isMac, openExplorer } from '../helper/appHelper';
import { listFiles, MimetypeNameType } from '../helper/fileHelper';
import { showAppContextMenu } from '../others/AppContextMenu';
import SlideController from './SlideController';

const FILE_TYPE: MimetypeNameType = 'slide';
export default class SlideListController {
    _basePath: string;
    _slideControllers: SlideController[] = [];
    eventListener: SlideListEventListener;
    constructor(basePath: string) {
        this._basePath = basePath;
        this.eventListener = new SlideListEventListener();
    }
    get slideControllers() {
        return this._slideControllers;
    }
    get selectedSlideController() {
        return this._slideControllers.find((slideController) => slideController.isSelected) || null;
    }
    loadSlide() {
        this._slideControllers = [];
        if (this._basePath !== null) {
            const slideList = listFiles(this._basePath, FILE_TYPE);
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
        const slideController = SlideController.createSlideController(this._basePath, fileName);
        if (slideController !== null) {
            this._slideControllers.push(slideController);
            this.eventListener.refresh();
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
    deleteSlideController(slideController: SlideController) {
        const isDeleted = slideController.deleteFile();
        this._slideControllers = this._slideControllers.filter((newSlideController) => {
            return newSlideController !== slideController;
        });
        this.eventListener.refresh();
        return isDeleted;
    }
    select(slideController: SlideController) {
        if (this.selectedSlideController !== null) {
            this.selectedSlideController.isSelected = false;
        }
        slideController.isSelected = true;
        this.eventListener.refresh();
    }
    showContextMenu(slideController: SlideController,
        mouseEvent: React.MouseEvent<HTMLLIElement>) {
        showAppContextMenu(mouseEvent, [
            {
                title: 'Copy Path to Clipboard ',
                onClick: () => copyToClipboard(slideController.filePath),
            },
            {
                title: 'Delete',
                onClick: () => this.deleteSlideController(slideController),
            },
            {
                title: `Reveal in ${isMac() ? 'Finder' : 'File Explorer'}`,
                onClick: () => openExplorer(slideController.filePath),
            },
        ]);
    }
}