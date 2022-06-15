import appProvider from '../helper/appProvider';
import {
    usePresentRenderText, usePresentToInputText,
} from '../bible-helper/helpers1';

export function SettingAbout() {
    const bookKey = 'PSA';
    const text = usePresentRenderText({
        bible: 'KJV',
        target: {
            book: bookKey, chapter: 150, startVerse: 6, endVerse: 6,
        },
    });
    const title = usePresentToInputText('KJV', bookKey, 150, 6, 6);
    return (
        <div>
            <div className="card border-success mb-3 mx-auto mt-5"
                style={{
                    maxWidth: '400px',
                    maxHeight: '275px',
                }}>
                <div className="card-header bg-transparent border-success">
                    KJV|{title}
                </div>
                <div className="card-body bg-transparent border-success select-text">
                    {text}
                </div>
            </div>
            <div className="alert alert-info">
                This is an open-source presentation app for worship service.
                Official Github repo here: <button className='btn btn-success'
                    onClick={() => {
                        const url = 'https://github.com/OpenWorshipApp/open-worship-app-dt';
                        appProvider.electron.shell.openExternal(url);
                    }}
                >https://github.com/OpenWorshipApp/open-worship-app-dt</button>
            </div>
        </div>
    );
}
