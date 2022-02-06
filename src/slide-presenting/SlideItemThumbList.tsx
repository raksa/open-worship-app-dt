import { Component, useRef } from 'react';
import { parseSlideItemThumbSelected } from '../helper/helpers';
import { usePresentFGClearing } from '../event/PresentEventListener';
import { clearFG } from './slidePresentHelpers';
import { getSlideDataByFilePath } from '../helper/slideHelper';
import SlideListEventListener, {
    useRefreshing,
    useSlideItemThumbOrdering,
    useSlideItemThumbTooling,
    useSlideItemThumbUpdating,
    useSlideSelecting,
} from '../event/SlideListEventListener';
import SlideItemThumbListMenu from './SlideItemThumbListMenu';
import SlideItemThumbListItems from './SlideItemThumbListItems';
import {
    getSetting,
    getSlideItemSelectedSetting,
} from '../helper/settingHelper';
import SlideThumbsController, {
    THUMB_SELECTED_SETTING_NAME,
} from './SlideThumbsController';
import { genFileSource } from '../helper/fileHelper';

export function getValidSlideItemThumbSelected() {
    const filePath = getSlideItemSelectedSetting();
    const slideItemThumbSelected = getSetting(THUMB_SELECTED_SETTING_NAME) || '';
    const result = parseSlideItemThumbSelected(slideItemThumbSelected, filePath);
    if (result !== null) {
        const data = getSlideDataByFilePath(filePath as string);
        if (data !== null) {
            return data.items.find((item) => item.id === result.id) || null;
        }
    }
    return null;
}

export default function SlideItemThumbList() {
    const controller = useRef<Controller>(null);
    useSlideSelecting(() => controller.current?.hardRefresh());
    const eventListener = new SlideListEventListener();
    useRefreshing(eventListener, () => controller.current?.softRefresh());
    return (
        <Controller ref={controller} eventListener={eventListener} />
    );
}
type PropsType = {
    eventListener: SlideListEventListener,
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
                return new SlideThumbsController(fileSource, this.props.eventListener);
            }
        } catch (error) { }
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
    usePresentFGClearing(() => {
        controller.select(null);
        clearFG();
    });
    const setIsModifying = (isModifying: boolean) => {
        controller.isModifying = isModifying;
    };
    useSlideItemThumbUpdating(() => setIsModifying(true));
    useSlideItemThumbOrdering(() => setIsModifying(true));
    useSlideItemThumbTooling(() => setIsModifying(true));

    return (
        <div className='w-100 h-100' style={{ overflow: 'auto' }}
            onContextMenu={(e) => controller.showSlideItemContextMenu(e)}
            onPaste={() => controller.paste()}>
            <SlideItemThumbListMenu controller={controller} />
            <SlideItemThumbListItems controller={controller} />
        </div>
    );
}
