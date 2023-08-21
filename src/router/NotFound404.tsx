import { Link } from 'react-router-dom';
import { tran } from '../lang';
import { presentingTab } from './routeHelpers';

export function goHomeBack() {
    const url = new URL(window.location.href);
    url.pathname = presentingTab.routePath;
    window.location.href = url.href;
}

export default function NotFound404() {
    return (
        <div className={
            'w-100 h-100 d-flex justify-content-center align-items-center'
        }>
            <div className='card'>
                <div className='card-header'>
                    {tran('Nothing Found🙁')}
                </div>
                <Link to={presentingTab.routePath}
                    className='btn btn-sm btn-success'>
                    <i className='bi bi-house' />
                </Link>
            </div>
        </div>
    );
}
