# dndtree

Сортируемое дерево на React, TypeScript, Ant Design, dnd-kit и Emotion.

Секции и поля хранятся в двух независимых `Form.List`, но отображаются как единое дерево. Во время перетаскивания используется временное визуальное состояние, которое записывается в Ant Design Form после drop.

## Структура виджета

```text
src/widgets/tree/
├── constants/
│   └── index.ts
├── helpers/
│   └── index.ts
├── hooks/
│   └── index.ts
├── ui/
│   ├── AdditionalField/
│   ├── AdditionalFieldSection/
│   ├── DragHandle/
│   ├── HiddenListFields/
│   ├── Tree/
│   └── index.ts
├── index.ts
└── types.ts
```

Каждая общая константа и чистая helper-функция находится в отдельном файле. Папки `constants`, `helpers`, `hooks` и `ui` имеют собственный `index.ts` с реэкспортами, а публичный API виджета экспортируется через `src/widgets/tree/index.ts`.

## Запуск

```bash
npm install
npm run dev
```

Приложение откроется на [http://localhost:3010](http://localhost:3010).

## Проверки

```bash
npm run typecheck
npm run lint
npm run build
```
