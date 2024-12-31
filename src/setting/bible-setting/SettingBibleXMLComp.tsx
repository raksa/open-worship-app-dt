import { useState, useTransition } from 'react';

import { showSimpleToast } from '../../toast/toastHelpers';
import LoadingComp from '../../others/LoadingComp';
import {
    BibleJsonInfoType, BibleJsonType, checkIsValidUrl, getAllXMLFileKeys,
    getBibleInfo, getInputByName, jsonToXMLText, keyToFilePath,
    readFromFile, readFromUrl, saveXMLText, xmlFormatExample, xmlToJson,
} from './bibleXMLHelpers';
import { useAppEffect } from '../../helper/debuggerHelpers';
import { fsDeleteFile } from '../../server/fileHelpers';
import { showAppConfirm } from '../../popup-widget/popupWidgetHelpers';

let loadBibleInfoList: () => void = () => { };
function useBibleXMLInfoList() {
    const [bibleInfoList, setBibleInfoList] = (
        useState<BibleJsonInfoType[] | null>(null)
    );
    const [isPending, startTransition] = useTransition();
    loadBibleInfoList = () => {
        startTransition(async () => {
            const keys = await getAllXMLFileKeys();
            const promises = keys.map((key) => {
                return getBibleInfo(key);
            });
            const newBibleInfoList = (await Promise.all(promises)).filter(
                (bibleInfo) => {
                    return bibleInfo !== null;
                },
            );
            setBibleInfoList(newBibleInfoList);
        });
    };
    useAppEffect(() => {
        loadBibleInfoList();
    }, []);
    return { bibleInfoList, isPending, loadBibleInfoList };
}

function BibleXMLInfoComp({ bibleInfo }: Readonly<{
    bibleInfo: BibleJsonInfoType,
}>) {
    const handleFileDeleting = async () => {
        const isConfirmed = await showAppConfirm(
            'Delete Bible XML',
            `Are you sure to delete bible XML "${bibleInfo.key}"?`,
        );
        if (!isConfirmed) {
            return;
        }
        const filePath = await keyToFilePath(bibleInfo.key);
        await fsDeleteFile(filePath);
        loadBibleInfoList();
    };
    const { title, key } = bibleInfo;
    return (
        <li className='list-group-item'>
            <div>
                <span>{title} ({key})</span>
                <div className='float-end'>
                    <div className='btn-group'>
                        <button className='btn btn-danger'
                            onClick={handleFileDeleting}>
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </li>
    );
}

function BibleXMLListComp() {
    const {
        bibleInfoList, isPending,
    } = useBibleXMLInfoList();
    if (isPending) {
        return (
            <LoadingComp />
        );
    }
    const refresher = (
        <button
            title='Refresh'
            className='btn btn-info'
            onClick={() => {
                loadBibleInfoList();
            }}>
            <i className='bi bi-arrow-clockwise' /> Refresh
        </button>
    );
    if (bibleInfoList === null || bibleInfoList.length === 0) {
        return (
            <div>
                No Bible XML files {refresher}
            </div>
        );
    }
    return (
        <>
            <h3>
                Bibles XML {refresher}
            </h3>
            <div className='w-100 app-border-white-round p-2'>
                <ul className='list-group d-flex flex-fill'>
                    {bibleInfoList.map((bibleInfo) => {
                        return (
                            <BibleXMLInfoComp
                                key={bibleInfo.key} bibleInfo={bibleInfo}
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
    const [outputJson, setOutputJson] = useState<BibleJsonType | null>(null);
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
                setOutputJson(dataJson);
                loadBibleInfoList();
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
                    {outputJson ? (
                        <pre>{JSON.stringify(outputJson, null, 2)}</pre>
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
