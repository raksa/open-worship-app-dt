import { useState } from 'react';

import { useAppEffectAsync } from '../helper/debuggerHelpers';
import { useSelectedLyricContext } from './lyricHelpers';
import { handleError } from '../helper/errorHelpers';
import Lyric from './Lyric';
import CacheManager from '../others/CacheManager';

const cacher = new CacheManager<string>(10); // 10 second
async function renderMarkdown(lyric: Lyric) {
    const content = await lyric.getContent();
    const cached = await cacher.get(content);
    if (cached) {
        return cached;
    }
    const MarkdownIt = (await import('markdown-it')).default;
    const MarkdownItMusic = (await import('markdown-it-music')).default;
    const markdown = new MarkdownIt({ html: true }).use(MarkdownItMusic);
    (markdown as any).setTheme('dark');
    let html = '';
    try {
        html = markdown.render(content);
    } catch (error) {
        handleError(error);
        html = `<pre>${content}</pre>`;
    }
    await cacher.set(content, html);
    return html;
}

export default function LyricSlidesComp() {
    const selectedLyric = useSelectedLyricContext();
    const [html, setHtml] = useState('');

    useAppEffectAsync(async () => {
        const html = await renderMarkdown(selectedLyric);
        setHtml(html);
    }, [selectedLyric]);
    return (
        <iframe
            className="w-100 h-100 p-0 m-0 overflow-hidden"
            srcDoc={html}
            sandbox="allow-same-origin allow-scripts"
            style={{
                border: 'none',
                backgroundColor: 'black',
            }}
            title="Lyric Slides"
        />
    );
}
