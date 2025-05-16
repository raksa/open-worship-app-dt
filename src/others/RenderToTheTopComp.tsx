export const TO_THE_TOP_CLASSNAME = 'app-to-the-top';
export const TO_THE_TOP_STYLE_STRING = `
.play-to-bottom {
    padding: 0;
    margin: 0;
    font-size: 30px;
    text-align: center;
    position: absolute;
    right: 5px;
    bottom: 30px;
    opacity: 0.1;
    transition: opacity 0.3s ease-in-out;
}
.play-to-bottom.going {
    opacity: 0.4;
}
.play-to-bottom:hover {
    opacity: 1;
}
.${TO_THE_TOP_CLASSNAME} {
    padding: 0;
    margin: 0;
    border-radius: 50%;
    font-size: 30px;
    text-align: center;
    position: absolute;
    right: 5px;
    bottom: 5px;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
}
.${TO_THE_TOP_CLASSNAME}.show {
    opacity: 0.1;
    pointer-events: all;
    cursor: pointer;
}
.${TO_THE_TOP_CLASSNAME}.show:hover {
    opacity: 1;
}
`;
function checkElement(parent: HTMLElement, element: HTMLElement) {
    if (parent.scrollTop > 0) {
        element.classList.add('show');
    } else {
        element.classList.remove('show');
    }
}
export function applyToTheTop(element: HTMLElement) {
    const parent = element.parentElement;
    if (!parent) {
        return;
    }
    const scrollCallback = ((element as any)._scrollCallback = () => {
        checkElement(parent, element);
    });
    parent.addEventListener('scroll', scrollCallback);
    element.onclick = () => {
        parent.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };
    checkElement(parent, element);
}
const speedOffset = 0.01;
function applyPlayToBottom(element: HTMLElement) {
    const parent = element.parentElement;
    if (!parent) {
        return;
    }
    element.title =
        'Click to scroll to the bottom, double click to speed up, ' +
        'right click to slow down, Alt + right click to stop';
    let speed = 0;
    let scrollTop = 0;
    const setSpeed = (newSpeed: number) => {
        if (newSpeed < 0) {
            newSpeed = 0;
        }
        speed = newSpeed;
        element.title = newSpeed.toString();
    };
    const preventEvent = (event: Event) => {
        event.stopPropagation();
        event.preventDefault();
    };
    element.onclick = (event) => {
        preventEvent(event);
        setSpeed(speed + speedOffset);
        scrollTop = parent.scrollTop;
        const scrollToBottom = () => {
            if (speed <= 0) {
                return;
            }
            const isAtBottom =
                parent.scrollTop >=
                parent.scrollHeight - parent.clientHeight - 1;
            if (!isAtBottom) {
                scrollTop += 0.05 + speed;
                scrollTop = Math.max(parent.scrollTop, scrollTop);
                parent.scrollTop = scrollTop;
                element.classList.add('going');
                requestAnimationFrame(scrollToBottom);
            } else {
                element.classList.remove('going');
                setSpeed(0);
            }
        };
        scrollToBottom();
    };
    element.oncontextmenu = (event) => {
        preventEvent(event);
        if (event.altKey) {
            setSpeed(0);
            return;
        }
        setSpeed(speed - speedOffset);
    };
    element.ondblclick = (event) => {
        preventEvent(event);
        if (speed <= 0) {
            return;
        }
        setSpeed(speed + speedOffset * 3);
    };
}

export default function RenderToTheTopComp({
    style,
}: Readonly<{
    style?: React.CSSProperties;
}>) {
    return (
        <>
            <style>{TO_THE_TOP_STYLE_STRING}</style>
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
