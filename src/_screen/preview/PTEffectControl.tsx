import { useScreenManagerContext } from '../ScreenManager';
import RenderTransitionEffect
    from '../transition-effect/RenderTransitionEffect';

export default function PTEffectControl() {
    const screenManager = useScreenManagerContext();
    return (
        <>
            <RenderTransitionEffect title='slide:'
                screenEffectManager={screenManager.slideEffectManager}
            />
            <RenderTransitionEffect title='bg:'
                screenEffectManager={screenManager.backgroundEffectManager}
            />
        </>
    );
}
