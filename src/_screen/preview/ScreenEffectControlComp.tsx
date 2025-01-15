import { useScreenManagerContext } from '../managers/screenManagerHooks';
import RenderTransitionEffectComp from '../RenderTransitionEffectComp';

export default function ScreenEffectControlComp() {
    const screenManager = useScreenManagerContext();
    return (
        <>
            <RenderTransitionEffectComp
                title="VAD:"
                screenEffectManager={screenManager.varyAppDocumentEffectManager}
            />
            <RenderTransitionEffectComp
                title="BG:"
                screenEffectManager={screenManager.backgroundEffectManager}
            />
        </>
    );
}
