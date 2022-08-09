import { showAppContextMenu } from '../../others/AppContextMenu';
import PresentTransitionEffect from './PresentTransitionEffect';
import {
    PresentTransitionEffectType,
    TargetType,
    transitionEffect,
    usePTEEvents,
} from './transitionEffectHelpers';

function openContextMenu(e: any,
    ptEffect: PresentTransitionEffect) {
    showAppContextMenu(e, Object.entries(transitionEffect).map(([effect, [icon]]) => {
        const isSelected = effect === ptEffect.effectType;
        return {
            title: effect,
            onClick: () => {
                ptEffect.effectType = effect as PresentTransitionEffectType;
            },
            otherChild: (
                <i className={`${icon} ps-1 ${isSelected ? 'highlight-selected' : ''}`} />
            ),
        };
    }));
}

export default function RenderTransitionEffect({ target }: {
    target: TargetType,
}) {
    const ptEffect = PresentTransitionEffect.getInstance(target);
    usePTEEvents(['update'], ptEffect);
    const selected = transitionEffect[ptEffect.effectType];
    return (
        <div className={'border-white-round p-1 pointer'}
            onClick={(e) => {
                openContextMenu(e, ptEffect);
            }}>
            {ptEffect.effectType as string}
            <i className={`${selected[0]} ps-1 'highlight-selected`} />
        </div>
    );
}

export function RendStyle({
    ptEffectTarget,
}: {
    ptEffectTarget: TargetType,
}) {
    const ptEffect = PresentTransitionEffect.getInstance(ptEffectTarget);
    usePTEEvents(['update'], ptEffect);
    return (
        <style>
            {ptEffect.style}
        </style>
    );
}
