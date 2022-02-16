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
        return Object.values(this._editors).filter((boxEditor) => !!boxEditor) as BoxEditor[];
    }
    stopAllModes() {
        return new Promise<boolean>((resolve) => {
            const promises = this.boxEditors.map((boxEditor) => boxEditor.stopAllModes());
            return Promise.all(promises).then((isSelectedList) => {
                resolve(isSelectedList.some((isSelected) => isSelected));
            });
        });
    }
}

export const editorMapper = new EditorBoxMapper();
