import {
    useSlideItemThumbTooling,
} from '../event/SlideListEventListener';
import { BoxEditor } from './BoxEditor';
import {
    KeyEnum,
    useKeyboardRegistering,
} from '../event/KeyboardEventListener';
import { editorMapper } from './EditorBoxMapper';
import { useEffect, useState } from 'react';
import { cloneObject } from '../helper/helpers';
import { showAppContextMenu } from '../others/AppContextMenu';
import SlideItem from '../slide-presenting/SlideItem';
import { ToolingType, tooling2BoxProps } from './helps';
import HTML2ReactChild from '../slide-editing/HTML2ReactChild';
import HTML2React from '../slide-editing/HTML2React';
import Slide from '../slide-list/Slide';

function newChild(data: ToolingType, newList: HTML2ReactChild[],
    html2React: HTML2React, index: number) {
    const { text, box } = data;
    const boxProps = tooling2BoxProps(data, {
        width: newList[index].width, height: newList[index].height,
        parentWidth: html2React.width, parentHeight: html2React.height,
    });
    const newH2rChild = new HTML2ReactChild({
        ...newList[index], ...text, ...box, ...boxProps,
    });
    newH2rChild.rotate = box && box.rotate !== undefined ? box.rotate : newH2rChild.rotate;
    newH2rChild.backgroundColor = box && box.backgroundColor !== undefined ?
        box.backgroundColor : newH2rChild.backgroundColor;
    return newH2rChild;
}
function genNewH2rChildren(data: ToolingType, html2React: HTML2React,
    html2ReactChildren: HTML2ReactChild[]) {
    if (!~editorMapper.selectedIndex) {
        return null;
    }
    let newList = [...html2ReactChildren];
    const index = editorMapper.selectedIndex;
    newList[index] = newChild(data, newList, html2React, index);
    if (data.box?.layerBack || data.box?.layerFront) {
        newList = newList.map((be, i) => {
            if (i === index) {
                be.zIndex = data.box?.layerBack ? 1 : 2;
            } else {
                be.zIndex = data.box?.layerBack ? 2 : 1;
            }
            return be;
        });
    }
    return newList;
}

export default function Editor({ slideItemThumb, html2React, scale }: {
    slideItemThumb: SlideItem,
    html2React: HTML2React,
    scale: number,
}) {
    const [html2ReactChildren, setHtml2ReactChildren] = useState(html2React.children);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const cloneHtml2ReactChild = (be: HTML2ReactChild) => {
        const newHtml2ReactChild = cloneObject(be);
        newHtml2ReactChild.top += 10;
        newHtml2ReactChild.left += 10;
        return newHtml2ReactChild;
    };
    const duplicate = (index: number) => {
        const newList = [...html2ReactChildren];
        const newHtml2ReactChild = cloneHtml2ReactChild(newList[index]);
        newList.splice(index + 1, 0, newHtml2ReactChild);
        setHtml2ReactChildren(newList);
    };
    const deleteItem = (index: number) => {
        const newList = html2ReactChildren.filter((_, i) => i !== index);
        setHtml2ReactChildren(newList);
    };
    const paste = () => {
        const newList = [...html2ReactChildren];
        if (copiedIndex !== null && newList[copiedIndex]) {
            const newHtml2ReactChild = cloneHtml2ReactChild(newList[copiedIndex]);
            newList.push(newHtml2ReactChild);
            setHtml2ReactChildren(newList);
        }
    };
    const newBox = () => {
        const newList = [...html2ReactChildren];
        const newBoxHTML = SlideItem.genDefaultBoxHTML();
        newList.push(HTML2ReactChild.parseHTML(newBoxHTML));
        setHtml2ReactChildren(newList);
    };

    const applyUpdate = () => {
        const parsedHTMLData = HTML2React.parseHTML(slideItemThumb.html);
        parsedHTMLData.children = html2ReactChildren;
        slideItemThumb.html = parsedHTMLData.htmlString;
    };
    useSlideItemThumbTooling((newToolingData) => {
        if (~editorMapper.selectedIndex) {
            const newList = genNewH2rChildren(newToolingData, html2React, html2ReactChildren);
            if (newList !== null) {
                setHtml2ReactChildren(newList);
            }
        }
    });

    useKeyboardRegistering({ key: KeyEnum.Escape }, () => editorMapper.stopAllModes());
    useEffect(() => {
        setHtml2ReactChildren(html2React.children);
    }, [html2React]);
    useEffect(applyUpdate, [JSON.stringify(html2ReactChildren)]);
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
                {html2ReactChildren.map((h2rChild, i) => {
                    return <BoxEditor parentWidth={html2React.width}
                        parentHeight={html2React.height}
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
                        }} h2rChild={h2rChild} onUpdate={(newData) => {
                            const newList = [...html2ReactChildren];
                            newList[i] = new HTML2ReactChild({ ...newList[i], ...newData });
                            setHtml2ReactChildren(newList);
                        }} />;
                })}
            </div>
        </>
    );
}
