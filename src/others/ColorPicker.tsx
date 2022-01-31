import './ColorPicker.scss';

import { copyToClipboard } from '../helper/electronHelper';
import { showAppContextMenu } from '../helper/AppContextMenu';


export default function ColorPicker({ color, onColorChange }: {
    color: string, onColorChange: (color: string) => void
}) {
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const color = e.target.value;
        onColorChange(color);
    };
    return (
        <div className="color-picker">
            <div>
                <input type="color" onChange={onChange} onInput={onChange} value={color} />
            </div>
            {[
                '#55efc4', '#81ecec', '#74b9ff', '#a29bfe', '#dfe6e9', '#b2bec3', '#6c5ce7', '#0984e3', '#00cec9',
                '#00b894', '#ffeaa7', '#fab1a0', '#ff7675', '#fd79a8', '#636e72', '#2d3436', '#e84393', '#d63031',
                '#e17055', '#fdcb6e',
            ].map((color, i) => {
                return <div key={`${i}`} className="item" style={{
                    backgroundColor: color,
                }} title={color} onContextMenu={(e) => {
                    showAppContextMenu(e, [
                        {
                            title: `Copy to Clipboard`, onClick: () => {
                                copyToClipboard(color);
                            }
                        },
                    ]);
                }} onClick={() => {
                    onColorChange(color);
                }} />;
            })}
        </div>
    );
}
