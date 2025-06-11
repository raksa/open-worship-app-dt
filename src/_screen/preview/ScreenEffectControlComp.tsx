import { useScreenManagerContext } from '../managers/screenManagerHooks';
import RenderTransitionEffectComp from '../RenderTransitionEffectComp';

export default function ScreenEffectControlComp() {
    const screenManager = useScreenManagerContext();
    return (
        <>
            <RenderTransitionEffectComp
                title="Slide:"
                domTitle="Slide transition"
                screenEffectManager={screenManager.varyAppDocumentEffectManager}
            />
            <RenderTransitionEffectComp
                title="BG:"
                domTitle="Background transition"
                screenEffectManager={screenManager.backgroundEffectManager}
            />
        </>
    );
}
