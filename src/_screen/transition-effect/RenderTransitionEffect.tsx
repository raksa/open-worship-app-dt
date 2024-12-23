import { showAppContextMenu } from '../../others/AppContextMenu';
import { useScreenManagerContext } from '../ScreenManager';
import ScreenTransitionEffect from './ScreenTransitionEffect';
import {
    ScreenTransitionEffectType, TargetType, transitionEffect, usePTEEvents,
} from './transitionEffectHelpers';

function openContextMenu(
    event: any, ptEffect: ScreenTransitionEffect,
) {
    const transitionEffectList = Object.entries(transitionEffect);
    showAppContextMenu(event, transitionEffectList.map(([effect, [icon]]) => {
        const isSelected = effect === ptEffect.effectType;
        return {
            menuTitle: effect,
            onClick: () => {
                ptEffect.effectType = effect as ScreenTransitionEffectType;
            },
            otherChild: (
                <i className={
                    `${icon} ps-1 ${isSelected ? 'highlight-selected' : ''}`
                } />
            ),
        };
    }));
}

export default function RenderTransitionEffect({
    title, screenId, target,
}: Readonly<{
    title: string,
    screenId: number,
    target: TargetType,
}>) {
    const ptEffect = ScreenTransitionEffect.getInstance(screenId, target);
    usePTEEvents(['update'], ptEffect);
    const selected = transitionEffect[ptEffect.effectType];
    return (
        <button type='button' className='btn btn-outline-secondary'
            onClick={(event) => {
                openContextMenu(event, ptEffect);
            }}>
            {title}
            <i className={`${selected[0]} ps-1 'highlight-selected`} />
        </button>
    );
}

export function RendStyle({ ptEffectTarget }: Readonly<{
    ptEffectTarget: TargetType,
}>) {
    const screenManager = useScreenManagerContext();
    const ptEffect = ScreenTransitionEffect.getInstance(
        screenManager.screenId, ptEffectTarget,
    );
    usePTEEvents(['update'], ptEffect);
    return (
        <style>
            {ptEffect.style}
        </style>
    );
}
