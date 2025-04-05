import { showSimpleToast } from '../toast/toastHelpers';

function blockUnload(event: BeforeUnloadEvent) {
    event.preventDefault();
    showSimpleToast(
        'Audio playing',
        'Please stop the audio before leaving the page.',
    );
}

function checkAudioPlaying() {
    return Array.from(document.querySelectorAll('audio')).some(
        (audioElement) => {
            return !audioElement.paused;
        },
    );
}

export const audioEvent = {
    onChange: (_isPlay: boolean) => {},
};

export function handleAudioPlaying(event: any) {
    const audioElement = event.target;
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach((element) => {
        if (element !== audioElement) {
            element.pause();
            element.currentTime = 0;
        }
    });
    window.addEventListener('beforeunload', blockUnload);
    audioEvent.onChange(checkAudioPlaying());
}

export function handleAudioPausing(_event: any) {
    const isPlaying = checkAudioPlaying();
    if (!isPlaying) {
        window.removeEventListener('beforeunload', blockUnload);
    }
    audioEvent.onChange(isPlaying);
}

export function handleAudioEnding(event: any) {
    const audioElement = event.target;
    audioElement.currentTime = 0;
    const isPlaying = checkAudioPlaying();
    if (!isPlaying) {
        window.removeEventListener('beforeunload', blockUnload);
    }
    audioEvent.onChange(isPlaying);
}
