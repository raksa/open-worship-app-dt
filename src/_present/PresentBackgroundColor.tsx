import { AppColorType } from '../others/color/helpers';

export default function PresentBackgroundColor({ color }: {
    color: AppColorType,
}) {
    return (
        <div style={{
            width: '100%',
            height: '100%',
            backgroundColor: color,
        }} />
    );
}
