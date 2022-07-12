import './BoxEditor.scss';
import './EditorControllerBoxWrapper.scss';

import { Component } from 'react';
import BoxEditorController from './BoxEditorController';
import { ContextMenuEventType } from '../others/AppContextMenu';
import { editorMapper } from './EditorBoxMapper';
import CanvasItem from './CanvasItem';

export type NewDataType = { [key: string]: any };
type PropsType = {
    canvasItem: CanvasItem,
    onContextMenu: (e: ContextMenuEventType) => void,
    scale: number,
};
type StateType = {
    isEditable: boolean,
    isControllable: boolean,
};
export class BoxEditor extends Component<PropsType, StateType>{
    divRef: HTMLDivElement | null = null;
    editingController: BoxEditorController;
    constructor(props: PropsType) {
        super(props);
        this.state = {
            isEditable: false,
            isControllable: false,
        };
        this.editingController = new BoxEditorController();
        this.editingController.setScaleFactor(props.scale);
        this.editingController.onDone = () => {
            this.applyControl();
        };
    }
    get canvasItem() {
        return this.props.canvasItem;
    }
    get canvasController() {
        return this.canvasItem.canvasController;
    }
    get isControllable() {
        return this.state.isControllable;
    }
    get isEditable() {
        return this.state.isEditable;
    }
    componentDidUpdate(preProps: PropsType) {
        this.editingController.setScaleFactor(preProps.scale);
    }
    init(boxWrapper: HTMLDivElement | null) {
        if (boxWrapper !== null) {
            this.editingController.initEvent(boxWrapper);
        }
    }
    startControllingMode() {
        this.setState({ isControllable: true });
    }
    startEditingMode() {
        this.setState({ isEditable: true });
    }
    stopControllingMode() {
        if (!this.isControllable) {
            return Promise.resolve(false);
        }
        return new Promise<boolean>((resolve) => {
            this.applyControl().then(() => {
                this.setState({ isControllable: false }, () => {
                    this.editingController.release();
                    resolve(true);
                });
            });
        });
    }
    stopEditingMode() {
        if (!this.isEditable) {
            return Promise.resolve(false);
        }
        return new Promise<boolean>((resolve) => {
            this.setState({ isEditable: false }, () => resolve(true));
        });
    }
    stopAllModes() {
        return new Promise<boolean>(async (resolve) => {
            const isEditing = await this.stopEditingMode();
            const isControlling = await this.stopControllingMode();
            if (isEditing || isControlling) {
                this.canvasController.selectedCanvasItem = null;
            }
            resolve(isEditing || isControlling);
        });
    }
    applyControl() {
        return new Promise<void>((resolve) => {
            const info = this.editingController.getInfo();
            if (info === null) {
                return resolve();
            }
            resolve();
            this.canvasItem.update(info);
        });
    }
    render() {
        const { isControllable } = this.state;
        return isControllable ? this.controllingGen() : this.normalGen();
    }
    async onDoubleClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        e.stopPropagation();
        await editorMapper.stopAllModes();
        this.startEditingMode();
    }
    controllingGen() {
        const { isControllable } = this.state;
        const { canvasItem } = this.props;
        const style = canvasItem.style;
        return (
            <div ref={(div) => {
                this.init(div);
            }} className="editor-controller-box-wrapper" style={{
                width: '0',
                height: '0',
                top: `${canvasItem.top + canvasItem.height / 2}px`,
                left: `${canvasItem.left + canvasItem.width / 2}px`,
                transform: `rotate(${canvasItem.rotate}deg)`,
                zIndex: canvasItem.zIndex,
            }}>
                <div className={`box-editor ${isControllable ? 'controllable' : ''}`}
                    onContextMenu={this.props.onContextMenu}
                    onDoubleClick={(e) => this.onDoubleClick(e)}
                    style={{
                        transform: 'translate(-50%, -50%)',
                        width: `${canvasItem.width}px`, height: `${canvasItem.height}px`,
                    }}>
                    <div ref={(r) => {
                        this.divRef = r;
                    }} className='w-100 h-100' style={style}>
                        <RenderText text={canvasItem.text} />
                    </div>
                    <div className='tools'>
                        <div className={`object ${this.editingController.rotatorCN}`} />
                        <div className="rotate-link" />
                        {Object.keys(this.editingController.resizeActorList)
                            .map((cn, i) => <div key={`${i}`} className={`object ${cn}`} />)
                        }
                    </div>
                </div>
            </div>
        );
    }
    normalGen() {
        const { canvasItem } = this.props;
        const style = { ...canvasItem.style, ...canvasItem.normalStyle };
        return (
            <div onContextMenu={this.props.onContextMenu}
                className={`box-editor pointer ${this.state.isEditable ? 'editable' : ''}`}
                style={style}
                ref={(r) => {
                    this.divRef = r;
                }}
                onKeyUp={(e) => {
                    if (e.key === 'Escape' || (e.key === 'Enter' && e.ctrlKey)) {
                        this.stopEditingMode();
                    }
                }}
                onClick={async (e) => {
                    e.stopPropagation();
                    if (this.isEditable) {
                        return;
                    }
                    await editorMapper.stopAllModes();
                    this.startControllingMode();
                }}
                onDoubleClick={(e) => this.onDoubleClick(e)}>
                {this.state.isEditable ?
                    <textarea style={{ color: style.color }}
                        className='w-100 h-100' value={canvasItem.text}
                        onChange={(e) => {
                            this.canvasItem.update({ text: e.target.value });
                        }} />
                    : <RenderText text={canvasItem.text} />}
            </div>
        );
    }
}

function RenderText({ text }: { text: string }) {
    return (
        <span dangerouslySetInnerHTML={{
            __html: text.split('\n').join('<br>'),
        }} />
    );
}
