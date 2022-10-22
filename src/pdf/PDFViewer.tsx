import React, { Component } from 'react';

export type PDFViewerStateType = {
};
export type PDFViewerPropsType = {
    images: string[];
};
export default class PDFViewer extends Component<PDFViewerPropsType, PDFViewerStateType> {
    ref: React.RefObject<HTMLDivElement>;
    constructor(props: PDFViewerPropsType) {
        super(props);
        this.ref = React.createRef();
    }
    render() {
        return (
            <div style={{
                height: '600px',
                overflow: 'auto',
            }} ref={this.ref} >
                {this.props.images.map((image, index) => {
                    return (
                        <img key={index} src={image} />
                    );
                })}
            </div>
        );
    }
}
