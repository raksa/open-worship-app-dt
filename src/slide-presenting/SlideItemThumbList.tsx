import { Component, useRef } from 'react';
import { parseSlideItemThumbSelected } from '../helper/helpers';
import { usePresentFGClearing } from '../event/PresentEventListener';
import { getSlideDataByFilePath } from '../helper/slideHelper';
import {
    useRefreshing,
    useSlideSelecting,
    useThumbSizing,
} from '../event/SlideListEventListener';
import SlideItemThumbListMenu from './SlideItemThumbListMenu';
import SlideItemThumbListItems from './SlideItemThumbListItems';
import {
    getSetting,
    getSlideItemSelectedSetting,
} from '../helper/settingHelper';
import SlideThumbsController, {
    DEFAULT_THUMB_SIZE,
    THUMB_SELECTED_SETTING_NAME,
    THUMB_WIDTH_SETTING_NAME,
} from './SlideThumbsController';
import { genFileSource } from '../helper/fileHelper';

export async function getValidSlideItemThumbSelected() {
    const filePath = getSlideItemSelectedSetting();
    const slideItemThumbSelected = getSetting(THUMB_SELECTED_SETTING_NAME) || '';
    const result = parseSlideItemThumbSelected(slideItemThumbSelected, filePath);
    if (result !== null) {
        const data = await getSlideDataByFilePath(filePath as string);
        if (data !== null) {
            return data.items.find((item) => item.id === result.id) || null;
        }
    }
    return null;
}

export default function SlideItemThumbList() {
    const controller = useRef<Controller>(null);
    useSlideSelecting(() => controller.current?.hardRefresh());
    useRefreshing(() => controller.current?.softRefresh());
    return (
        <Controller ref={controller} />
    );
}
type PropsType = {
};
type StateType = {
    slideThumbsController: SlideThumbsController | null,
    renderI: number,
};
class Controller extends Component<PropsType, StateType> {
    constructor(props: PropsType) {
        super(props);
        this.state = {
            slideThumbsController: this.createController(),
            renderI: 0,
        };
    }
    softRefresh() {
        this.setState(preState => ({ renderI: preState.renderI + 1 }));
    }
    hardRefresh() {
        this.setState({
            slideThumbsController: this.createController(),
        });
    }
    createController() {
        try {
            const newSelectedPath = getSlideItemSelectedSetting();
            if (newSelectedPath) {
                const fileSource = genFileSource(newSelectedPath);
                return new SlideThumbsController(fileSource);
            }
        } catch (error) {
            console.log(error);
        }
        return null;
    }
    render() {
        const { slideThumbsController } = this.state;
        if (slideThumbsController === null) {
            return (
                <div className="card-body d-flex justify-content-center align-items-center w-100 h-100">
                    Unable to load slide data 😐
                    <button className='btn btn-info' onClick={() => this.hardRefresh()}>
                        Retry</button>
                </div>
            );
        }
        return (
            <View controller={slideThumbsController} />
        );
    }
}
function View({ controller }: {
    controller: SlideThumbsController,
}) {
    const [thumbSize, setThumbSize] = useThumbSizing(THUMB_WIDTH_SETTING_NAME, DEFAULT_THUMB_SIZE);
    usePresentFGClearing(() => controller.select(null));
    return (
        <div className='w-100 h-100' style={{ overflow: 'auto' }}
            onWheel={(e) => {
                if (e.ctrlKey) {
                    const currentScale = (thumbSize / DEFAULT_THUMB_SIZE);
                    const newScale = SlideThumbsController.toScaleThumbSize(e.deltaY > 0, currentScale);
                    setThumbSize(newScale * DEFAULT_THUMB_SIZE);
                }
            }}
            onContextMenu={(e) => controller.showSlideItemContextMenu(e)}
            onPaste={() => controller.paste()}>
            <SlideItemThumbListMenu controller={controller} />
            <SlideItemThumbListItems controller={controller} />
        </div>
    );
}
