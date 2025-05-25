import { showAppContextMenu } from '../context-menu/AppContextMenuComp';
import ScreenEffectManager from './managers/ScreenEffectManager';
import {
    ScreenTransitionEffectType,
    transitionEffect,
    useScreenEffectEvents,
} from './transitionEffectHelpers';

function openContextMenu(event: any, screenEffectManager: ScreenEffectManager) {
    const transitionEffectList = Object.entries(transitionEffect);
    showAppContextMenu(
        event,
        transitionEffectList.map(([effect, [icon]]) => {
            const isSelected = effect === screenEffectManager.effectType;
            return {
                menuTitle: effect,
                onSelect: () => {
                    screenEffectManager.effectType =
                        effect as ScreenTransitionEffectType;
                },
                childAfter: (
                    <i
                        className={`${icon} ps-1 ${isSelected ? 'app-highlight-selected' : ''}`}
                    />
                ),
            };
        }),
    );
}

export default function RenderTransitionEffectComp({
    title,
    screenEffectManager,
}: Readonly<{
    title: string;
    screenEffectManager: ScreenEffectManager;
}>) {
    useScreenEffectEvents(['update'], screenEffectManager);
    const selected = transitionEffect[screenEffectManager.effectType];
    return (
        <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={(event) => {
                openContextMenu(event, screenEffectManager);
            }}
        >
            {title}
            <i className={`${selected[0]} ps-1 'app-highlight-selected`} />
        </button>
    );
}

export function RendStyle({
    screenEffectManager,
}: Readonly<{
    screenEffectManager: ScreenEffectManager;
}>) {
    useScreenEffectEvents(['update'], screenEffectManager);
    return <style>{screenEffectManager.style}</style>;
}
