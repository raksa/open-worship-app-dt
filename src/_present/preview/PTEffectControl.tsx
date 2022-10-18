import PresentManager from '../PresentManager';
import RenderTransitionEffect from '../transition-effect/RenderTransitionEffect';

export default function PTEffectControl({
    presentManager,
}: {
    presentManager: PresentManager,
}) {
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
