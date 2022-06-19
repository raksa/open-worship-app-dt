interface ColorNorteInf {
    get colorNote(): string | null;
    set colorNote(c: string | null);
    save(): Promise<boolean>;
}

export default ColorNorteInf;
