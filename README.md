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
