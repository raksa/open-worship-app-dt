import './CustomHTMLPresentPreviewer';

export default function MiniPresentScreen() {
    return (
        <div className='highlight-selected' style={{
            overflow: 'hidden',
        }}>
            <mini-present-previewer presentId={0} />
        </div>
    );
}
