import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import ru from './ru.json'
import uz from './uz.json'
import en from './en.json'
import tr from './tr.json'

export const SUPPORTED_LANGS = ['uz', 'ru', 'en', 'tr'] as const
export type Lang = (typeof SUPPORTED_LANGS)[number]

const stored = localStorage.getItem('lang') as Lang | null
const initial: Lang = stored && SUPPORTED_LANGS.includes(stored) ? stored : 'ru'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ru: { translation: ru },
      uz: { translation: uz },
      en: { translation: en },
      tr: { translation: tr },
    },
    lng: initial,
    fallbackLng: 'ru',
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
