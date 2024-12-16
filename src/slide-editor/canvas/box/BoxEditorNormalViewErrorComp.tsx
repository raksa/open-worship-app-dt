import { showAppContextMenu } from '../../../others/AppContextMenu';
import appProvider from '../../../server/appProvider';
import { useCanvasControllerContext } from '../CanvasController';
import CanvasItem from '../CanvasItem';

export default function BoxEditorNormalViewErrorComp({ canvasItem }: Readonly<{
    canvasItem: CanvasItem<any>,
}>) {
    const canvasController = useCanvasControllerContext();
    return (
        <div className='app-box-editor pointer'
            style={canvasItem.getBoxStyle()}
            onContextMenu={async (event) => {
                event.stopPropagation();
                showAppContextMenu(event as any, [{
                    menuTitle: 'Delete',
                    onClick: () => {
                        canvasController.deleteItem(canvasItem);
                    },
                }, {
                    menuTitle: 'Copy Error Json',
                    onClick: () => {
                        appProvider.browserUtils.copyToClipboard(
                            JSON.stringify(canvasItem.props));
                    },
                }]);
            }}
            onClick={async (event) => {
                event.stopPropagation();
                canvasController.stopAllMods();
                canvasController.setItemIsSelecting(canvasItem, true);
            }}>
            <div style={{
                ...canvasItem.getStyle(),
            }}>
                Error
            </div>
        </div>
    );
}

export function BENViewErrorRender() {
    return (
        <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '5.5rem',
            color: 'red',
        }}>
            Error
        </div>
    );
}
