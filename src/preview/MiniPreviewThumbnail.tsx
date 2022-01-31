import { useState } from 'react';
import { usePresentDataThrowing } from '../event/PresentEventListener';

export default function PreviewThumbnail() {
    const [src, setSrc] = useState('');
    usePresentDataThrowing((data) => {
        setSrc(data);
    });
    if (!src) {
        return (
            <div className="place-holder card" aria-hidden="true">
                <div className="card-body">
                    <p className="card-text placeholder-glow">
                        <span className="placeholder col-12 bg-info"></span>
                        <span className="placeholder col-12 bg-light"></span>
                        <span className="placeholder col-12 bg-dark"></span>
                        <span className="placeholder col-12"></span>
                        <span className="placeholder col-12 bg-primary"></span>
                        <span className="placeholder col-12 bg-secondary"></span>
                        <span className="placeholder col-12 bg-success"></span>
                        <span className="placeholder col-12 bg-danger"></span>
                        <span className="placeholder col-12 bg-warning"></span>
                        <span className="placeholder col-12 bg-info"></span>
                        <span className="placeholder col-12 bg-light"></span>
                        <span className="placeholder col-12 bg-dark"></span>
                    </p>
                </div>
            </div>
        );
    }
    return (
        <img className='image-in' src={src} alt="preview" style={{
            display: !src ? 'none' : '',
        }} />
    );
}
