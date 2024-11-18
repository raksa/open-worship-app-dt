import { useScreenManager } from '../ScreenManager';
import RenderTransitionEffect
    from '../transition-effect/RenderTransitionEffect';

export default function PTEffectControl() {
    const screenManager = useScreenManager();
    const screenId = screenManager.screenId;
    return (
        <>
            <RenderTransitionEffect title='bg:'
                target={'background'}
                screenId={screenId} />
            <RenderTransitionEffect title='slide:'
                target={'slide'}
                screenId={screenId} />
        </>
    );
}
