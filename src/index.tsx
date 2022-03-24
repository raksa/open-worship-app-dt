import './index.scss';

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import languages from './lang';
import { initApp } from './bible-helper/helpers';
import { getSelectedLangLocale } from './setting/SettingGeneral';

const resources = Object.fromEntries(Object.keys(languages).map((k) => {
  return [k, { translation: (languages as any)[k].tran }];
}));
i18next.use(initReactI18next) // passes i18n down to react-i18next
  .init({
    // the translations
    // (tip move them in a JSON file and import them,
    // or even better, manage them via a UI: https://react.i18next.com/guides/multiple-translation-files#manage-your-translations-with-a-management-gui)
    resources,
    lng: getSelectedLangLocale().locale, // if you're using a language detector, do not define the lng option
    fallbackLng: languages.en.locale,

    interpolation: {
      escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
    },
  });
initApp().then(() => {
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById('root'),
  );
});

const confirmEraseLocalStorage = () => {
  const isYes = window.confirm('We were sorry, Internal process error, do you want to clear all session?');
  if (isYes) {
    window.localStorage.clear();
  }
  window.location.reload();
};

if (window.process.env.NODE_ENV !== 'development') {
  window.onunhandledrejection = event => {
    confirmEraseLocalStorage();
  };

  window.onerror = function () {
    confirmEraseLocalStorage();
  };
}

