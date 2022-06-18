export default function Tool({ title, children }: {
    title?: string, children: any | any[],
}) {
    return (
        <div className='tool'>
            {title && <div>{title}</div>}
            <div>{children}</div>
        </div>
    );
}
