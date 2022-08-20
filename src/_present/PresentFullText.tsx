import { useRef, useEffect } from 'react';
import { usePMEvents } from './presentEventHelpers';
import PresentManager from './PresentManager';

const styleText = `
#full-text {
    overflow-x: hidden;
    overflow-y: auto;
}

#full-text::-webkit-scrollbar {
    width: 0.2em;
}

#full-text::-webkit-scrollbar-track {
    background-color: #2752ff2a;
    border-radius: 5px;
}

#full-text::-webkit-scrollbar-thumb {
    border-radius: 5px;
    background-color: white;
}

#full-text table {
    width: 100%;
    background-color: #2752ff2a;
    border-radius: 0.1em;
    margin: 0.1em;
    margin-bottom: 1em;
    border-spacing: 0.1em;
    border-collapse: separate;
}

#full-text thead {
    background-color: #2752ff2a;
    padding-left: 0.5em;
    padding-right: 0.5em;
    -webkit-text-stroke-width: 0.01em;
}

#full-text th {
    border-radius: 0.1em;
}

#full-text th,
#full-text td {
    font-family: Battambang, system-ui, sans-serif !important;
    -webkit-font-smoothing: antialiased;
    border-left: 1px solid #000;
    text-align: left;
    vertical-align: top;
    line-height: 1.5em;
    /* TODO: use em instead */
    font-size: 111px;
    color: black;
    padding: 0.3em;
    box-sizing: border-box;
}

#full-text td>span {
    padding-left: 0.2em;
    padding-right: 0.2em;
}

#full-text td .verse-number {
    -webkit-text-stroke: 0.01em greenyellow;
}

#full-text td .highlight {
    border-radius: 0.5em;
    transition: background-color 0.5s ease;
    border: 0.05em solid transparent;
    cursor: pointer;
}

#full-text td .highlight.hover {
    border-bottom-color: rgba(255, 255, 255, 0.5);
}

#full-text td .highlight.selected {
    background: linear-gradient(transparent, transparent, rgba(255, 0, 157, 0.6), transparent);
}`;

export default function PresentFullText({ presentManager }: {
    presentManager: PresentManager;
}) {
    usePMEvents(['resize'], presentManager, () => {
        presentManager.presentFTManager.render();
    });
    const div = useRef<HTMLDivElement>(null);
    const { presentFTManager } = presentManager;
    useEffect(() => {
        if (div.current) {
            presentFTManager.div = div.current;
        }
    });
    return (
        <>
            <style>{styleText}</style>
            <style>{`
            #full-text th td {
                ${presentFTManager.textStyleText}
            }
            `}</style>
            <div id='full-text' ref={div}
                style={presentFTManager.containerStyle} />
        </>
    );
}
