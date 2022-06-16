import SlideController from './SlideController';

export default function SlideItem({ index, controller, itemClick, onContextMenu }: {
    index: number,
    controller: SlideController,
    itemClick: () => void,
    onContextMenu: (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => void,
}) {
    const slideName = controller.fileName.substring(0, controller.fileName.lastIndexOf('.'));
    return (
        <li className={`list-group-item ${controller.isSelected ? 'active' : ''} pointer`}
            data-index={index + 1}
            title={controller.filePath}
            onClick={() => itemClick()}
            onContextMenu={onContextMenu}>
            <i className="bi bi-file-earmark-slides" style={{
                color: controller.isThumbSelected ? 'green' : undefined,
            }} /> {slideName}
        </li>
    );
}