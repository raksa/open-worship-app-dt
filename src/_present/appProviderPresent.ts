import {
    FileUtilsType,
    MessageUtilsType,
    PathUtilsType,
    SystemUtilsType,
} from '../server/appProvider';

const appProviderPresent = (window as any).provider as {
    isMain: boolean,
    isPresent: boolean,
    messageUtils: MessageUtilsType;
    fileUtils: FileUtilsType,
    pathUtils: PathUtilsType,
    systemUtils: SystemUtilsType,
};

export default appProviderPresent;
