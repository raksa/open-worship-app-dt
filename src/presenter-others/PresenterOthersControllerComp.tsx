import appProvider from '../server/appProvider';
import OtherCountDownComp from './OtherCountDownComp';
import OtherImagesSlideShowComp from './OtherImagesSlideShowComp';
import OtherMessageComp from './OtherMessageComp';

export default function PresenterOthersControllerComp() {
    return (
        <div
            className="w-100 h-100 app-border-white-round"
            style={{
                overflowY: 'auto',
            }}
        >
            <OtherMessageComp />
            <hr />
            <OtherCountDownComp />
            <hr />
            <OtherImagesSlideShowComp />
            <hr />
            <div>TODO: Camera Show</div>
            {appProvider.systemUtils.isDev ? (
                <>
                    <hr />
                    <div>TODO: Javascript Show</div>
                </>
            ) : null}
        </div>
    );
}
