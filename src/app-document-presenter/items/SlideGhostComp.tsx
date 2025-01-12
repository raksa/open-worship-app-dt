export default function SlideGhostComp({
    width,
}: Readonly<{
    width: number;
}>) {
    return (
        <div
            className="slide-item"
            style={{
                width: `${width}px`,
                visibility: 'hidden',
            }}
        />
    );
}
