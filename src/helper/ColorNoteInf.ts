interface ColorNoteInf {
    getColorNote(): Promise<string | null>;
    setColorNote(color: string | null): Promise<void>;
}

export default ColorNoteInf;
