import { useRef } from 'react';

import { useAppEffect } from '../helper/debuggerHelpers';
import { useScreenFullTextManagerEvents } from './managers/screenEventHelpers';
import ScreenFullTextManager from './managers/ScreenFullTextManager';
import {
    useScreenManagerContext,
    useScreenManagerEvents,
} from './managers/screenManagerHooks';

const styleText = `
#full-text {
    overflow-x: hidden;
    overflow-y: auto;
}

#full-text div {
    display: inline-block;
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
    table-layout: fixed;
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
    -webkit-font-smoothing: antialiased;
    border-left: 1px solid #000;
    text-align: left;
    vertical-align: top;
    line-height: 1.5em;
    padding: 0.3em;
    box-sizing: border-box;
}

#full-text td>span {
    padding-left: 0.2em;
    padding-right: 0.2em;
}

#full-text td .verse-number {
    -webkit-text-stroke: 0.01em greenyellow;
    color: rgba(172, 255, 47, 0.645);
    transform: scale(0.7) translateY(-0.3em);
    opacity: 0.7;
}

#full-text .header .bible-key {
    opacity: 0.5;
    font-weight: 100;
    transform: scale(0.7);
}

#full-text .header .title {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    text-align: left;
}

#full-text .highlight {
    border-radius: 0.5em;
    transition: background-color 0.5s ease;
    border: 0.05em solid transparent;
    cursor: pointer;
}

#full-text .highlight.hover {
    border-bottom-color: rgba(255, 255, 255, 0.1);
}

#full-text .highlight.selected {
    background: ${
        'linear-gradient(transparent, transparent, ' +
        'rgba(255, 0, 157, 0.6), transparent);'
    }
}`;

export default function ScreenFullTextComp() {
    const screenManager = useScreenManagerContext();
    useScreenManagerEvents(['resize'], screenManager, () => {
        screenManager.screenFullTextManager.render();
    });
    useScreenFullTextManagerEvents(['text-style']);
    const div = useRef<HTMLDivElement>(null);
    const { screenFullTextManager } = screenManager;
    useAppEffect(() => {
        if (div.current) {
            screenFullTextManager.div = div.current;
        }
    }, [div.current]);
    return (
        <>
            <style>{styleText}</style>
            <style>
                {`#full-text th, #full-text td {
                    ${ScreenFullTextManager.textStyleText}
                }`}
            </style>
            <div
                id="full-text"
                ref={div}
                style={screenFullTextManager.containerStyle}
            />
        </>
    );
}
