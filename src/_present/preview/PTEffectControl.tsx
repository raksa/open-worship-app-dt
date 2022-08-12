import PresentManager from '../PresentManager';
import RenderTransitionEffect from '../transition-effect/RenderTransitionEffect';

export default function PTEffectControl({
    presentManager,
}: {
    presentManager: PresentManager,
}) {
    return (
        <>
            <RenderTransitionEffect title='bg:'
                target={'background'}
                presentId={presentManager.presentId} />
            <RenderTransitionEffect title='slide:'
                target={'slide'}
                presentId={presentManager.presentId} />
        </>
    );
}
