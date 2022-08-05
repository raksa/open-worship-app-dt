import provider from './mainProvider';

(global as any).provider = (window as any).provider = provider;
(global as any).isPresent = (window as any).isPresent = true;
