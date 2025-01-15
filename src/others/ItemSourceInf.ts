import { AnyObjectType } from '../helper/helpers';
import { OptionalPromise } from './otherHelpers';

export default interface ItemSourceInf<T> {
    getMetadata(): OptionalPromise<AnyObjectType>;
    setMetadata(metaData: AnyObjectType): OptionalPromise<void>;

    getItems(): OptionalPromise<T[]>;
    setItems(items: T[]): OptionalPromise<void>;

    getItemByIndex(index: number): OptionalPromise<T | null>;

    getItemById(id: number): OptionalPromise<T | null>;
    setItemById(id: number, item: T): OptionalPromise<void>;

    showContextMenu(event: any): OptionalPromise<void>;
    showItemContextMenu(event: any, item: T): OptionalPromise<void>;
}
