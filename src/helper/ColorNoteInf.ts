interface ColorNoteInf {
    getColorNote(): Promise<string | null>;
    setColorNote(c: string | null): Promise<void>;
}

export default ColorNoteInf;
