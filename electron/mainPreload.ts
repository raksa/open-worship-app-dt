import provider from './client/provider';

(global as any).provider = (window as any).provider = provider;
(global as any).isMain = (window as any).isMain = true;
