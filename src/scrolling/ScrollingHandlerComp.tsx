import {
    TO_THE_TOP_STYLE_STRING,
    TO_THE_TOP_CLASSNAME,
    applyToTheTop,
    applyPlayToBottom,
} from './scrollingHandlerHelpers';

export default function ScrollingHandlerComp({
    style,
    shouldSnowPlayToBottom = false,
}: Readonly<{
    style?: React.CSSProperties;
    shouldSnowPlayToBottom?: boolean;
}>) {
    return (
        <>
            <style>{TO_THE_TOP_STYLE_STRING}</style>
            {shouldSnowPlayToBottom ? (
                <i
                    className="play-to-bottom bi bi-chevron-double-down pointer"
                    style={{
                        width: '45px',
                        height: '45px',
                    }}
                    ref={(element) => {
                        if (element) {
                            applyPlayToBottom(element);
                        }
                    }}
                />
            ) : null}
            <i
                className={`${TO_THE_TOP_CLASSNAME} bi bi-arrow-up-circle`}
                title="Scroll to the top"
                style={{
                    width: '45px',
                    height: '45px',
                    ...(style ?? {}),
                }}
                ref={(element) => {
                    if (element) {
                        applyToTheTop(element);
                    }
                }}
            />
        </>
    );
}
