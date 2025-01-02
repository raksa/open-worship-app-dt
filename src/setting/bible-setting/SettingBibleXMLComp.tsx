import { useState, useTransition } from 'react';

import { showSimpleToast } from '../../toast/toastHelpers';
import LoadingComp from '../../others/LoadingComp';
import {
    BibleJsonInfoType, checkIsValidUrl, getAllXMLFileKeys,
    getBibleInfo, getInputByName, handBibleInfoContextMenuOpening,
    jsonToXMLText, bibleKeyToFilePath, readFromFile, readFromUrl, saveXMLText,
    xmlToJson, handBibleKeyContextMenuOpening, updateBibleXMLInfo,
} from './bibleXMLHelpers';
import { useAppEffect } from '../../helper/debuggerHelpers';
import { fsDeleteFile } from '../../server/fileHelpers';
import { showAppConfirm } from '../../popup-widget/popupWidgetHelpers';
import { xmlFormatExample } from './bibleXMLAttributesGuessing';

function useBibleXMLInfo(bibleKey: string) {
    const [bibleInfo, setBibleInfo] = (
        useState<BibleJsonInfoType | null>(null)
    );
    const [isPending, startTransition] = useTransition();
    loadBibleKeys = () => {
        startTransition(async () => {
            const newBibleInfo = await getBibleInfo(bibleKey);
            setBibleInfo(newBibleInfo);
        });
    };
    useAppEffect(() => {
        loadBibleKeys();
    }, []);
    return { bibleInfo, isPending, setBibleInfo };
}

let loadBibleKeys: () => void = () => { };
function useBibleKeys() {
    const [bibleKeys, setBibleKeys] = (
        useState<string[] | null>(null)
    );
    const [isPending, startTransition] = useTransition();
    loadBibleKeys = () => {
        startTransition(async () => {
            const keys = await getAllXMLFileKeys();
            setBibleKeys(keys);
        });
    };
    useAppEffect(() => {
        loadBibleKeys();
    }, []);
    return { bibleKeys, isPending, loadBibleKeys };
}

function PreviewBibleXMLInfoComp({ bibleKey }: Readonly<{
    bibleKey: string,
}>) {
    const { bibleInfo, setBibleInfo, isPending } = useBibleXMLInfo(bibleKey);
    if (isPending) {
        return (
            <LoadingComp />
        );
    }
    if (bibleInfo === null) {
        return null;
    }
    return (
        <div className='app-border-white-round p-2'
            onContextMenu={(event) => {
                handBibleInfoContextMenuOpening(
                    event, bibleInfo, (newOutputJson) => {
                        setBibleInfo(newOutputJson);
                    },
                );
            }}>
            <button className='btn btn-success'
                onClick={() => {
                    updateBibleXMLInfo(bibleInfo);
                    loadBibleKeys();
                }}>
                Save
            </button>
            <pre>{JSON.stringify(bibleInfo, null, 2)}</pre>
        </div>
    );
}

function BibleXMLInfoComp({ bibleKey }: Readonly<{
    bibleKey: string,
}>) {
    const [isShowing, setIsShowing] = useState(false);
    const handleFileDeleting = async (event: any) => {
        event.stopPropagation();
        const isConfirmed = await showAppConfirm(
            'Delete Bible XML',
            `Are you sure to delete bible XML "${bibleKey}"?`,
        );
        if (!isConfirmed) {
            return;
        }
        const filePath = await bibleKeyToFilePath(bibleKey);
        await fsDeleteFile(filePath);
        loadBibleKeys();
    };
    return (
        <li className='list-group-item pointer'
            onClick={() => {
                setIsShowing(!isShowing);
            }}
            onContextMenu={handBibleKeyContextMenuOpening.bind(null, bibleKey)}>
            <div>
                <span>{bibleKey}</span>
                <div className='float-end'>
                    <div className='btn-group'>
                        <button className='btn btn-danger'
                            onClick={handleFileDeleting}>
                            Delete
                        </button>
                    </div>
                </div>
            </div>
            {isShowing ? (
                <PreviewBibleXMLInfoComp bibleKey={bibleKey} />
            ) : null}
        </li>
    );
}

function BibleXMLListComp() {
    const { bibleKeys, isPending } = useBibleKeys();
    if (isPending) {
        return (
            <LoadingComp />
        );
    }
    const buttons = (
        <>
            <button
                title='Refresh'
                className='btn btn-info'
                onClick={() => {
                    loadBibleKeys();
                }}>
                <i className='bi bi-arrow-clockwise' /> Refresh
            </button>
            <a className='btn btn-secondary ms-2' href={
                'https://www.google.com/search?q=holy+bible+xml+format'
            } target='_blank'>
                Search XML
            </a>
        </>
    );
    if (bibleKeys === null || bibleKeys.length === 0) {
        return (
            <div>
                No Bible XML files {buttons}
            </div>
        );
    }
    return (
        <>
            <h3>
                Bibles XML {buttons}
            </h3>
            <div className='w-100 app-border-white-round p-2'>
                <ul className='list-group d-flex flex-fill'>
                    {bibleKeys.map((bibleKey) => {
                        return (
                            <BibleXMLInfoComp key={bibleKey}
                                bibleKey={bibleKey}
                            />
                        );
                    })}
                </ul>
            </div>
        </>
    );
}

