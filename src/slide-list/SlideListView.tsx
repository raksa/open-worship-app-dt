import { Component } from 'react';
import SlideListController from './SlideListController';
import { getAppMimetype } from '../helper/fileHelper';
import { AskingNewName } from '../others/AskingNewName';
import SlideItem from './SlideItem';

type SlideListViewPropsType = {
    baseDir: string,
    isCreatingNew: boolean,
    setIsCreatingNew: (b: boolean) => void,
};
type SlideListViewStateType = {
    slideListController: SlideListController;
};
export default class SlideListView extends
    Component<SlideListViewPropsType, SlideListViewStateType> {
    state: Readonly<SlideListViewStateType>;
    constructor(props: SlideListViewPropsType) {
        super(props);
        this.state = {
            slideListController: new SlideListController(props.baseDir),
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
            slideListController: new SlideListController(props.baseDir),
        });
    }
    async createNewSlide(name: string) {
        const mimeTypes = getAppMimetype('slide');
        const slideName = `${name}${mimeTypes[0].extension[0]}`;
        if (await this.state.slideListController.createNewSlide(slideName)) {
            this.props.setIsCreatingNew(false);
        }
    }
    render() {
        const { isCreatingNew, setIsCreatingNew } = this.props;
        const { slideListController } = this.state;
        return (
            <ul className="list-group">
                {isCreatingNew && <AskingNewName applyName={(name) => {
                    setIsCreatingNew(false);
                    if (name !== null) {
                        this.createNewSlide(name);
                    }
                }} />}
                {slideListController.slideControllers.map((slideController, i) => {
                    return <SlideItem key={`${i}`} index={i}
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
