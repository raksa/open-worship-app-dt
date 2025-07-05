import ScreenForegroundComp from '../ScreenForegroundComp';
import ScreenBackgroundComp from '../ScreenBackgroundComp';
import ScreenSlideComp from '../ScreenVaryAppDocumentComp';
import ScreenBibleComp from '../ScreenBibleComp';
import { getScreenManagerByScreenId } from '../managers/screenManagerHelpers';
import { ScreenManagerBaseContext } from '../managers/screenManagerHooks';

const IMAGE_BACKGROUND = `linear-gradient(45deg, var(--bs-gray-700) 25%, var(--bs-gray-800) 25%),
linear-gradient(-45deg, var(--bs-gray-700) 25%, var(--bs-gray-800) 25%),
linear-gradient(45deg, var(--bs-gray-800) 75%, var(--bs-gray-700) 75%),
linear-gradient(-45deg, var(--bs-gray-800) 75%, var(--bs-gray-700) 75%)`;

export default function MiniScreenAppComp({
    screenId,
}: Readonly<{
    screenId: number;
}>) {
    const screenManager = getScreenManagerByScreenId(screenId);
    if (screenManager === null) {
        return null;
    }
    return (
        <ScreenManagerBaseContext value={screenManager}>
            <div
                style={{
                    pointerEvents: 'none',
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backgroundImage: IMAGE_BACKGROUND,
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                }}
            />
            <ScreenBackgroundComp />
            <ScreenSlideComp />
            <ScreenBibleComp />
            <ScreenForegroundComp />
        </ScreenManagerBaseContext>
    );
}
