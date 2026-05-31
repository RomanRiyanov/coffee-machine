# РемКофе — лендинг по ремонту кофемашин

Статический лендинг на **Astro (SSG) + SCSS (BEM) + TypeScript**. Первый экран —
покадровая анимация по скроллу (canvas), секция sticky. Без бэкенда.

## Установка в папку `coffee-repair`

Этот проект собран **без папки `frames`** — она у вас уже есть. Распакуйте архив
в `coffee-repair` так, чтобы рядом оказались `package.json`, `src/`, `public/` и
ваша папка `frames`.

### ВАЖНО: перенесите кадры в `public/`

Astro отдаёт статику только из папки `public/`. Переместите вашу папку `frames`
внутрь `public/`, чтобы получилось:

```
coffee-repair/
└── public/
    └── frames/
        ├── frame_0001.webp
        ├── frame_0002.webp
        └── …
```

Путь к кадру `/frames/frame_0001.webp` строится в `src/components/HeroScroll.astro`.

## Запуск

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # сборка в dist/
npm run preview  # предпросмотр прод-сборки
npm run check    # проверка типов
```

## Что подогнать под себя

1. **Кадры.** В `src/pages/index.astro` у компонента `<HeroScroll frameCount={120} />`
   поставьте реальное число кадров. Если имена файлов отличаются от
   `frame_0001.webp` (например `0001.png` или без нуля), поправьте функцию
   `framePath` в `src/components/HeroScroll.astro`:
   ```ts
   framePath: (i) => `/frames/${String(i + 1).padStart(4, '0')}.png`,
   ```
   «Длина» прокрутки анимации задаётся высотой секции `.hero { height: 320vh; }`
   там же — больше высота, медленнее проигрыш.

2. **Контент и SEO.** Всё в одном файле `src/data/business.ts`: название, телефон,
   адрес, гео, услуги, шаги, FAQ, соцсети. Оттуда же берутся данные для JSON-LD
   (LocalBusiness, Service, FAQPage).

3. **Домен.** Укажите реальный `site` в `astro.config.mjs` — от него зависят
   canonical и og:url.

4. **og-image.** Положите `public/og-image.jpg` (рекомендуемо 1200×630) для
   корректных превью в соцсетях.

## Возможные доработки (по желанию)

- `@astrojs/sitemap` + ссылка в `robots.txt` — автогенерация карты сайта.
- Self-host шрифтов через `@fontsource/chakra-petch`, `@fontsource/ibm-plex-sans`,
  `@fontsource/ibm-plex-mono` вместо Google Fonts — плюс к Lighthouse.
- Sticky-текст, меняющийся по ходу кадров анимации.
- Форма заявки (как Astro-остров на Vue, если понадобится реактивность).

## Структура

```
src/
├── data/business.ts        # контент + данные Schema.org
├── scripts/scroll-frames.ts # логика покадровой анимации (canvas)
├── styles/                  # SCSS: переменные, миксины, база, кнопки
├── components/HeroScroll.astro
├── layouts/Layout.astro     # meta, OG, canonical, шрифты, JSON-LD-слот
└── pages/index.astro        # секции + JSON-LD
```
