import { slideListEventListenerGlobal } from '../event/SlideListEventListener';
import { toastEventListener } from '../event/ToastEventListener';
import { copyToClipboard, isMac, openExplorer } from '../helper/appHelper';
import fileHelpers, { MimetypeNameType } from '../helper/fileHelper';
import { showAppContextMenu } from '../others/AppContextMenu';
import SlideController from './SlideController';

const FILE_TYPE: MimetypeNameType = 'slide';
export default class SlideListController {
    _basePath: string;
    _slideControllers: SlideController[] = [];
    constructor(basePath: string) {
        this._basePath = basePath;
        if (this._basePath !== null) {
            fileHelpers.listFiles(this._basePath, FILE_TYPE).then((slideList) => {
                if (slideList !== null) {
                    slideList.forEach((slideSource) => {
                        this._slideControllers.push(new SlideController(slideSource));
                    });
                }
            }).catch((error: any) => {
                toastEventListener.showSimpleToast({
                    title: 'Listing SlideList',
                    message: error.message,
                });
            });
        }
    }
    get slideControllers() {
        return this._slideControllers;
    }
    get selectedSlideController() {
        return this._slideControllers.find((slideController) => slideController.isSelected) || null;
    }
    getSlideController(index: number): SlideController | null {
        return this._slideControllers[index] || null;
    }
    async createNewSlide(fileName: string) {
        const slideController = await SlideController.createSlideController(this._basePath, fileName);
        if (slideController !== null) {
            this._slideControllers.push(slideController);
            slideListEventListenerGlobal.refresh();
        }
        return slideController;
    }
    async deleteSlide(slideController: SlideController) {
        const isDeleted = await slideController.deleteFile();
        this._slideControllers = this._slideControllers.filter((newSlideController) => {
            return newSlideController !== slideController;
        });
        slideListEventListenerGlobal.refresh();
        return isDeleted;
    }
    select(slideController: SlideController) {
        if (this.selectedSlideController !== null) {
            this.selectedSlideController.isSelected = false;
        }
        slideController.isSelected = true;
        slideListEventListenerGlobal.refresh();
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
                onClick: () => this.deleteSlide(slideController),
            },
            {
                title: `Reveal in ${isMac() ? 'Finder' : 'File Explorer'}`,
                onClick: () => openExplorer(slideController.filePath),
            },
        ]);
    }
}