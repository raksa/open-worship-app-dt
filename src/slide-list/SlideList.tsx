import './SlideList.scss';

import { useEffect, useState } from 'react';
import PathSelector from '../others/PathSelector';
import {
    createFile,
    deleteFile,
    FileSourceType,
    getAppMimetype,
    listFiles,
} from '../helper/fileHelper';
import {
    getSlideFilePathSetting,
    setSlideFilePathSetting,
    useStateSettingString,
} from '../helper/settingHelper';
import { defaultSlide } from '../editor/slideType';
import { slideListEventListener } from '../event/SlideListEventListener';
import { toastEventListener } from '../event/ToastEventListener';
import {
    copyToClipboard,
    getPresentScreenInfo,
    isMac,
    openExplorer,
} from '../helper/appHelper';
import { showAppContextMenu } from '../others/AppContextMenu';

type SlideItemProps = {
    data: FileSourceType,
    selected: boolean,
    itemClick: () => void,
    onContextMenu: (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => void,
}
function ListItem({ data, itemClick, selected, onContextMenu }: SlideItemProps) {
    const slideName = data.fileName.substring(0, data.fileName.lastIndexOf('.'));
    return (
        <li className={`list-group-item ${selected ? 'active' : ''} pointer`}
            title={data.filePath}
            onClick={itemClick}
            onContextMenu={onContextMenu}>
            <i className="bi bi-file-earmark-slides" /> {slideName}
        </li>
    );
}

export default function SlideList() {
    const defaultSelected = getSlideFilePathSetting();
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const [creatingNewFileName, setCreatingNewFileName] = useState('');
    const [dir, setDir] = useStateSettingString('slide-selected-dir', '');
    const [slideFilePathSelected, setSlideFilePathSelected] = useState<string | null>(defaultSelected);
    const [slides, setSlides] = useState<FileSourceType[] | null>(null);
    useEffect(() => {
        if (slides === null) {
            const newSlideList = listFiles(dir, 'slide');
            setSlides(newSlideList === null ? [] : newSlideList);
        }
    }, [slides, dir]);
    const creatNewSlide = () => {
        // TODO: verify file name before create
        const mimeTypes = getAppMimetype('slide');
        const slideName = `${creatingNewFileName}${mimeTypes[0].extension[0]}`;
        const dim = getPresentScreenInfo();
        if (createFile(JSON.stringify(defaultSlide(dim.width, dim.height)), dir, slideName)) {
            setSlides(null);
        } else {
            toastEventListener.showSimpleToast({
                title: 'Creating Slide',
                message: 'Unable to create slide due to internal error',
            });
        }
        setCreatingNewFileName('');
        setIsCreatingNew(false);
    };
    const mapSlides = slides || [];
    return (
        <div id="slide-list" className="card w-100 h-100">
            <div className="card-header">
                <span>Slide</span>
                <button className="btn btn-sm btn-outline-info float-end" title="new slide list"
                    onClick={() => setIsCreatingNew(true)}>
                    <i className="bi bi-file-earmark-plus" />
                </button>
            </div>
            <div className="card-body">
                <PathSelector
                    dirPath={dir}
                    onRefresh={() => setSlides(null)}
                    onChangeDirPath={(dp) => {
                        setDir(dp);
                        setSlides(null);
                    }}
                    onSelectDirPath={(dp) => {
                        setDir(dp);
                        setSlides(null);
                    }} />
                <ul className="list-group">
                    {isCreatingNew && <li className='list-group-item'>
                        <div className="input-group">
                            <input type="text" className="form-control" placeholder="file name"
                                value={creatingNewFileName}
                                aria-label="file name" aria-describedby="button-addon2" autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        creatNewSlide();
                                    } else if (e.key === 'Escape') {
                                        setIsCreatingNew(false);
                                    }
                                }}
                                onChange={(e) => {
                                    // TODO: validate file name
                                    setCreatingNewFileName(e.target.value);
                                }} />
                            <button className="btn btn-outline-success" type="button" id="button-addon2"
                                onClick={creatNewSlide}>
                                <i className="bi bi-plus" />
                            </button>
                        </div>
                    </li>}
                    {mapSlides.map((data, i) => {
                        return <ListItem key={`${i}`}
                            itemClick={() => {
                                setSlideFilePathSetting(data.filePath);
                                setSlideFilePathSelected(data.filePath);
                                slideListEventListener.selectSlideItem(data.filePath);
                            }}
                            data={data}
                            selected={data.filePath === slideFilePathSelected}
                            onContextMenu={(e) => {
                                showAppContextMenu(e, [
                                    {
                                        title: 'Copy Path to Clipboard ', onClick: () => {
                                            copyToClipboard(data.filePath);
                                        },
                                    },
                                    {
                                        title: 'Delete', onClick: () => {
                                            if (deleteFile(data.filePath as string)) {
                                                if (slideFilePathSelected === data.filePath) {
                                                    slideListEventListener.selectSlideItem(null);
                                                    setSlideFilePathSelected('');
                                                }
                                                setSlides(null);
                                            } else {
                                                toastEventListener.showSimpleToast({
                                                    title: 'Deleting Slide',
                                                    message: 'Unable to delete slide due to internal error',
                                                });
                                            }
                                        },
                                    },
                                    {
                                        title: `Reveal in ${isMac() ? 'Finder' : 'File Explorer'}`,
                                        onClick: () => {
                                            openExplorer(data.filePath);
                                        },
                                    },
                                ]);
                            }} />;
                    })}
                </ul>
            </div>
        </div>
    );
}
