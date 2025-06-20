import appProvider from '../../server/appProvider';
import SettingBibleJsonComp from './SettingBibleJsonComp';
import SettingBibleXMLComp from './SettingBibleXMLComp';

export default function SettingBibleComp() {
    return (
        <div className="w-100 h-100 p-1" style={{ overflow: 'auto' }}>
            <div className="m-1" style={{ minWidth: '90%' }}>
                <SettingBibleXMLComp />
            </div>
            {appProvider.systemUtils.isDev ? (
                <div className="m-1" style={{ minWidth: '90%' }}>
                    <SettingBibleJsonComp />
                </div>
            ) : null}
        </div>
    );
}
