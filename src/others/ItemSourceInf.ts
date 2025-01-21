import { AnyObjectType } from '../helper/helpers';
import { OptionalPromise } from './otherHelpers';

export interface ItemSourceInfBasic<T> {
    getItemById(id: number): OptionalPromise<T | null>;
    setItemById(id: number, item: T): OptionalPromise<void>;
}

export default interface ItemSourceInf<T> extends ItemSourceInfBasic<T> {
    getMetadata(): OptionalPromise<AnyObjectType>;
    setMetadata(metaData: AnyObjectType): OptionalPromise<void>;

    getItems(): OptionalPromise<T[]>;
    setItems(items: T[]): OptionalPromise<void>;

    getItemByIndex(index: number): OptionalPromise<T | null>;

    showContextMenu(event: any): OptionalPromise<void>;
    showItemContextMenu(event: any, item: T): OptionalPromise<void>;
}
