import AppRangeComp from '../../../others/AppRangeComp';

type ShapePropertiesTye = {
    backdropFilter?: string;
    roundSizePercentage?: number;
    roundSizePixel?: number;
};

export default function ShapePropertiesComp({
    onData,
    data,
}: Readonly<{
    data?: ShapePropertiesTye;
    onData: (data: ShapePropertiesTye) => void;
}>) {
    const roundSizePixel = data?.roundSizePixel ?? 0;
    const roundSizePercentage =
        roundSizePixel > 0 ? 0 : (data?.roundSizePercentage ?? 0);
    return (
        <div>
            <div className="d-flex">
                <span className="pe-2">Glass Effect:</span>
                <input
                    className="form-control form-control-sm"
                    type="text"
                    style={{
                        width: '80px',
                    }}
                    value={data?.backdropFilter ?? '0'}
                    onChange={(e) => {
                        onData({ backdropFilter: e.target.value });
                    }}
                />
                <span className="ps-1">px</span>
            </div>
            <div
                className="d-flex app-border-white-round m-1"
                style={
                    roundSizePixel > 0
                        ? { opacity: 0.5, pointerEvents: 'none' }
                        : {}
                }
            >
                `Round Size %:
                <AppRangeComp
                    value={roundSizePercentage}
                    title={
                        roundSizePercentage > 0
                            ? 'Set round size pixel to 0 to use this'
                            : '`Round (%)'
                    }
                    setValue={(value) => {
                        onData({ roundSizePercentage: value });
                    }}
                    defaultSize={{
                        size: roundSizePercentage,
                        min: 0,
                        max: 100,
                        step: 1,
                    }}
                    isShowValue
                />
            </div>
            <div
                className="d-flex input-group m-1"
                style={{ width: '260px', height: '35px' }}
            >
                <div className="input-group-text">`Round size pixel:</div>
                <input
                    type="number"
                    className="form-control"
                    value={roundSizePixel}
                    onChange={(event) => {
                        const value = parseInt(event.target.value, 10) || 0;
                        onData({
                            roundSizePixel: value,
                            roundSizePercentage: 0,
                        });
                    }}
                />
                <div className="input-group-text">px</div>
            </div>
        </div>
    );
}
