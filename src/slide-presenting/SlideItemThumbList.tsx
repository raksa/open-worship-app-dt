import { Component, useEffect, useState } from 'react';
import {
    toSlideItemThumbSelected,
    parseSlideItemThumbSelected,
} from '../helper/helpers';
import { usePresentFGClearing } from '../event/PresentEventListener';
import { clearFG } from './slidePresentHelpers';
import {
    getSlideDataByFilePath,
} from '../helper/slideHelper';
import {
    slideListEventListenerGlobal,
    useSlideItemThumbOrdering,
    useSlideItemThumbTooling,
    useSlideItemThumbUpdating,
    useSlideSelecting,
} from '../event/SlideListEventListener';
import { isWindowEditingMode } from '../App';
import SlideItemThumbListMenu from './SlideItemThumbListMenu';
import SlideItemThumbListItems from './SlideItemThumbListItems';
import SlideItemThumbListContextMenu, { contextObject } from './SlideItemThumbListContextMenu';
import {
    getSetting,
    getSlideItemSelectedSetting,
    useStateSettingString,
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

export default function SlideItemThumbList({ thumbWidth }: { thumbWidth?: number }) {
    const selectedPath = getSlideItemSelectedSetting();
    const [slideFilePathSelected, setSlideFilePathSelected] = useState<string | null>(selectedPath);
    useSlideSelecting(() => {
        const newSelectedPath = getSlideItemSelectedSetting();
        setSlideFilePathSelected(newSelectedPath);
    });
    if (slideFilePathSelected === null) {
        slideListEventListenerGlobal.selectSlideItemThumb(null);
        return (
            <div className="card-body d-flex justify-content-center align-items-center w-100 h-100">
                No Slide Selected 😐
            </div>
        );
    }
    return (
        <SlideItemThumbListView filePath={slideFilePathSelected} />
    );
}
type PropsType = {
    filePath: string,
};
type StateType = {
    slideThumbsController: SlideThumbsController | null,
};
class SlideItemThumbListView extends Component<PropsType, StateType> {
    constructor(props: PropsType) {
        super(props);
        this.state = {
            slideThumbsController: this.createController(props),
        };
    }
    componentDidUpdate(preProps: PropsType) {
        if (preProps.filePath !== this.props.filePath) {
            this.renewSlideThumbsController(preProps);
        }
    }
    renewSlideThumbsController(props: PropsType) {
        this.setState({
            slideThumbsController: this.createController(props),
        });
    }
    createController(props: PropsType) {
        try {
            const fileSource = genFileSource(props.filePath);
            return new SlideThumbsController(fileSource);
        } catch (error) { }
        return null;
    }
    render() {
        const { slideThumbsController } = this.state;
        if (slideThumbsController === null) {
            return (
                <div className="card-body d-flex justify-content-center align-items-center w-100 h-100">
                    Unable to load slide data 😐
                    <button className='btn btn-info' onClick={() => {
                        this.renewSlideThumbsController(this.props);
                    }}>Retry</button>
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
            onContextMenu={(e) => {
                if (contextObject.showSlideItemContextMenu) {
                    contextObject.showSlideItemContextMenu(e);
                }
            }} onPaste={() => contextObject.paste && contextObject.paste()}>
            <SlideItemThumbListMenu controller={controller} />
            <SlideItemThumbListItems controller={controller} />
            <SlideItemThumbListContextMenu controller={controller} />
        </div>
    );
}