function BibleXMLImportComp() {
    const [isShowingExample, setIsShowingExample] = useState(false);
    const [isFileSelected, setIsFileSelected] = useState(false);
    const [urlText, setUrlText] = useState('');
    const [isPending, startTransition] = useTransition();
    const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
    const isValidUrl = checkIsValidUrl(urlText);
    const handleFormSubmitting = async (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();
        startTransition(async () => {
            try {
                const form = event.currentTarget;
                if (!(form instanceof HTMLFormElement)) {
                    return;
                }
                let dataText: string | null = null;
                if (isFileSelected) {
                    dataText = await readFromFile(form, setLoadingMessage);
                } else if (isValidUrl) {
                    dataText = await readFromUrl(form, setLoadingMessage);
                }
                if (dataText === null) {
                    showSimpleToast(
                        'No Data',
                        'No data to process',
                    );
                    return;
                }
                const dataJson = await xmlToJson(dataText);
                if (dataJson === null) {
                    showSimpleToast(
                        'Parsing XML',
                        'Failed to parse XML data',
                    );
                    return;
                }
                const newXMLText = jsonToXMLText(dataJson);
                await saveXMLText(dataJson.info.key, newXMLText);
                loadBibleKeys();
            } catch (error) {
                showSimpleToast(
                    'Format Submit Error',
                    `Error: ${error}`,
                );
            }
        });
    };
    const handleFileCanceling = (event: any) => {
        const form = event.currentTarget.form;
        if (form instanceof HTMLFormElement) {
            const inputFile = getInputByName(form, 'file');
            if (inputFile instanceof HTMLInputElement) {
                inputFile.value = '';
            }
        }
        setIsFileSelected(false);
    };
    return (
        <>
            <h3>
                Import XML File <button
                    title='XML format example'
                    className={
                        'btn btn-sm ms-2' +
                        ` btn${isShowingExample ? '' : '-outline'}-info`
                    }
                    onClick={() => {
                        setIsShowingExample(!isShowingExample);
                    }}>
                    <i className='bi bi-question-lg' />
                </button>
            </h3>
            {!isShowingExample ? null : (
                <div>
                    <textarea className='form-control' style={{
                        padding: '5px',
                        height: '200px',
                    }} defaultValue={xmlFormatExample} readOnly />
                </div>
            )}
            <form onSubmit={handleFormSubmitting}>
                <div className='app-border-white-round p-2'>
                    {isValidUrl ? null : (
                        <div className='input-group'>
                            <input className='form-control' type='file'
                                name='file' onChange={() => {
                                    setIsFileSelected(true);
                                }}
                            />
                            {isFileSelected ? (
                                <button type='button' title='Cancel selection'
                                    className='btn btn-sm btn-danger'
                                    onClick={handleFileCanceling}>
                                    <i className='bi bi-x-lg' />
                                </button>
                            ) : null}
                        </div>
                    )}
                    {isFileSelected ? null : (
                        <>
                            <span>or</span>
                            <div className='input-group'>
                                <div className='input-group-text'>
                                    URL:
                                </div>
                                <input className={
                                    'form-control' +
                                    (
                                        !urlText || isValidUrl ?
                                            '' : ' is-invalid'
                                    )
                                }
                                    title={isValidUrl ? '' : 'Invalid URL'}
                                    type='text' name='url'
                                    placeholder='http://example.com/file.xml'
                                    value={urlText}
                                    onChange={(event: any) => {
                                        setUrlText(event.target.value);
                                    }}
                                />
                                {isValidUrl ? (
                                    <button type='button'
                                        title='Clear url'
                                        className='btn btn-sm btn-danger'
                                        onClick={() => {
                                            setUrlText('');
                                        }}>
                                        <i className='bi bi-x-lg' />
                                    </button>
                                ) : null}
                            </div>
                        </>
                    )}
                </div>
                <div>
                    <input className='form-control' type='submit'
                        value='Import' disabled={
                            isPending || !(isFileSelected || isValidUrl)
                        }
                    />
                </div>
                <div className='app-border-white-round'>
                    {isPending ? (
                        <LoadingComp message={loadingMessage} />
                    ) : null}
                </div>
            </form>
        </>
    );
}

export default function SettingBibleXMLComp() {
    return (
        <div className='w-100 app-border-white-round p-2'>
            <BibleXMLListComp />
            <hr />
            <BibleXMLImportComp />
        </div>
    );
}
