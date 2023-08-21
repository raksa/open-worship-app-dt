import { useParams } from 'react-router-dom';
import appProvider from '../server/appProvider';

export const APP_MODAL_ROUTE_PATH = '/modal/';
export const DELIMITER = '_';

export enum AppModalType {
    BIBLE_SEARCH = 'bible-search',
    ALERT = 'alert',
    SETTING = 'setting',
};


export function toAppModalTypeData(modalType: string, data: string) {
    const encodedData = appProvider.appUtils.base64Encode(data);
    return encodeURIComponent(`${modalType}${DELIMITER}${encodedData}`);
}

export function fromAppModalTypeData(query?: string) {
    const [modalType, data] = query ? query.split(DELIMITER) : ['', ''];
    return {
        modalType,
        data: data ? appProvider.appUtils.base64Decode(data) : '',
    };
}

export function useModalTypeData() {
    const { query } = useParams<'query'>();
    return fromAppModalTypeData(query);
}