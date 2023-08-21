import React, { Component } from 'react';
import { PdfImageDataType } from './PdfController';

export type PdfViewerStateType = {
};
export type PdfViewerPropsType = {
    images: PdfImageDataType[];
};
export default class PdfItemViewer extends
    Component<PdfViewerPropsType, PdfViewerStateType> {
    ref: React.RefObject<HTMLDivElement>;
    constructor(props: PdfViewerPropsType) {
        super(props);
        this.ref = React.createRef();
    }
    render() {
        return (
            <div style={{
                height: '600px',
                overflow: 'auto',
            }} ref={this.ref} >
                {this.props.images.map(({
                    width, height, src,
                }) => {
                    return (
                        <img key={src}
                            width={width}
                            height={height}
                            src={src} />
                    );
                })}
            </div>
        );
    }
}
