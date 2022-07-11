import {
    useSlideItemTooling,
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
import SlideItem from '../slide-list/SlideItem';
import HTML2React from './HTML2React';
import HTML2ReactChild from './HTML2ReactChild';

export default function SlideEditor({
    slideItem, html2React, scale,
}: {
    slideItem: SlideItem,
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
        const parsedHTMLData = HTML2React.parseHTML(slideItem.html);
        parsedHTMLData.children = html2ReactChildren;
        slideItem.html = parsedHTMLData.htmlString;
    };
    useSlideItemTooling((newToolingData) => {
        if (~editorMapper.selectedIndex) {
            const newList = HTML2ReactChild.genNewH2rChildren(newToolingData,
                html2React, html2ReactChildren);
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
