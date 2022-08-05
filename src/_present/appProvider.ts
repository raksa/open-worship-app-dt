import {
    FileUtilsType,
    MessageUtilsType,
    PathUtilsType,
    SystemUtilsType,
} from '../server/appProvider';

const appProvider = (window as any).provider as {
    messageUtils: MessageUtilsType;
    fileUtils: FileUtilsType,
    pathUtils: PathUtilsType,
    systemUtils: SystemUtilsType,
};

export default appProvider;
