import '../background/BackgroundImagesComp.scss';

import { useState } from 'react';

import ScreenBackgroundManager from '../_screen/managers/ScreenBackgroundManager';
import {
    BackgroundSrcType,
    ImageScaleType,
    scaleTypeList,
} from '../_screen/screenHelpers';
import { RenderScreenIds } from '../background/BackgroundComp';
import BackgroundMediaComp from '../background/BackgroundMediaComp';
import { DragTypeEnum } from '../helper/DragInf';
import FileSource from '../helper/FileSource';
import { useStateSettingString } from '../helper/settingHelpers';
import SlideAutoPlayComp from '../slide-auto-play/SlideAutoPlayComp';
import { screenManagerFromBase } from '../_screen/managers/screenManagerHelpers';
import { getScreenManagerBase } from '../_screen/managers/screenManagerBaseHelpers';
import { showAppContextMenu } from '../context-menu/appContextMenuHelpers';
import { useScreenBackgroundManagerEvents } from '../_screen/managers/screenEventHelpers';
import { useAppEffect } from '../helper/debuggerHelpers';
import { FilePathLoadedContext } from '../others/RenderListComp';
import ScreenManagerBase from '../_screen/managers/ScreenManagerBase';

function findNextSrc(isNext: boolean, srcList: string[], src: string) {
    let index = srcList.findIndex((src1) => {
        return src1 === src;
    });
    if (index === -1) {
        return null;
    }
    index += isNext ? 1 : -1;
    index += srcList.length;
    return srcList[index % srcList.length] ?? null;
}

export function handleNextItemSelecting({
    srcList,
    scaleType,
    isNext,
}: {
    srcList: string[];
    scaleType: ImageScaleType;
    isNext: boolean;
}) {
    const dataList = ScreenBackgroundManager.getBackgroundSrcListByType('image')
        .filter(([, data]) => {
            return srcList.includes(data.src);
        })
        .map(([screenKey, data]) => {
            return [ScreenManagerBase.idFromKey(screenKey), data.src] as const;
        });
    const foundList = dataList
        .map(([screenId, src]) => {
            const targetSrc = findNextSrc(isNext, srcList, src);
            if (targetSrc === null) {
                return null;
            }
            return {
                src: targetSrc,
                screenId,
            };
        })
        .filter((item) => item !== null);
    if (foundList.length === 0) {
        return;
    }
    for (let i = 0; i < foundList.length; i++) {
        const { src, screenId } = foundList[i];
        const screenManager = screenManagerFromBase(
            getScreenManagerBase(screenId),
        );
        if (screenManager === null) {
            continue;
        }
        setTimeout(() => {
            const { screenBackgroundManager } = screenManager;
            screenBackgroundManager.applyBackgroundSrc('image', {
                src,
                scaleType,
            });
        }, i * 100);
    }
}

function rendChild(
    _scaleType: ImageScaleType,
    filePath: string,
    selectedBackgroundSrcList: [string, BackgroundSrcType][],
) {
    const fileSource = FileSource.getInstance(filePath);
    return (
        <div className="card-body overflow-hidden">
            <RenderScreenIds
                screenIds={selectedBackgroundSrcList.map(([key]) => {
                    return parseInt(key);
                })}
            />
            <img
                src={fileSource.src}
                className="card-img-top"
                alt={fileSource.name}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center center',
                    pointerEvents: 'none',
                }}
            />
        </div>
    );
}

function HeaderElements({
    scaleType,
    setScaleType,
}: Readonly<{
    scaleType: ImageScaleType;
    setScaleType: (event: any, value: ImageScaleType) => void;
}>) {
    return (
        <>
            <div className="flex-grow-1">
                <h4>Images Slide Show</h4>
            </div>
            <div className="d-flex">
                <div>Scale Type:</div>
                <button
                    className="btn btn-sm btn-outline-info mx-1"
                    style={{
                        width: '80px',
                        height: '30px',
                    }}
                    onClick={(event: any) => {
                        showAppContextMenu(
                            event,
                            scaleTypeList.map((scaleType) => {
                                return {
                                    menuElement: scaleType,
                                    onSelect: (event1) => {
                                        setScaleType(event1, scaleType);
                                    },
                                };
                            }),
                        );
                    }}
                >
                    {scaleType}
                </button>
            </div>
        </>
    );
}

const DIR_SOURCE_SETTING_NAME = 'images-slide-show';

function useAnyItemSelected(filePaths: string[] | undefined) {
    const [isAnyItemSelected, setIsAnyItemSelected] = useState(false);
    const refresh = () => {
        if (filePaths === undefined || filePaths.length === 0) {
            setIsAnyItemSelected(false);
            return;
        }
        const srcList = filePaths.map((filePath) => {
            const fileSource = FileSource.getInstance(filePath);
            return fileSource.src;
        });
        const dataList =
            ScreenBackgroundManager.getBackgroundSrcListByType('image');
        const isSelected = dataList.some(([_, data]) => {
            return srcList.includes(data.src);
        });
        setIsAnyItemSelected(isSelected);
    };
    useScreenBackgroundManagerEvents(['update'], undefined, refresh);
    useAppEffect(refresh, [filePaths]);
    return isAnyItemSelected;
}

export default function ImagesShowComp() {
    const [filePaths, setFilePaths] = useState<string[] | undefined>();
    const isAnyItemSelected = useAnyItemSelected(filePaths);
    const [scaleType, setScaleType] = useStateSettingString<ImageScaleType>(
        'images-slide-show-scale-type',
        'stretch',
    );
    const setScaleType1 = (event: any, value: ImageScaleType) => {
        setScaleType(value);
        ScreenBackgroundManager.handleBackgroundSelecting(event, 'image', {
            src: null,
            scaleType,
        });
    };
    const handleClicking = (event: any, fileSource: FileSource) => {
        ScreenBackgroundManager.handleBackgroundSelecting(event, 'image', {
            src: fileSource.src,
            scaleType,
        });
    };
    return (
        <div
            className="card m-2 overflow-hidden d-flex flex-column"
            style={{ maxHeight: '350px' }}
        >
            <div className="card-header d-flex">
                <HeaderElements
                    scaleType={scaleType}
                    setScaleType={setScaleType1}
                />
            </div>
            <div
                className="card-body"
                style={{
                    overflowY: 'auto',
                }}
            >
                <FilePathLoadedContext
                    value={{
                        onLoaded: setFilePaths,
                    }}
                >
                    <BackgroundMediaComp
                        dragType={DragTypeEnum.BACKGROUND_IMAGE}
                        rendChild={rendChild.bind(null, scaleType)}
                        dirSourceSettingName={DIR_SOURCE_SETTING_NAME}
                        onClick={handleClicking}
                    />
                </FilePathLoadedContext>
            </div>
            {isAnyItemSelected ? (
                <SlideAutoPlayComp
                    prefix="images"
                    onNext={(data) => {
                        if (filePaths === undefined || filePaths.length === 0) {
                            return;
                        }
                        handleNextItemSelecting({
                            srcList: filePaths.map((filePath) => {
                                const fileSource =
                                    FileSource.getInstance(filePath);
                                return fileSource.src;
                            }),
                            scaleType: scaleType,
                            isNext: data.isNext,
                        });
                    }}
                />
            ) : null}
        </div>
    );
}
