const fontUtils = {
    getFonts: async () => {
        return Array.from(document.fonts).map((font) => {
            return font.family;
        });
    },
};

export default fontUtils;
