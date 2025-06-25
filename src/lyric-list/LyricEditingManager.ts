import { createContext, use } from 'react';
import { LyricEditingPropsType } from './LyricAppDocument';

class LyricEditingManager {
    lyricEditingProps: LyricEditingPropsType = {
        fontFamily: 'Battambang',
    };
}
export default LyricEditingManager;

export const LyricEditingManagerContext =
    createContext<LyricEditingManager | null>(null);

export function useLyricEditingManagerContext() {
    const context = use(LyricEditingManagerContext);
    if (context === null) {
        throw new Error(
            'useLyricEditingManagerContext must be used within a ' +
                'LyricEditingManagerProvider',
        );
    }
    return context;
}
