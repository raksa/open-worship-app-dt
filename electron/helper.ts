export function genRoutProps(routeType: string) {
    const urlPathname = routeType !== 'main' ? `/${routeType}.html` : '';
    const url = `http://localhost:3000${urlPathname}`;
    const htmlFile = `${__dirname}/../../dist/${routeType}.html`;
    const preloadFile = `${__dirname}/client/${routeType}Preload.js`;
    return {
        url,
        htmlFile,
        preloadFile,
    };
}
