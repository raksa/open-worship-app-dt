import {
    AppUtilsType, FileUtilsType, MessageUtilsType, PagePropsType, PathUtilsType,
    SystemUtilsType,
} from '../server/appProvider';

const appProviderScreen = (window as any).provider as PagePropsType & {
    isPresenter: boolean,
    isScreen: boolean,
    messageUtils: MessageUtilsType;
    fileUtils: FileUtilsType,
    pathUtils: PathUtilsType,
    systemUtils: SystemUtilsType,
    appUtils: AppUtilsType,
};

export default appProviderScreen;
