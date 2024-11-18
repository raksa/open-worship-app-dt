import AppRange from '../../others/AppRange';

export const DEFAULT_PREVIEW_SIZE = 200;

export default function MiniScreenFooter({
    previewSize, setPreviewSize, isShowingTools, setIsShowingTools,
}: Readonly<{
    previewSize: number,
    setPreviewSize: (size: number) => void,
    setIsShowingTools: (isShowing: boolean) => void,
    isShowingTools: boolean,
}>) {
    const defaultSize = {
        size: DEFAULT_PREVIEW_SIZE,
        min: DEFAULT_PREVIEW_SIZE,
        max: DEFAULT_PREVIEW_SIZE * 10,
        step: 10,
    };
    return (
        <div className='card-footer w-100'>
            <div className='d-flex w-100 h-100'>
                <div className='row'>
                    <div className='col-auto'>
                        <AppRange currentSize={previewSize}
                            setCurrentSize={setPreviewSize}
                            defaultSize={defaultSize} />
                    </div>
                    <div className='form-check form-switch col-auto'>
                        <label className='form-check-label'
                            htmlFor='screen-previewer-showing-tool'>
                            Show Tools
                        </label>
                        <input className='form-check-input'
                            type='checkbox' role='switch'
                            id='screen-previewer-showing-tool'
                            checked={isShowingTools}
                            onChange={(event) => {
                                setIsShowingTools(event.target.checked);
                            }} />
                    </div>
                </div>
            </div>
        </div>
    );
}
