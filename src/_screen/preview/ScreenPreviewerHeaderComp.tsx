import ShowHideScreen from './ShowHideScreen';
import MiniScreenClearControlComp from './MiniScreenClearControlComp';
import ItemColorNoteComp from '../../others/ItemColorNoteComp';
import { useScreenManagerBaseContext } from '../managers/screenManagerHooks';

export default function ScreenPreviewerHeaderComp() {
    const screenManagerBase = useScreenManagerBaseContext();
    const isLocked = Math.random() > 0.5;
    return (
        <div
            className="card-header w-100 pb-2"
            style={{
                overflowX: 'auto',
                overflowY: 'hidden',
                height: '35px',
            }}
        >
            <div className="d-flex w-100 h-100">
                <div className="d-flex justify-content-start">
                    <ShowHideScreen />
                    <MiniScreenClearControlComp />
                </div>
                <div className="flex-fill d-flex justify-content-end ms-2">
                    <div className="ms-2">
                        <ItemColorNoteComp item={screenManagerBase} />
                    </div>
                    <div className="ms-2" title="TODO: implement this feature">
                        {isLocked ? (
                            <i className="bi bi-lock-fill" />
                        ) : (
                            <i className="bi bi-unlock" />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
