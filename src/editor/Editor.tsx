import {
    slideListEventListenerGlobal,
    useSlideItemThumbTooling,
} from '../event/SlideListEventListener';
import {
    getDefaultBoxHTML,
    HTML2ReactChild,
    HTML2React,
    SlideItemThumbType,
} from '../helper/slideHelper';
import { BoxEditor } from './BoxEditor';
import {
    KeyEnum,
    useKeyboardRegistering,
} from '../event/KeyboardEventListener';
import { editorMapper } from './EditorBoxMapper';
import { useEffect, useState } from 'react';
import { cloneObject } from '../helper/helpers';
import { showAppContextMenu } from '../others/AppContextMenu';

export default function Editor({ slideItemThumb, html2React, scale }: {
    slideItemThumb: SlideItemThumbType,
    html2React: HTML2React,
    scale: number,
}) {
    const [html2ReactChildren, setHtml2ReactChildren] = useState(html2React.children);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const cloneHtml2ReactChild = (be: HTML2ReactChild) => {
        const newHtml2ReactChild: HTML2ReactChild = cloneObject(be);
        newHtml2ReactChild.top += 10;
        newHtml2ReactChild.left += 10;
        return newHtml2ReactChild;
    };
    const duplicate = (index: number) => {
        const newHtml2ReactChildren = [...html2ReactChildren];
        const newHtml2ReactChild = cloneHtml2ReactChild(newHtml2ReactChildren[index]);
        newHtml2ReactChildren.splice(index + 1, 0, newHtml2ReactChild);
        setHtml2ReactChildren(newHtml2ReactChildren);
    };
    const deleteItem = (index: number) => {
        const newHtml2ReactChildren = html2ReactChildren.filter((_, i) => i !== index);
        setHtml2ReactChildren(newHtml2ReactChildren);
    };
    const paste = () => {
        const newHtml2ReactChildren = [...html2ReactChildren];
        if (copiedIndex !== null && newHtml2ReactChildren[copiedIndex]) {
            const newHtml2ReactChild = cloneHtml2ReactChild(newHtml2ReactChildren[copiedIndex]);
            newHtml2ReactChildren.push(newHtml2ReactChild);
            setHtml2ReactChildren(newHtml2ReactChildren);
        }
    };
    const newBox = () => {
        const newHtml2ReactChildren = [...html2ReactChildren];
        const newBoxHTML = getDefaultBoxHTML();
        newHtml2ReactChildren.push(HTML2ReactChild.parseHTML(newBoxHTML));
        setHtml2ReactChildren(newHtml2ReactChildren);
    };

    const applyUpdate = (editingIndex?: number) => {
        const parsedHTMLData = HTML2React.parseHTML(slideItemThumb.html);
        parsedHTMLData.children = editorMapper.html2ReactChildren;
        if (parsedHTMLData.htmlString !== slideItemThumb.html) {
            slideItemThumb.html = parsedHTMLData.htmlString;
            slideListEventListenerGlobal.updateSlideItemThumb(slideItemThumb);
            if (editingIndex !== undefined) {
                const be = editorMapper.getByIndex(editingIndex);
                if (be !== null) {
                    const newHtml2ReactChildren = [...html2ReactChildren];
                    newHtml2ReactChildren[editingIndex] = cloneObject(be.state.data);
                    setHtml2ReactChildren(newHtml2ReactChildren);
                }
            }
        }
    };
    useSlideItemThumbTooling((newData) => {
        if (~editorMapper.selectedIndex &&
            (newData.box?.layerBack || newData.box?.layerFront)) {
            const index = editorMapper.selectedIndex;
            let newHtml2ReactChildren = [...html2ReactChildren];
            newHtml2ReactChildren = newHtml2ReactChildren.map((be, i) => {
                if (i === index) {
                    be.zIndex = newData.box?.layerBack ? 1 : 2;
                } else {
                    be.zIndex = newData.box?.layerBack ? 2 : 1;
                }
                return be;
            });
            setHtml2ReactChildren(newHtml2ReactChildren);
        }
        editorMapper.selectedBoxEditor?.tooling(newData);
    });

    useKeyboardRegistering({ key: KeyEnum.Escape }, () => editorMapper.stopAllModes());
    useEffect(() => {
        setHtml2ReactChildren(html2React.children);
    }, [html2React]);
    useEffect(() => {
        applyUpdate();
    }, [html2ReactChildren.length]);
    return (
        <>
            <div className='editor blank-bg border-white-round' style={{
                width: `${html2React.width}px`,
                height: `${html2React.height}px`,
                transform: 'translate(-50%, -50%)',
            }} onContextMenu={(e) => {
                showAppContextMenu(e, [
                    {
                        title: 'New',
                        onClick: newBox,
                    },
                    {
                        title: 'Paste', disabled: copiedIndex === null,
                        onClick: paste,
                    },
                ]);
            }} onDoubleClick={() => editorMapper.stopAllModes()} >
                {html2ReactChildren.map((d, i) => {
                    return <BoxEditor parentWidth={html2React.width} parentHeight={html2React.height}
                        scale={scale} key={`${i}`} onContextMenu={(e) => {
                            showAppContextMenu(e, [
                                {
                                    title: 'Copy', onClick: () => {
                                        setCopiedIndex(i);
                                    },
                                },
                                {
                                    title: 'Duplicate', onClick: () => {
                                        duplicate(i);
                                    },
                                },
                                {
                                    title: 'Edit', onClick: async () => {
                                        await editorMapper.getByIndex(i)?.stopAllModes();
                                        editorMapper.getByIndex(i)?.startEditingMode();
                                    },
                                },
                                {
                                    title: 'Delete', onClick: () => {
                                        deleteItem(i);
                                    },
                                },
                            ]);
                        }} ref={(be) => {
                            editorMapper.setEditor(`${i}`, be);
                        }} data={d} onUpdate={() => applyUpdate(i)} />;
                })}
            </div>
        </>
    );
}
