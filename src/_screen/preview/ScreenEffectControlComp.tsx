import { useScreenManagerContext } from '../managers/screenManagerHelpers';
import RenderTransitionEffectComp
    from '../RenderTransitionEffectComp';

export default function ScreenEffectControlComp() {
    const screenManager = useScreenManagerContext();
    return (
        <>
            <RenderTransitionEffectComp title='slide:'
                screenEffectManager={screenManager.slideEffectManager}
            />
            <RenderTransitionEffectComp title='bg:'
                screenEffectManager={screenManager.backgroundEffectManager}
            />
        </>
    );
}
