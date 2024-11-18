import colorList from '../../others/color-list.json';

const screenIdColorMap: Record<string, string> = {};
export function genColorFromScreenId(screenId: number) {
    if (screenIdColorMap[screenId]) {
        return screenIdColorMap[screenId];
    }
    const allColors = (
        Object.values(colorList.main).concat(Object.values(colorList.extension))
    );
    const colorIndex = screenId % allColors.length;
    const color = allColors[colorIndex];
    screenIdColorMap[screenId] = color;
    return color;
}

export default function ShowingScreenIcon({ screenId }: Readonly<{
    screenId: number,
}>) {
    const color = genColorFromScreenId(screenId);
    return (
        <span title={`Screen: ${screenId}`}>
            <i className='bi bi-collection' style={{ color }} />
            {screenId}
        </span>
    );
}
