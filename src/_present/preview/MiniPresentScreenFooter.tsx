import AppRange from '../../others/AppRange';

export const DEFAULT_PREVIEW_SIZE = 200;

export default function MiniPresentScreenFooter({
    previewSize, setPreviewSize,
}: {
    previewSize: number,
    setPreviewSize: (size: number) => void,
}) {
    const defaultSize = {
        size: DEFAULT_PREVIEW_SIZE,
        min: DEFAULT_PREVIEW_SIZE,
        max: DEFAULT_PREVIEW_SIZE * 10,
        step: 10,
    };
    return (
        <div className='card-footer w-100'>
            <div className='d-flex w-100 h-100'>
                <AppRange currentSize={previewSize}
                    setCurrentSize={setPreviewSize}
                    defaultSize={defaultSize} />
            </div>
        </div>
    );
}
