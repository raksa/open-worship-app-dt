import AppDocumentSourceAbs from '../helper/DocumentSourceAbs';
import { MimetypeNameType } from '../server/fileHelpers';
import ItemSourceInf from '../others/ItemSourceInf';
import { genPdfImagesPreview } from '../helper/pdfHelpers';
import PdfSlide from './PdfSlide';
import { AnyObjectType } from '../helper/helpers';
import { OptionalPromise } from '../others/otherHelpers';
import { showPdfDocumentContextMenu } from './appDocumentHelpers';
import { ContextMenuItemType } from '../context-menu/appContextMenuHelpers';
import { handleError } from '../helper/errorHelpers';

export default class PdfAppDocument
    extends AppDocumentSourceAbs
    implements ItemSourceInf<PdfSlide>
{
    static readonly mimetypeName: MimetypeNameType = 'slide';

    constructor(filePath: string) {
        super(filePath);
    }

    setMetadata(_metaData: AnyObjectType): OptionalPromise<void> {
        throw new Error('Method not implemented.');
    }
    setItems(_items: PdfSlide[]): OptionalPromise<void> {
        throw new Error('Method not implemented.');
    }
    setItemById(_id: number, _item: PdfSlide): OptionalPromise<void> {
        throw new Error('Method not implemented.');
    }

    showItemContextMenu(
        event: any,
        item: PdfSlide,
        extraMenuItems: ContextMenuItemType[] = [],
    ) {
        showPdfDocumentContextMenu(event, item, extraMenuItems);
    }

    async showContextMenu(_event: any) {
        throw new Error('Method not implemented.');
    }

    async getMetadata() {
        return {};
    }

    async getItems() {
        try {
            const imageFileInfoList = await genPdfImagesPreview(this.filePath);
            if (imageFileInfoList === null) {
                return [];
            }
            return imageFileInfoList.map(
                ({ src, pageNumber, width, height }) => {
                    return new PdfSlide(this.filePath, {
                        id: pageNumber,
                        imagePreviewSrc: src,
                        pdfPageNumber: pageNumber,
                        metadata: { width, height },
                    });
                },
            );
        } catch (error) {
            handleError(error);
        }
        return [];
    }

    async getItemByIndex(index: number) {
        const items = await this.getItems();
        return items[index] ?? null;
    }

    async getItemById(id: number) {
        const items = await this.getItems();
        return items.find((item) => item.id === id) ?? null;
    }

    static getInstance(filePath: string) {
        return this._getInstance(filePath, () => {
            return new PdfAppDocument(filePath);
        });
    }

    static checkIsThisType(item: any) {
        return item instanceof this;
    }

    checkIsSame(item: any) {
        if (PdfAppDocument.checkIsThisType(item)) {
            return this.filePath === item.filePath;
        }
    }

    toJson(): AnyObjectType {
        throw new Error('Method not implemented.');
    }
}
