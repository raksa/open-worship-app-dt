(window as any).reactDevtool = () => {
    const script = document.createElement('script');
    script.src = 'http://localhost:8097';
    document.head.appendChild(script);
};
