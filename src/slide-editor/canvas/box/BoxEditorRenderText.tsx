export default function BoxEditorRenderText({ text }: { text: string }) {
    return (
        <span dangerouslySetInnerHTML={{
            __html: text.split('\n').join('<br>'),
        }} />
    );
}
