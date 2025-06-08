import { createContext, use } from 'react';
import { fsCheckFileExist, getMimetypeExtensions } from '../server/fileHelpers';
import Lyric from './Lyric';
import { getSetting, setSetting } from '../helper/settingHelpers';

const SELECTED_LYRIC_SETTING_NAME = 'selected-lyric';

async function checkSelectedFilePathExist(filePath: string) {
    if (!filePath || !(await fsCheckFileExist(filePath))) {
        setSelectedLyricFilePath(null);
        return false;
    }
    return true;
}

export async function getSelectedLyricFilePath() {
    const selectedFilePath = getSetting(SELECTED_LYRIC_SETTING_NAME, '');
    const isValid = await checkSelectedFilePathExist(selectedFilePath);
    if (!isValid) {
        return null;
    }
    return selectedFilePath;
}

export function setSelectedLyricFilePath(filePath: string | null) {
    setSetting(SELECTED_LYRIC_SETTING_NAME, filePath ?? '');
}

export async function getSelectedLyric() {
    const selectedAppDocumentFilePath = await getSelectedLyricFilePath();
    if (selectedAppDocumentFilePath === null) {
        return null;
    }
    return Lyric.getInstance(selectedAppDocumentFilePath);
}

export async function setSelectedLyric(lyric: Lyric | null) {
    setSelectedLyricFilePath(lyric?.filePath ?? null);
}

export function checkIsMarkdown(extension: string): boolean {
    const markdownExtensions = getMimetypeExtensions('markdown');
    return markdownExtensions.includes(extension.toLowerCase());
}

export const SelectedLyricContext = createContext<{
    selectedLyric: Lyric | null;
    setSelectedLyric: (newLyric: Lyric | null) => void;
} | null>(null);

function useContext() {
    const context = use(SelectedLyricContext);
    if (context === null) {
        throw new Error('No SelectedLyricContext found');
    }
    return context;
}

export function useSelectedLyricContext() {
    const context = useContext();
    if (context.selectedLyric === null) {
        throw new Error('No selected lyric');
    }
    return context.selectedLyric;
}

export function useSelectedLyricSetterContext() {
    const context = useContext();
    return context.setSelectedLyric;
}
