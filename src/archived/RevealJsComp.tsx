import 'reveal.js/dist/reveal.css';
import 'reveal.js/dist/theme/sky.css';

import Reveal from 'reveal.js';
import RevealMarkdownPlugin from 'reveal.js/plugin/markdown/markdown.esm.js';

import { useAppStateAsync } from '../helper/debuggerHelpers';
import { useFileSourceEvents } from '../helper/dirSourceHelpers';
import LoadingComp from '../others/LoadingComp';
import { getEditingValue } from './MonacoMDEditorAppComp';
import ReactDOMServer from 'react-dom/server';

function toMarkdownContent(content: string) {
    return ReactDOMServer.renderToStaticMarkup(
        <section data-markdown="">
            <textarea data-template defaultValue={content} />
        </section>,
    );
}

function readFileContent(filePath: string) {
    return new Promise<string | null>((resolve) => {
        const content = getEditingValue(filePath);
        resolve(toMarkdownContent(content));
    });
}

function ScreenComp({
    filePath,
}: Readonly<{
    filePath: string;
}>) {
    const { value: markdownContent, setValue: setMarkdownContent } =
        useAppStateAsync(readFileContent(filePath), [filePath]);
    useFileSourceEvents(
        ['update'],
        async (newContent?: string) => {
            if (newContent === undefined) {
                return;
            }
            setMarkdownContent(undefined);
            setMarkdownContent(toMarkdownContent(newContent));
        },
        [],
        filePath,
    );
    useFileSourceEvents(
        ['update'],
        async (newContent?: string) => {
            if (newContent === undefined) {
                return;
            }
            setMarkdownContent(newContent);
        },
        [],
        filePath,
    );
    if (markdownContent === undefined) {
        return <LoadingComp />;
    }
    if (markdownContent === null) {
        return <div>No content</div>;
    }
    return (
        <div
            className="reveal"
            ref={(div) => {
                if (div === null) {
                    return;
                }
                const deck = new Reveal(div, {
                    plugins: [RevealMarkdownPlugin],
                    transition: 'slide',
                    embedded: true,
                    progress: true,
                    keyboardCondition: 'focused',
                });
                (window as any).deck = deck;
                deck.initialize().then(() => {
                    console.log('deck initialized');
                });
                return () => {
                    try {
                        deck.destroy();
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    } catch (error) {
                        console.warn('Reveal.js destroy call failed.');
                    }
                };
            }}
        >
            <div
                className="slides"
                dangerouslySetInnerHTML={{ __html: markdownContent }}
            />
        </div>
    );
}

export default function RevealJsComp() {
    const filePath = '/a/b.md';
    return (
        <div
            style={{
                width: '600px',
                height: '450px',
                margin: 'auto',
            }}
        >
            <ScreenComp filePath={filePath} />
        </div>
    );
}
