import React from 'react';
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
    if (bgSrc === null) {
        return null;
    }
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
    bgSrc: BackgroundSrcType;
};
type StateType = {
    bgSrc: BackgroundSrcType;
};
class RenderPresentBackground extends React.Component<PropsType, StateType> {
    constructor(props: PropsType) {
        super(props);
        this.state = {
            bgSrc: props.bgSrc,
        };
    }
    render() {
        const { bgSrc } = this.state;
        if (bgSrc.type === 'image') {
            return (
                <AppSuspense>
                    <PresentBackgroundImage
                        src={bgSrc.src} />
                </AppSuspense>
            );
        }
        if (bgSrc.type === 'video') {
            return (
                <AppSuspense>
                    <PresentBackgroundVideo
                        src={bgSrc.src} />;
                </AppSuspense>
            );
        }
        if (bgSrc.type === 'color') {
            return (
                <AppSuspense>
                    <PresentBackgroundColor
                        color={bgSrc.src as AppColorType} />
                </AppSuspense>
            );
        }
        return null;
    }

}
