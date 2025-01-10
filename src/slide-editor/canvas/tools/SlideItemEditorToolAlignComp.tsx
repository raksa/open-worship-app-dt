import { VAlignmentType, HAlignmentType } from '../canvasHelpers';

export default function SlideItemEditorToolAlignComp({
    onData,
    isText,
}: Readonly<{
    onData: (data: {
        verticalAlignment?: VAlignmentType;
        horizontalAlignment?: HAlignmentType;
    }) => void;
    isText?: boolean;
}>) {
    return (
        <div className="d-flex">
            <div className="app-border-white-round">
                <button
                    className="btn btn-info"
                    onClick={() => {
                        onData({ verticalAlignment: 'start' });
                    }}
                >
                    <i className="bi bi-align-top" />
                </button>
                <button
                    className="btn btn-info"
                    onClick={() => {
                        onData({ verticalAlignment: 'center' });
                    }}
                >
                    <i className="bi bi-align-middle" />
                </button>
                <button
                    className="btn btn-info"
                    onClick={() => {
                        onData({ verticalAlignment: 'end' });
                    }}
                >
                    <i className="bi bi-align-bottom" />
                </button>
            </div>
            {isText ? (
                <div className="app-border-white-round">
                    <button
                        className="btn btn-info"
                        onClick={() => {
                            onData({ horizontalAlignment: 'left' });
                        }}
                    >
                        <i className="bi bi-text-left" />
                    </button>
                    <button
                        className="btn btn-info"
                        onClick={() => {
                            onData({ horizontalAlignment: 'center' });
                        }}
                    >
                        <i className="bi bi-text-center" />
                    </button>
                    <button
                        className="btn btn-info"
                        onClick={() => {
                            onData({ horizontalAlignment: 'right' });
                        }}
                    >
                        <i className="bi bi-text-right" />
                    </button>
                </div>
            ) : (
                <div className="app-border-white-round">
                    <button
                        className="btn btn-info"
                        onClick={() => {
                            onData({ horizontalAlignment: 'left' });
                        }}
                    >
                        <i className="bi bi-align-start" />
                    </button>
                    <button
                        className="btn btn-info"
                        onClick={() => {
                            onData({ horizontalAlignment: 'center' });
                        }}
                    >
                        <i className="bi bi-align-center" />
                    </button>
                    <button
                        className="btn btn-info"
                        onClick={() => {
                            onData({ horizontalAlignment: 'right' });
                        }}
                    >
                        <i className="bi bi-align-end" />
                    </button>
                </div>
            )}
        </div>
    );
}
