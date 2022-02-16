import './BoxEditor.scss';
import './EditorControllerBoxWrapper.scss';

import { Component } from 'react';
import {
    HAlignmentEnum,
    HTML2ReactChild,
    VAlignmentEnum,
} from '../helper/slideHelper';
import BoxEditorController from './BoxEditorController';
import { ContextMenuEventType } from '../others/AppContextMenu';
import { editorMapper } from './EditorBoxMapper';
import { slideListEventListenerGlobal } from '../event/SlideListEventListener';

export type NewDataType = { [key: string]: any };
type PropsType = {
    h2rChild: HTML2ReactChild,
    parentWidth: number,
    parentHeight: number,
    onUpdate: (newData: NewDataType) => void,
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
    componentDidUpdate(preProps: PropsType) {
        this.editingController.setScaleFactor(preProps.scale);
        this.applyControl();
    }
    get isControllable() {
        return this.state.isControllable;
    }
    get isEditable() {
        return this.state.isEditable;
    }
    init(boxWrapper: HTMLDivElement | null) {
        if (boxWrapper !== null) {
            this.editingController.initEvent(boxWrapper);
        }
    }
    startControllingMode() {
        return new Promise<void>((resolve) => {
            this.setState({ isControllable: true }, () => {
                slideListEventListenerGlobal.boxEditing(this.props.h2rChild);
                resolve();
            });
        });
    }
    startEditingMode() {
        return new Promise<void>((resolve) => {
            this.setState({ isEditable: true }, () => {
                slideListEventListenerGlobal.boxEditing(this.props.h2rChild);
                resolve();
            });
        });
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
                slideListEventListenerGlobal.boxEditing(null);
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
            this.props.onUpdate(info);
        });
    }
    componentDidMount() {
        if (this.divRef !== null) {
            this.divRef.innerHTML = this.props.h2rChild.text.split('\n').join('<br/>');
        }
    }
    render() {
        const { isControllable } = this.state;
        return isControllable ? this.controllingGen() : this.normalGen();
    }
    controllingGen() {
        const { isControllable } = this.state;
        const { h2rChild } = this.props;
        const style = h2rChild.style;
        return (
            <div ref={(div) => {
                this.init(div);
            }} className="editor-controller-box-wrapper" style={{
                width: '0',
                height: '0',
                top: `${h2rChild.top + h2rChild.height / 2}px`,
                left: `${h2rChild.left + h2rChild.width / 2}px`,
                transform: `rotate(${h2rChild.rotate}deg)`,
                zIndex: h2rChild.zIndex,
            }}>
                <div className={`box-editor ${isControllable ? 'controllable' : ''}`}
                    onContextMenu={this.props.onContextMenu}
                    onDoubleClick={async (e) => {
                        e.stopPropagation();
                        await editorMapper.stopAllModes();
                        this.startEditingMode();
                    }}
                    style={{
                        transform: 'translate(-50%, -50%)',
                        width: `${h2rChild.width}px`, height: `${h2rChild.height}px`,
                    }}>
                    <div ref={(r) => {
                        this.divRef = r;
                    }} className='w-100 h-100' style={style}>{h2rChild.text}</div>
                    <div className='tools'>
                        <div className={`object ${this.editingController.rotatorCN}`} />
                        <div className="rotate-link" />
                        {Object.keys(this.editingController.resizerList)
                            .map((cn, i) => <div key={`${i}`} className={`object ${cn}`} />)
                        }
                    </div>
                </div>
            </div>
        );
    }
    normalGen() {
        const { h2rChild } = this.props;
        const style = { ...h2rChild.style, ...h2rChild.normalStyle };
        // TODO: fix wrong reposition;
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
                onDoubleClick={async (e) => {
                    e.stopPropagation();
                    await editorMapper.stopAllModes();
                    this.startEditingMode();
                }}>
                {this.state.isEditable ?
                    <textarea style={{ color: style.color }}
                        className='w-100 h-100' value={h2rChild.text} onChange={(e) => {
                            this.props.onUpdate({ text: e.target.value });
                        }} />
                    : h2rChild.text}
            </div>
        );
    }
}
