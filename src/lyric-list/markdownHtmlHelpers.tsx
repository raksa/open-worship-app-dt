import ReactDOMServer from 'react-dom/server';

export function toIframe(html: string, title: string) {
    html = html.replace(
        /background-color:\s*[^;]+;/g,
        'background-color: transparent;',
    );
    html = ReactDOMServer.renderToStaticMarkup(
        <iframe
            srcDoc={html}
            title={title}
            style={{
                border: 'none',
                backgroundColor: 'transparent',
                width: '100%',
                height: '100%',
                overflow: 'hidden',
            }}
        />,
    );
    html = html.replace('<iframe', '<iframe allowtransparency="true" ');
    return html;
}
