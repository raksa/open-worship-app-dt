const availableFonts: {
    [key: string]: string[],
} = {};
const fontStyleMapper = {
    'bold': 'Bold',
    'light': 'Light',
    'regular': 'Regular',
    'thin': 'Thin',
} as const;
const fontUtils = {
    getFonts: () => {
        return new Promise((resolve) => {
            if (Object.keys(availableFonts).length === 0) {
                const {
                    getAvailableFonts,
                } = require('electron-font-manager') as {
                    getAvailableFonts: (params?: {
                        [key: string]: string,
                    }) => string[],
                };
                getAvailableFonts().forEach((font) => {
                    if (font.includes('.')) {
                        return;
                    }
                    const arr = font.split('-');
                    const fontFamily = arr[0];
                    availableFonts[fontFamily] = availableFonts[fontFamily] || [];
                    const fontStyle = (arr[1] || '').toLowerCase();
                    if (fontStyleMapper[fontStyle]) {
                        availableFonts[fontFamily].push(
                            fontStyleMapper[fontStyle]);
                    }
                });
                Object.entries(availableFonts).forEach(([key, value]) => {
                    availableFonts[key] = value.sort();
                });
            }
            resolve(availableFonts);
        });
    },
};

export default fontUtils;
