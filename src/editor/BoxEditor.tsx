import './BoxEditor.scss';
import './EditorControllerBoxWrapper.scss';

import { Component, CSSProperties } from 'react';
import { HAlignmentEnum, HTML2ReactChildType, VAlignmentEnum } from './slideParser';
import { ToolingType } from './slideType';
import BoxEditorController from './BoxEditorController';
import { ContextMenuEventType } from '../others/AppContextMenu';
import { editorMapper } from './EditorBoxMapper';
import { slideListEventListener } from '../slide-list/SlideList';

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
    data: HTML2ReactChildType,
    parentWidth: number,
    parentHeight: number,
    onUpdate: () => void,
    onContextMenu: (e: ContextMenuEventType) => void,
    scale: number,
};
type StateType = {
    data: HTML2ReactChildType,
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
            const newData: HTML2ReactChildType = { ...preState.data, ...text, ...boxProps };
            newData.rotate = box && box.rotate !== undefined ? box.rotate : newData.rotate;
            newData.backgroundColor = box && box.backgroundColor !== undefined ?
                box.backgroundColor : newData.backgroundColor;
            return { data: newData };
        }, () => {
            this.props.onUpdate();
        });
    }
    toJson() {
        return this.state.data;
    }
    toString() {
        const div = document.createElement('div');
        div.innerText = this.state.data.text;
        const targetStyle = div.style as any;
        const style = { ...this.genStyle(), ...this.genNormalStyle() } as any;
        Object.keys(style).forEach((k) => {
            targetStyle[k] = style[k];
        });
        return div.outerHTML;
    }
    startControllingMode() {
        return new Promise<void>((resolve) => {
            this.setState({ isControllable: true }, () => {
                slideListEventListener.boxEditing(this.state.data);
                resolve();
            });
        });
    }
    startEditingMode() {
        return new Promise<void>((resolve) => {
            this.setState({ isEditable: true }, () => {
                slideListEventListener.boxEditing(this.state.data);
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
                slideListEventListener.boxEditing(null);
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
                const newData = { ...preState.data, ...info };
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
    genStyle() {
        const { data } = this.state;
        const style: CSSProperties = {
            display: 'flex',
            fontSize: `${data.fontSize}px`,
            color: data.color,
            alignItems: data.verticalAlignment,
            justifyContent: data.horizontalAlignment,
            backgroundColor: data.backgroundColor,
        };
        return style;
    }
    genNormalStyle() {
        const { data } = this.state;
        const style: CSSProperties = {
            top: `${data.top}px`, left: `${data.left}px`,
            transform: `rotate(${data.rotate}deg)`,
            width: `${data.width}px`,
            height: `${data.height}px`,
            position: 'absolute',
            zIndex: data.zIndex,
        };
        return style;
    }
    render() {
        const { isControllable } = this.state;
        return isControllable ? this.controllingGen() : this.normalGen();
    }
    controllingGen() {
        const { data, isControllable } = this.state;
        const style = this.genStyle();
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
        const style = { ...this.genStyle(), ...this.genNormalStyle() };

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
