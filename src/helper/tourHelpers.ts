import { dirSourceSettingNames } from './constants';
import { useAppEffect } from './debuggerHelpers';

export function useCheckSelectedDir(){
    useAppEffect(() => {
        console.log('useCheckSelectedDir');
        Object.values(dirSourceSettingNames).forEach((settingName) => {
            console.log(settingName);
        });
    }, []);
}
