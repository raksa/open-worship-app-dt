import AppRange from '../others/AppRange';

const rangeId = 'preview-fon-size';
export default function BibleViewSetting({
    fontSize, setFontSize, minFontSize, maxFontSize, stepFontSize,
}: Readonly<{
    minFontSize: number,
    maxFontSize: number,
    stepFontSize: number,
    fontSize: number,
    setFontSize: (fontSize: number) => void,
}>) {
    return (
        <div className='bible-view-setting' style={{
            maxWidth: 450,
        }}>
            <div className='input-group d-flex'>
                <div className='flex-fill d-flex mx-1'>
                    <div className='d-flex flex-fill'>
                        <label htmlFor={rangeId} className='form-label'>
                            Font Size ({fontSize}px):
                        </label>
                        <AppRange
                            value={fontSize}
                            title='Font Size'
                            id={rangeId}
                            setValue={setFontSize}
                            defaultSize={{
                                size: fontSize,
                                min: minFontSize,
                                max: maxFontSize,
                                step: stepFontSize,
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
