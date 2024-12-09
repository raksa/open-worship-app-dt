import { goToPath } from '../router/routeHelpers';
import appProvider from '../server/appProvider';

export function QuickOrBackButton({
    title, defaultPage = appProvider.presenterHomePage,
}: Readonly<{
    title: string,
    defaultPage?: string,
}>) {
    return (
        <button className='btn btn-sm btn-outline-warning'
            title={title}
            onClick={() => {
                if (document.referrer) {
                    window.history.back();
                } else {
                    goToPath(defaultPage);
                }
            }}>
            <i className='bi bi-escape' />
        </button>
    );
}

export function SettingButton() {
    return (
        <button className='btn btn-outline-success rotating-hover'
            title='Setting'
            onClick={() => {
                goToPath(appProvider.settingHomePage);
            }}>
            <i className='bi bi-gear-wide-connected' />
        </button>
    );
}
