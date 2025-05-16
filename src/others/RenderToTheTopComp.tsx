function applyToTheTop(element: HTMLElement) {
    const parent = element.parentElement;
    if (!parent) {
        return;
    }
    parent.addEventListener('scroll', () => {
        if (parent.scrollTop > 0) {
            element.classList.add('show');
        } else {
            element.classList.remove('show');
        }
    });
}
export default function RenderToTheTopComp({
    style,
}: Readonly<{
    style?: React.CSSProperties;
}>) {
    return (
        <i
            className="app-to-the-top pointer bi bi-arrow-up-circle"
            title="Scroll to the top"
            style={style}
            ref={(element) => {
                if (element) {
                    applyToTheTop(element);
                }
            }}
            onClick={(event) => {
                // scroll parent to the top
                const parent = event.currentTarget.parentElement;
                if (parent) {
                    parent.scrollTo({
                        top: 0,
                        behavior: 'smooth',
                    });
                }
            }}
        />
    );
}
