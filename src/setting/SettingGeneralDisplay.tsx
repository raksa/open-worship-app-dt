import { DisplayType, saveDisplaySetting } from '../server/displayHelper';

export default function SettingGeneralDisplay() {
    const displays: DisplayType[] = [];
    const presentDisplay = displays[0];
    return (
        <div className='card'>
            <div className='card-header'>Display</div>
            <div className='card-body'>
                <div className='input-group'>
                    <span >Present Display:</span>
                    <select className='form-select'
                        aria-label='Default select example'
                        value={presentDisplay.id} onChange={(e) => {
                            saveDisplaySetting({
                                presentId: 0,
                                presentDisplayId: e.target.value,
                            });
                        }}>
                        {displays.map(({ id, bounds }, i) => {
                            return (
                                <option key={i} value={id}>
                                    screen{i} {bounds.width}x{bounds.height}
                                </option>
                            );
                        })}
                    </select>
                </div>
            </div>
        </div>
    );
}
