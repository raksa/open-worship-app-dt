import React from 'react';
import {
    getSetting,
    useStateSettingBoolean,
} from '../helper/settingHelper';

const settingName = 'full-text-present-auto-show';
export function checkIsFtAutoShow(): boolean {
    return getSetting(settingName, 'false') === 'true';
}
export default function FTPreviewerUtils({ onShow }: {
    onShow: (event: React.MouseEvent) => void,
}) {
    const [isAutoShow, setIsAutoShow] = useStateSettingBoolean(settingName);
    return (
        <div className={'utils border-white-round d-flex '
            + 'd-flex-row align-content-start p-1'}>
            <div className='d-flex'>
                <div className='input-group flex-fill   '>
                    <button className='btn btn-sm btn-info'
                        onClick={onShow}>Show</button>
                </div>
                <div className='d-flex flex-row ms-2'>
                    <div className={'form-check form-switch pointer'}
                        onClick={() => setIsAutoShow(!isAutoShow)}>
                        <input className='form-check-input'
                            type='checkbox' checked={isAutoShow}
                            onChange={() => false} />
                        <label className='form-check-label'
                            style={{
                                whiteSpace: 'nowrap',
                            }}>
                            <small>Auto Show</small>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}
