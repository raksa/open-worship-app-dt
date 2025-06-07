import '../background/BackgroundImagesComp.scss';

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
                <div>
                    <select
                        className="form-select form-select-sm"
                        value={scaleType}
                        onChange={(event) => {
                            setScaleType(
                                event,
                                event.target.value as ImageScaleType,
                            );
                        }}
                    >
                        <option>--</option>
                        {scaleTypeList.map((scaleType) => {
                            return (
                                <option key={scaleType} value={scaleType}>
                                    {scaleType}
                                </option>
                            );
                        })}
                    </select>
                </div>
            </div>
        </>
    );
}

export default function ImagesShowComp() {
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
                <BackgroundMediaComp
                    dragType={DragTypeEnum.BACKGROUND_IMAGE}
                    rendChild={rendChild.bind(null, scaleType)}
                    dirSourceSettingName={'images-slide-show'}
                    onClick={handleClicking}
                />
            </div>
            <SlideAutoPlayComp
                prefix="images"
                onNext={(data) => {
                    console.log(data);
                }}
            />
        </div>
    );
}
