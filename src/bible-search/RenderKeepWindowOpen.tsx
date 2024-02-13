import { getSetting, useStateSettingBoolean } from '../helper/settingHelper';

const CLOSE_ON_ADD_BIBLE_ITEM = 'close-on-add-bible-item';

export function getIsKeepWindowOpen() {
    return getSetting(CLOSE_ON_ADD_BIBLE_ITEM) === 'true';
}

export default function RenderKeepWindowOpen() {
    const [isKeeping, setIsKeeping] = useStateSettingBoolean(
        CLOSE_ON_ADD_BIBLE_ITEM, false,
    );
    return (
        <div className='btn-group form-check form-switch'>
            <input className='form-check-input pointer'
                title='Keep window open when add bible item'
                type='checkbox' role='switch'
                id='present-previewer-showing-tool'
                checked={isKeeping}
                onChange={(event) => {
                    setIsKeeping(event.target.checked);
                }} />
        </div>
    );
}
