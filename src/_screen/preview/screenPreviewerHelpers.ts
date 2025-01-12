import { screenManagerSettingNames } from '../../helper/constants';
import { handleError } from '../../helper/errorHelpers';
import { isValidJson } from '../../helper/helpers';
import { getSetting } from '../../helper/settingHelpers';
import {
    ContextMenuItemType,
    showAppContextMenu,
} from '../../others/AppContextMenuComp';
import Slide from '../../app-document-list/Slide';
import ScreenManager from '../managers/ScreenManager';
import {
    getSelectedScreenManagerBases,
    getValidOnScreen,
} from '../managers/screenManagerBaseHelpers';
import { getAllScreenManagers } from '../managers/screenManagerHelpers';
import { AppDocumentListType } from '../screenHelpers';
import PdfSlide from '../../app-document-list/PdfSlide';

export function openContextMenu(event: any, screenManager: ScreenManager) {
    const screenManagers = getAllScreenManagers();
    const selectedScreenIds = screenManagers
        .filter((screenManager1) => {
            return screenManager1.isSelected;
        })
        .map((screenManager1) => {
            return screenManager1.screenId;
        });
    const isSolo =
        selectedScreenIds.length === 1 &&
        selectedScreenIds.includes(screenManager.screenId);
    const isOne = screenManagers.length === 1;
    const { screenFullTextManager } = screenManager;
    const isShowingFT = !!screenFullTextManager.fullTextItemData;
    const isLineSync = screenFullTextManager.isLineSync;
    const extraMenuItems = isShowingFT
        ? [
              {
                  menuTitle: `${isLineSync ? 'Un' : ''}Set Line Sync`,
                  onClick() {
                      screenFullTextManager.isLineSync = !isLineSync;
                  },
              },
          ]
        : [];
    const menuItems: ContextMenuItemType[] = [
        ...(isOne || isSolo
            ? []
            : [
                  {
                      menuTitle: 'Solo',
                      onClick() {
                          getSelectedScreenManagerBases().forEach(
                              (screenManager1) => {
                                  screenManager1.isSelected = false;
                              },
                          );
                          screenManager.isSelected = true;
                      },
                  },
              ]),
        ...(isOne
            ? []
            : [
                  {
                      menuTitle: screenManager.isSelected
                          ? 'Deselect'
                          : 'Select',
                      onClick() {
                          screenManager.isSelected = !screenManager.isSelected;
                      },
                  },
                  {
                      menuTitle: 'Delete',
                      onClick: () => {
                          screenManager.delete();
                      },
                  },
              ]),
        ...extraMenuItems,
        {
            menuTitle: 'Refresh Preview',
            onClick() {
                getAllScreenManagers().forEach((screenManager) => {
                    screenManager.fireResizeEvent();
                });
            },
        },
    ];
    showAppContextMenu(event, menuItems);
}

export function getAppDocumentListOnScreenSetting(): AppDocumentListType {
    const str = getSetting(screenManagerSettingNames.SLIDE, '');
    try {
        if (!isValidJson(str, true)) {
            return {};
        }
        const json = JSON.parse(str);
        Object.values(json).forEach((item: any) => {
            if (typeof item.filePath !== 'string') {
                throw new Error('Invalid slide path');
            }
            if (!PdfSlide.tryValidate(item.itemJson)) {
                Slide.validate(item.itemJson);
            }
        });
        return getValidOnScreen(json);
    } catch (error) {
        handleError(error);
    }
    return {};
}
