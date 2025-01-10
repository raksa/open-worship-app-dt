import { freezeObject } from '../../helper/helpers';
import colorList from '../../others/color-list.json';

freezeObject(colorList);

const screenIdColorMap: Record<string, string> = {};
export function genColorFromScreenId(screenId: number) {
    if (screenIdColorMap[screenId]) {
        return screenIdColorMap[screenId];
    }
    const allColors = Object.values(colorList.main).concat(
        Object.values(colorList.extension),
    );
    const colorIndex = screenId % allColors.length;
    const color = allColors[colorIndex];
    screenIdColorMap[screenId] = color;
    return color;
}

export default function ShowingScreenIcon({
    screenId,
}: Readonly<{
    screenId: number;
}>) {
    const color = genColorFromScreenId(screenId);
    return (
        <span
            className="d-flex"
            title={`Screen: ${screenId}`}
            data-screen-id={screenId}
        >
            <i className="bi bi-collection" style={{ color }} />
            {screenId}
        </span>
    );
}
