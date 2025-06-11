import DisplayControl from './DisplayControl';
import ScreenEffectControlComp from './ScreenEffectControlComp';

export default function ScreenPreviewerFooterComp() {
    return (
        <div
            className="card-footer w-100"
            style={{
                overflowX: 'auto',
                overflowY: 'hidden',
                height: '25px',
                padding: '1px',
            }}
        >
            <div className="d-flex w-100 h-100">
                <DisplayControl />
                <ScreenEffectControlComp />
            </div>
        </div>
    );
}
