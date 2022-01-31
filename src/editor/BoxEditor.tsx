import './BoxEditor.scss';
import './EditorControllerBoxWrapper.scss';

import { Component, CSSProperties } from 'react';
import { HAlignmentEnum, HTML2ReactChildType, VAlignmentEnum } from './slideParser';
import { getInnerHTML } from '../helper/helpers';
import { ToolingType } from '../helper/slideType';
import { slideListEventListener } from '../event/SlideListEventListener';
import BoxEditorController from './BoxEditorController';
import { ContextMenuEventType } from '../helper/AppContextMenu';

type PropsType = {
    data: HTML2ReactChildType,
    parentWidth: number,
    parentHeight: number,
    onUpdate: () => void,
    onContextMenu: (e: ContextMenuEventType) => void,
    onMode: () => void,
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
        const boxProps: { top?: number, left?: number } = {};
        if (box) {
            if (box.verticalAlignment === VAlignmentEnum.Top) {
                boxProps.top = 0;
            } else if (box.verticalAlignment === VAlignmentEnum.Center) {
                boxProps.top = this.props.parentHeight / 2 - this.state.data.height / 2;
            } else if (box.verticalAlignment === VAlignmentEnum.Bottom) {
                boxProps.top = this.props.parentHeight - this.state.data.height;
            }
            if (box.horizontalAlignment === HAlignmentEnum.Left) {
                boxProps.left = 0;
            } else if (box.horizontalAlignment === HAlignmentEnum.Center) {
                boxProps.left = this.props.parentWidth / 2 - this.state.data.width / 2;
            } else if (box.horizontalAlignment === HAlignmentEnum.Right) {
                boxProps.left = this.props.parentWidth - this.state.data.width;
            }
        }

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
        if (this.divRef === null) {
            return '';
        }
        const div = document.createElement('div');
        div.innerHTML = this.divRef.outerHTML;
        const target = div.firstChild as HTMLDivElement;
        const targetStyle = target.style as any;
        const normalStyle = this.genNormalStyle() as any;
        Object.keys(normalStyle).forEach((k) => {
            targetStyle[k] = normalStyle[k];
        });
        const html = getInnerHTML(target);
        return html;
    }
    startControllingMode(callback?: () => void) {
        this.setState({ isControllable: true }, () => {
            slideListEventListener.boxEditing(this.state.data);
            callback && callback();
            this.props.onMode();
        });
    }
    startEditingMode(callback?: () => void) {
        this.setState({ isEditable: true }, () => {
            slideListEventListener.boxEditing(this.state.data);
            callback && callback();
            this.props.onMode();
        });
    }
    stopControllingMode(callback?: () => void) {
        this.applyControl(() => {
            this.setState({ isControllable: false }, () => {
                this.editingController.release();
                callback && callback();
            });
        });
    }
    stopEditingMode(callback?: () => void) {
        this.applyTextChange(() => {
            this.setState({ isEditable: false }, () => {
                callback && callback();
            });
        });
    }
    stopAllModes(callback?: () => void) {
        this.stopEditingMode(() => {
            this.stopControllingMode(() => {
                slideListEventListener.boxEditing(null);
                callback && callback();
            });
        });
    }
    applyControl(callback?: () => void) {
        const info = this.editingController.getInfo();
        if (info === null) {
            callback && callback();
            return;
        }
        this.setState((preState) => {
            const newData = { ...preState.data, ...info };
            return { data: newData };
        }, () => {
            callback && callback();
            this.props.onUpdate();
        });
    }
    applyTextChange(callback?: () => void) {
        const target = this.divRef;
        if (target === null) {
            return;
        }
        this.setState((preState) => {
            const text = target.innerText;
            preState.data.text = text;
            return { data: preState.data };
        }, () => {
            callback && callback();
            this.props.onUpdate();
        });
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
                    onDoubleClick={(e) => {
                        e.stopPropagation();
                        this.stopAllModes(() => {
                            this.startEditingMode();
                        });
                    }}
                    style={{
                        transform: 'translate(-50%, -50%)',
                        width: `${data.width}px`, height: `${data.height}px`,
                    }}>
                    <div ref={(r) => {
                        this.divRef = r;
                    }} className='w-100 h-100' style={style} dangerouslySetInnerHTML={{
                        __html: data.text.split('\n').join('<br/>'),
                    }} />
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
                contentEditable={isEditable}
                onKeyUp={(e) => {
                    if (e.key === 'Escape' || (e.key === 'Enter' && e.ctrlKey)) {
                        this.stopEditingMode();
                    }
                }}
                onClick={(e) => {
                    e.stopPropagation();

                    if (this.isEditable) {
                        return;
                    }
                    this.stopAllModes(() => {
                        this.startControllingMode();
                    });
                }}
                onDoubleClick={(e) => {
                    e.stopPropagation();

                    this.stopAllModes(() => {
                        this.startEditingMode();
                    });
                }}
                dangerouslySetInnerHTML={{
                    __html: data.text.split('\n').join('<br/>'),
                }}>
            </div>
        );
    }
}
