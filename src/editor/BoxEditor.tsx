import './BoxEditor.scss';
import './EditorControllerBoxWrapper.scss';

import { Component } from 'react';
import {
    HAlignmentEnum,
    HTML2ReactChild,
    ToolingType,
    VAlignmentEnum,
} from '../helper/slideHelper';
import BoxEditorController from './BoxEditorController';
import { ContextMenuEventType } from '../others/AppContextMenu';
import { editorMapper } from './EditorBoxMapper';
import { slideListEventListenerGlobal } from '../event/SlideListEventListener';

function tooling2BoxProps(toolingData: ToolingType, state: {
    parentWidth: number, parentHeight: number, width: number, height: number,
}) {
    const { box } = toolingData;
    const boxProps: { top?: number, left?: number } = {};
    if (box) {
        if (box.verticalAlignment === VAlignmentEnum.Top) {
            boxProps.top = 0;
        } else if (box.verticalAlignment === VAlignmentEnum.Center) {
            boxProps.top = state.parentHeight / 2 - state.height / 2;
        } else if (box.verticalAlignment === VAlignmentEnum.Bottom) {
            boxProps.top = state.parentHeight - state.height;
        }
        if (box.horizontalAlignment === HAlignmentEnum.Left) {
            boxProps.left = 0;
        } else if (box.horizontalAlignment === HAlignmentEnum.Center) {
            boxProps.left = state.parentWidth / 2 - state.width / 2;
        } else if (box.horizontalAlignment === HAlignmentEnum.Right) {
            boxProps.left = state.parentWidth - state.width;
        }
    }
    return boxProps;
}

type PropsType = {
    data: HTML2ReactChild,
    parentWidth: number,
    parentHeight: number,
    onUpdate: () => void,
    onContextMenu: (e: ContextMenuEventType) => void,
    scale: number,
};
type StateType = {
    data: HTML2ReactChild,
    isEditable: boolean,
    isControllable: boolean,
};
export class BoxEditor extends Component<PropsType, StateType>{
    divRef: HTMLDivElement | null = null;
    editingController: BoxEditorController;
    constructor(props: PropsType) {
        super(props);
        this.state = {
            data: props.data,
            isEditable: false,
            isControllable: false,
        };
        this.editingController = new BoxEditorController();
        this.editingController.setScaleFactor(props.scale);
        this.editingController.onDone = () => {
            this.applyControl();
        };
    }
    componentWillReceiveProps(props: PropsType) {
        this.editingController.setScaleFactor(props.scale);
        this.setState((preState: StateType) => {
            preState.data.zIndex = props.data.zIndex;
            return preState;
        }, () => this.applyControl());
    }
    get isControllable() {
        return this.state.isControllable;
    }
    get isEditable() {
        return this.state.isEditable;
    }
    get data() {
        return this.state.data;
    }
    init(boxWrapper: HTMLDivElement | null) {
        if (boxWrapper !== null) {
            this.editingController.initEvent(boxWrapper);
        }
    }
    tooling(toolingData: ToolingType) {
        const { text, box } = toolingData;
        const boxProps = tooling2BoxProps(toolingData, {
            width: this.state.data.width, height: this.state.data.height,
            parentWidth: this.props.parentWidth, parentHeight: this.props.parentHeight,
        });
        this.setState((preState) => {
            const newData = new HTML2ReactChild({ ...preState.data, ...text, ...boxProps });
            newData.rotate = box && box.rotate !== undefined ? box.rotate : newData.rotate;
            newData.backgroundColor = box && box.backgroundColor !== undefined ?
                box.backgroundColor : newData.backgroundColor;
            return { data: newData };
        }, () => {
            this.props.onUpdate();
        });
    }
    startControllingMode() {
        return new Promise<void>((resolve) => {
            this.setState({ isControllable: true }, () => {
                slideListEventListenerGlobal.boxEditing(this.state.data);
                resolve();
            });
        });
    }
    startEditingMode() {
        return new Promise<void>((resolve) => {
            this.setState({ isEditable: true }, () => {
                slideListEventListenerGlobal.boxEditing(this.state.data);
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
            this.applyTextChange().then(() => {
                this.setState({ isEditable: false }, () => resolve(true));
            });
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
            this.setState((preState) => {
                const newData = new HTML2ReactChild({ ...preState.data, ...info });
                return { data: newData };
            }, () => {
                resolve();
                this.props.onUpdate();
            });
        });
    }
    async applyTextChange() {
        this.props.onUpdate();
    }
    UNSAFE_componentWillReceiveProps(props: PropsType) {
        this.setState({ data: props.data });
    }
    componentDidMount() {
        if (this.divRef !== null) {
            this.divRef.innerHTML = this.state.data.text.split('\n').join('<br/>');
        }
    }
    render() {
        const { isControllable } = this.state;
        return isControllable ? this.controllingGen() : this.normalGen();
    }
    controllingGen() {
        const { data, isControllable } = this.state;
        const style = data.style;
        return (
            <div ref={(div) => {
                this.init(div);
            }} className="editor-controller-box-wrapper" style={{
                width: '0',
                height: '0',
                top: `${data.top + data.height / 2}px`,
                left: `${data.left + data.width / 2}px`,
                transform: `rotate(${data.rotate}deg)`,
                zIndex: data.zIndex,
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
                        width: `${data.width}px`, height: `${data.height}px`,
                    }}>
                    <div ref={(r) => {
                        this.divRef = r;
                    }} className='w-100 h-100' style={style}>{data.text}</div>
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
        const { data, isEditable } = this.state;
        const style = { ...data.style, ...data.normalStyle };

        return (
            <div onContextMenu={this.props.onContextMenu}
                className={`box-editor pointer ${isEditable ? 'editable' : ''}`}
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
                {isEditable ?
                    <textarea style={{ color: style.color }}
                        className='w-100 h-100' value={data.text} onChange={(e) => {
                            this.setState((preState) => {
                                preState.data.text = e.target.value;
                                return preState;
                            }, () => this.applyTextChange());
                        }} />
                    : data.text}
            </div>
        );
    }
}
