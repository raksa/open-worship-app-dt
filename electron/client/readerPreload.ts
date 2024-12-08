import provider from './fullProvider';

provider.isPresenter = false;
provider.isReader = true;

(global as any).provider = (window as any).provider = provider;
