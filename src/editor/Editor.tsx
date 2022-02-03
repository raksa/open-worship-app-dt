import {
    slideListEventListener,
    useSlideItemThumbTooling
} from '../event/SlideListEventListener';
import { getDefaultBoxHTML, SlideItemThumbType } from './slideType';
import { HTML2ReactChildType, HTML2ReactType, parseChildHTML, parseHTML } from './slideParser';
import { BoxEditor } from './BoxEditor';
import { KeyEnum, useKeyboardRegistering } from '../event/KeyboardEventListener';
import { mapper } from './EditorBoxMapper';
import { useEffect, useState } from 'react';
import { cloneObject } from '../helper/helpers';
import { showAppContextMenu } from '../helper/AppContextMenu';

export default function Editor({ slideItemThumb, data, width, height, scale }: {
    slideItemThumb: SlideItemThumbType,
    data: HTML2ReactType,
    width: number,
    height: number,
    scale: number,
}) {
    const [boxEditors, setBoxEditors] = useState(data.children);
    const [boxEditorCopiedIndex, setBoxEditorCopiedIndex] = useState<number | null>(null);

    const cloneBoxEditor = (be: HTML2ReactChildType) => {
        const newBoxEditor = cloneObject(be) as HTML2ReactChildType;
        newBoxEditor.top += 10;
        newBoxEditor.left += 10;
        return newBoxEditor;
    };
    const duplicate = (index: number) => {
        const newBoxEditors = [...boxEditors];
        const newBoxEditor = cloneBoxEditor(newBoxEditors[index]);
        newBoxEditors.splice(index + 1, 0, newBoxEditor);
        setBoxEditors(newBoxEditors);
    };
    const deleteItem = (index: number) => {
        const newBoxEditors = boxEditors.filter((_, i) => i !== index);
        setBoxEditors(newBoxEditors);
    };
    const paste = () => {
        const newBoxEditors = [...boxEditors];
        if (boxEditorCopiedIndex !== null && newBoxEditors[boxEditorCopiedIndex]) {
            const newBoxEditor = cloneBoxEditor(newBoxEditors[boxEditorCopiedIndex]);
            newBoxEditors.push(newBoxEditor);
            setBoxEditors(newBoxEditors);
        }
    };
    const newBox = () => {
        const newBoxEditors = [...boxEditors];
        const newBoxEditor = getDefaultBoxHTML();
        newBoxEditors.push(parseChildHTML(newBoxEditor));
        setBoxEditors(newBoxEditors);
    };

    const applyUpdate = (editingIndex?: number) => {
        const boxListHTML = mapper.htmlHTMLList();
        const parsedHTMLData = parseHTML(slideItemThumb.html);
        const newHtml = `<div style="width: ${parsedHTMLData.width}px; height: ${parsedHTMLData.height}px;">` +
            `${boxListHTML.join('')}</div>`;
        if (newHtml !== slideItemThumb.html) {
            slideItemThumb.html = newHtml;
            slideListEventListener.updateSlideItemThumb(slideItemThumb);
            if (editingIndex !== undefined) {
                const be = mapper.getByIndex(editingIndex);
                if (be !== null) {
                    const newBoxEditors = [...boxEditors];
                    newBoxEditors[editingIndex] = cloneObject(be.state.data);
                    setBoxEditors(newBoxEditors);
                }
            }
        }
    };
    useSlideItemThumbTooling((newData) => {
        if (~mapper.selectedIndex &&
            (newData.box?.layerBack || newData.box?.layerFront)) {
            const index = mapper.selectedIndex;
            let newBoxEditors = [...boxEditors];
            newBoxEditors = newBoxEditors.map((be, i) => {
                if (i === index) {
                    be.zIndex = newData.box?.layerBack ? 1 : 2;
                } else {
                    be.zIndex = newData.box?.layerBack ? 2 : 1;
                }
                return be;
            })
            setBoxEditors(newBoxEditors);
        }
        mapper.selectedBoxEditor?.tooling(newData);
    });

    useKeyboardRegistering({
        key: KeyEnum.Escape,
    }, () => {
        mapper.stopAllEditing();
    });
    useEffect(() => {
        setBoxEditors(data.children);
    }, [data]);
    useEffect(() => {
        applyUpdate();
    }, [boxEditors.length]);
    return (
        <>
            <div className='editor blank-bg border-white-round' style={{
                width: `${width}px`,
                height: `${height}px`,
                transform: 'translate(-50%, -50%)',
            }} onContextMenu={(e) => {
                showAppContextMenu(e, [
                    {
                        title: 'New',
                        onClick: newBox,
                    },
                    {
                        title: 'Paste', disabled: boxEditorCopiedIndex === null,
                        onClick: paste,
                    },
                ]);
            }} onDoubleClick={() => {
                mapper.stopAllEditing();
            }} >
                {boxEditors.map((d, i) => {
                    return <BoxEditor parentWidth={width} parentHeight={height}
                        scale={scale} key={`${i}`} onContextMenu={(e) => {
                            showAppContextMenu(e, [
                                {
                                    title: 'Copy', onClick: () => {
                                        setBoxEditorCopiedIndex(i);
                                    }
                                },
                                {
                                    title: 'Duplicate', onClick: () => {
                                        duplicate(i);
                                    }
                                },
                                {
                                    title: 'Edit', onClick: () => {
                                        mapper.getByIndex(i)?.stopAllModes(() => {
                                            mapper.getByIndex(i)?.startEditingMode();
                                        });
                                    }
                                },
                                {
                                    title: 'Delete', onClick: () => {
                                        deleteItem(i);
                                    }
                                },
                            ]);
                        }} ref={(be) => {
                            mapper.setEditor(`${i}`, be)
                        }} data={d} onUpdate={() => applyUpdate(i)}
                        onMode={() => {
                            mapper.stopAllEditing(i);
                        }} />
                })}
            </div>
        </>
    );
}
