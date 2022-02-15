import './SlideList.scss';

import { Component, useRef, useState } from 'react';
import PathSelector from '../others/PathSelector';
import { useStateSettingString } from '../helper/settingHelper';
import SlideListEventListener, { useRefreshing, useSlideItemThumbSelecting } from '../event/SlideListEventListener';
import SlideListController from './SlideListController';
import SlideController from './SlideController';
import { getAppMimetype } from '../helper/fileHelper';
import { usePresentFGClearing } from '../event/PresentEventListener';

export default function SlideList() {
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const [basePath, setNewBasePath] = useStateSettingString('slide-selected-dir', '');
    const slideListView = useRef<SlideListView>(null);
    const refresh = () => slideListView.current?.refresh();
    const eventListener = new SlideListEventListener();
    useRefreshing(eventListener, refresh);
    useSlideItemThumbSelecting(refresh);
    usePresentFGClearing(refresh);
    return (
        <div id="slide-list" className="card w-100 h-100">
            <div className="card-header">
                <span>Slides</span>
                <button className="btn btn-sm btn-outline-info float-end" title="new slide list"
                    onClick={() => setIsCreatingNew(true)}>
                    <i className="bi bi-file-earmark-plus" />
                </button>
            </div>
            <div className="card-body">
                <PathSelector
                    prefix='bg-slide-list'
                    dirPath={basePath}
                    onRefresh={refresh}
                    onChangeDirPath={(newBasePath) => {
                        setNewBasePath(newBasePath);
                        refresh();
                    }}
                    onSelectDirPath={(newBasePath) => {
                        setNewBasePath(newBasePath);
                        refresh();
                    }} />
                <SlideListView
                    ref={slideListView}
                    baseDir={basePath}
                    isCreatingNew={isCreatingNew}
                    eventListener={eventListener}
                    setIsCreatingNew={setIsCreatingNew} />
            </div>
        </div>
    );
}
type SlideListViewPropsType = {
    baseDir: string,
    isCreatingNew: boolean,
    setIsCreatingNew: (b: boolean) => void,
    eventListener: SlideListEventListener,
};
type SlideListViewStateType = {
    creatingNewFileName: string,
    slideListController: SlideListController;
};
class SlideListView extends Component<SlideListViewPropsType, SlideListViewStateType> {
    state: Readonly<SlideListViewStateType>;
    constructor(props: SlideListViewPropsType) {
        super(props);
        this.state = {
            creatingNewFileName: '',
            slideListController: new SlideListController(props.baseDir, props.eventListener),
        };
    }
    refresh() {
        this.renewSlideListController(this.props);
    }
    componentDidUpdate(preProps: SlideListViewPropsType) {
        if (preProps.baseDir !== this.props.baseDir) {
            this.renewSlideListController(preProps);
        }
    }
    renewSlideListController(props: SlideListViewPropsType) {
        this.setState({
            slideListController: new SlideListController(props.baseDir, props.eventListener),
        });
    }
    creatNewSlide() {
        const mimeTypes = getAppMimetype('slide');
        const slideName = `${this.state.creatingNewFileName}${mimeTypes[0].extension[0]}`;
        if (this.state.slideListController.createNewSlide(slideName)) {
            this.props.setIsCreatingNew(false);
        }
    }
    render() {
        const { isCreatingNew, setIsCreatingNew } = this.props;
        const { slideListController } = this.state;
        return (
            <ul className="list-group">
                {isCreatingNew && <li className='list-group-item'>
                    <div className="input-group">
                        <input type="text" className="form-control" placeholder="file name"
                            value={this.state.creatingNewFileName}
                            aria-label="file name" aria-describedby="button-addon2" autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    this.creatNewSlide();
                                } else if (e.key === 'Escape') {
                                    setIsCreatingNew(false);
                                }
                            }}
                            onChange={(e) => {
                                // TODO: validate file name
                                this.setState({ creatingNewFileName: e.target.value });
                            }} />
                        <button className="btn btn-outline-success" type="button" id="button-addon2"
                            onClick={() => this.creatNewSlide()}>
                            <i className="bi bi-plus" />
                        </button>
                    </div>
                </li>}
                {slideListController.slideControllers.map((slideController, i) => {
                    return <ListItem key={`${i}`} index={i}
                        itemClick={() => slideListController
                            .select(slideController)}
                        controller={slideController}
                        onContextMenu={(e) => slideListController
                            .showContextMenu(slideController, e)} />;
                })}
            </ul>
        );
    }
}

type SlideItemProps = {
    index: number,
    controller: SlideController,
    itemClick: () => void,
    onContextMenu: (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => void,
}
function ListItem({ index, controller, itemClick, onContextMenu }: SlideItemProps) {
    const slideName = controller.fileName.substring(0, controller.fileName.lastIndexOf('.'));
    return (
        <li className={`list-group-item ${controller.isSelected ? 'active' : ''} pointer`}
            data-index={index + 1}
            title={controller.filePath}
            onClick={() => itemClick()}
            onContextMenu={onContextMenu}>
            <i className="bi bi-file-earmark-slides" style={{
                color: controller.isThumbSelected ? 'green' : undefined,
            }} /> {slideName}
        </li>
    );
}