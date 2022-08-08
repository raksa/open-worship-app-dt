import React from 'react';
import { getLastItem } from '../helper/helpers';
import AppSuspense from '../others/AppSuspense';
import { AppColorType } from '../others/ColorPicker';
import PresentBGManager, {
    BackgroundSrcType,
} from './PresentBGManager';
import { usePBGMEvents } from './presentHelpers';

const PresentBackgroundColor = React.lazy(() => import('./PresentBackgroundColor'));
const PresentBackgroundImage = React.lazy(() => import('./PresentBackgroundImage'));
const PresentBackgroundVideo = React.lazy(() => import('./PresentBackgroundVideo'));

export default function PresentBackground({ bgManager }: {
    bgManager: PresentBGManager;
}) {
    usePBGMEvents(['update'], bgManager);
    const bgSrc = bgManager.bgSrc;
    return (
        <div style={{
            pointerEvents: 'none',
            position: 'absolute',
            width: '100%',
            height: '100%',
            overflow: 'hidden',
        }}>
            <RenderPresentBackground bgSrc={bgSrc} />
        </div>
    );
}

type PropsType = {
    bgSrc: BackgroundSrcType | null;
};
type StateType = {
    bgSrcQueue: (BackgroundSrcType | null)[];
};
class RenderPresentBackground extends React.Component<PropsType, StateType> {
    constructor(props: PropsType) {
        super(props);
        this.state = {
            bgSrcQueue: [props.bgSrc],
        };
    }
    get lastBgSrc() {
        return getLastItem(this.state.bgSrcQueue) || null;
    }
    static getDerivedStateFromProps(props: PropsType, state: StateType) {
        const newBgSrc = props.bgSrc;
        const lastBgSrc = getLastItem(state.bgSrcQueue);
        if (lastBgSrc !== newBgSrc && lastBgSrc?.src !== newBgSrc?.src) {
            state.bgSrcQueue.push(newBgSrc);
        }
        return state;
    }
    render() {
        const lastBgSrc = this.lastBgSrc;
        if (lastBgSrc === null) {
            return null;
        }
        if (lastBgSrc.type === 'image') {
            return (
                <AppSuspense>
                    <PresentBackgroundImage
                        src={lastBgSrc.src} />
                </AppSuspense>
            );
        }
        if (lastBgSrc.type === 'video') {
            return (
                <AppSuspense>
                    <PresentBackgroundVideo
                        src={lastBgSrc.src} />;
                </AppSuspense>
            );
        }
        if (lastBgSrc.type === 'color') {
            return (
                <AppSuspense>
                    <PresentBackgroundColor
                        color={lastBgSrc.src as AppColorType} />
                </AppSuspense>
            );
        }
        return null;
    }

}
