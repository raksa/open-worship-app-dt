import { OptionalPromise } from './otherHelpers';

export default interface DocumentInf {
    save(): OptionalPromise<boolean>;
}
