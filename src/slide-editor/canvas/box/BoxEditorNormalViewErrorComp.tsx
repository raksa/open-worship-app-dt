import { showAppContextMenu } from '../../../others/AppContextMenuComp';
import appProvider from '../../../server/appProvider';
import { useCanvasControllerContext } from '../CanvasController';
import { useCanvasItemContext } from '../CanvasItem';
import BoxEditorNormalWrapperComp from './BoxEditorNormalWrapperComp';

export default function BoxEditorNormalViewErrorComp() {
    const canvasController = useCanvasControllerContext();
    const canvasItem = useCanvasItemContext();
    return (
        <BoxEditorNormalWrapperComp style={canvasItem.getBoxStyle()}
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
                            JSON.stringify(canvasItem.props),
                        );
                    },
                }]);
            }}>
            Error
        </BoxEditorNormalWrapperComp>
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
