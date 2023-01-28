import { showAppContextMenu } from '../AppContextMenu';
import { copyToClipboard } from '../../server/appHelper';
import { AppColorType } from './helpers';

function showContextMenu(event: any, color: AppColorType) {
    showAppContextMenu(event, [{
        title: `Copy to '${color}' to clipboard`,
        onClick: () => {
            copyToClipboard(color);
        },
    }]);
}
export default function RenderColor({
    name, color, isSelected,
    onClick,
}: {
    name: string,
    color: AppColorType,
    isSelected?: boolean,
    onClick?: (event: MouseEvent, color: AppColorType) => void,
}) {
    return (
        <div title={name}
            onContextMenu={(event) => {
                showContextMenu(event, color);
            }}
            className={'m-1 color-item pointer' +
                (isSelected ? ' highlight-selected' : '')}
            style={{
                width: '20px',
                height: '15px',
                backgroundColor: color,
            }}
            onClick={(event) => {
                onClick?.(event as any, color);
            }} />
    );
}
