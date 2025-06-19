import Lyric from './Lyric';
import { handleError } from '../helper/errorHelpers';
import CacheManager from '../others/CacheManager';
import { unlocking } from '../server/appHelpers';
import appProvider from '../server/appProvider';

type RenderMarkdownOptions = {
    isOptimized?: boolean; // If true, will not render music notation
};
function wrapHTML({
    html,
    theme = 'dark',
    options = {},
}: {
    html: string;
    theme?: string;
    options?: RenderMarkdownOptions;
}) {
    return `
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <style>
        .dark::-webkit-scrollbar-track {
            box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.1);
            background-color: #adb5bd;
            border-radius: 10px;
        }
        .dark::-webkit-scrollbar {
            width: 7px;
            height: 7px;
            background-color: #6c757d;
        }
        .dark::-webkit-scrollbar-thumb {
            border-radius: 10px;
            background-color: #6c757d;
            background-image: gradient(linear, 40% 0%, 75% 84%, from(#343a40), to(#343a40), color-stop(0.6, #6c757d));
        }
        .dark::-webkit-scrollbar-corner {
            background-color: #6c757d;
        }
        body {
            margin: 0;
            padding: 3px;
            width: 100vw;
            height: 100vh;
            overflow: hidden;
        }
        #container {
            ${
                options.isOptimized
                    ? `
                display: flex;
                flex-direction: column;
                align-items: center;
                pointer-events: none;
                `
                    : ''
            }
            width: 100vw;
            height: 100vh;
            overflow: auto;
        }
    </style>
    <body>
        <div id="container" class="${theme}">
            ${html}
        </div>
        <script>
            const container = document.getElementById('container');
            if (container) {
                container.scrollTop = 0;
                container.scrollLeft = 0;
            }
        </script>
    </body>
</html>
`;
}

const cacher = new CacheManager<string>(10); // 10 second
export async function renderMarkdown(
    text: string,
    options?: RenderMarkdownOptions,
) {
    const hashKey = appProvider.systemUtils.generateMD5(text);
    const cached = await cacher.get(hashKey);
    if (cached) {
        return cached;
    }
    const MarkdownIt = (await import('markdown-it')).default;
    const MarkdownItMusic = (await import('markdown-it-music')).default;
    const markdown = new MarkdownIt({ html: true }).use(MarkdownItMusic);
    (markdown as any).setTheme('dark');
    let html = '';
    try {
        html = wrapHTML({
            html: markdown.render(text),
            options,
        });
    } catch (error) {
        handleError(error);
        html = wrapHTML({
            html: `<pre>${text}</pre>`,
        });
    }
    await cacher.set(hashKey, html);
    return html;
}

export async function renderLyricMarkdown(lyric: Lyric) {
    return unlocking(`lyric-slides-${lyric.filePath}`, async () => {
        const content = await lyric.getContent();
        return renderMarkdown(content, {
            isOptimized: true,
        });
    });
}
