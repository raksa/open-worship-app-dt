import AppRangeComp from '../../others/AppRangeComp';

export const DEFAULT_PREVIEW_SIZE = 50;
export const defaultRangeSize = {
    size: 9,
    min: 1,
    max: 20,
    step: 1,
};
export default function MiniScreenFooter({
    previewSizeScale,
    setPreviewSizeScale,
    isShowingTools,
    setIsShowingTools,
}: Readonly<{
    previewSizeScale: number;
    setPreviewSizeScale: (size: number) => void;
    setIsShowingTools: (isShowing: boolean) => void;
    isShowingTools: boolean;
}>) {
    return (
        <div className="card-footer w-100">
            <div className="d-flex w-100 h-100">
                <div className="row">
                    <div className="col-auto">
                        <AppRangeComp
                            value={previewSizeScale}
                            title="Preview Size Scale"
                            setValue={setPreviewSizeScale}
                            defaultSize={defaultRangeSize}
                        />
                    </div>
                    <div className="form-check form-switch col-auto">
                        <label
                            className="form-check-label"
                            htmlFor="screen-previewer-showing-tool"
                        >
                            Show Tools
                        </label>
                        <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            id="screen-previewer-showing-tool"
                            checked={isShowingTools}
                            onChange={(event) => {
                                setIsShowingTools(event.target.checked);
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
