import appProvider from '../server/appProvider';

export function handleError(error: any) {
    appProvider.appUtils.handleError(error);
}