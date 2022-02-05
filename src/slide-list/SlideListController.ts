import { listFiles, MimetypeNameType } from '../helper/fileHelper';
import SlideController from './SlideController';

// TODO: implement class
export default class SlideListController {
    fileType: MimetypeNameType = 'playlist';
    dir: string | null;
    slideControllers: SlideController[] = [];
    constructor(dir: string | null) {
        this.dir = dir;
    }
    loadSlide() {
        this.slideControllers = [];
        if (this.dir !== null) {
            const newPlaylists = listFiles(this.dir, this.fileType);
            if (newPlaylists !== null) {
                newPlaylists.forEach((playlistSource) => {
                    this.slideControllers.push(new SlideController(playlistSource));
                });
            }
        }
    }
}