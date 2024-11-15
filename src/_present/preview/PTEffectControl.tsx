import { usePresentManager } from '../PresentManager';
import RenderTransitionEffect
    from '../transition-effect/RenderTransitionEffect';

export default function PTEffectControl() {
    const presentManager = usePresentManager();
    const presentId = presentManager.presentId;
    return (
        <>
            <RenderTransitionEffect title='bg:'
                target={'background'}
                presentId={presentId} />
            <RenderTransitionEffect title='slide:'
                target={'slide'}
                presentId={presentId} />
        </>
    );
}
