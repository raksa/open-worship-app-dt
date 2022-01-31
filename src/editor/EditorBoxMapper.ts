import { BoxEditor } from './BoxEditor';

export default class EditorBoxMapper {
    _editors: { [key: string]: BoxEditor | null } = {};
    setEditor(key: string, be: BoxEditor | null) {
        this._editors[key] = be;
    }
    getEditor(key: string) {
        return this._editors[key] || null;
    }
    getByIndex(index: number) {
        return this.boxEditors[index] || null;
    }
    get selectedBoxEditor() {
        const vs = this.boxEditors.find((e) => e?.isControllable || e?.isEditable);
        return vs || null;
    }
    get selectedIndex() {
        const vs = this.boxEditors.find((e) => e?.isControllable || e?.isEditable);
        return vs ? this.boxEditors.indexOf(vs) : -1;
    }
    get boxEditors() {
        return Object.values(this._editors);
    }
    stopAllEditing(exceptIndex?: number) {
        this.boxEditors.forEach((be, i) => {
            if (i !== exceptIndex) {
                be?.stopAllModes();
            }
        });
    }
    htmlHTMLList() {
        return this.boxEditors.filter((be) => {
            return !!be;
        }).map((be) => {
            return be?.toString();
        });
    }
}

export const mapper = new EditorBoxMapper();
