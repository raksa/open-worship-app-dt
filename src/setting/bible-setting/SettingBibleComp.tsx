import SettingBibleJsonComp from './SettingBibleJsonComp';
import SettingBibleXMLComp from './SettingBibleXMLComp';

export default function SettingBibleComp() {
    return (
        <div className="w-100">
            <SettingBibleXMLComp />
            <hr />
            <SettingBibleJsonComp />
        </div>
    );
}
