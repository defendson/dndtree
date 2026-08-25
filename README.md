# dndtree

Сортируемое дерево на React, TypeScript, Ant Design, dnd-kit и Emotion.

Секции и поля хранятся в двух независимых `Form.List`, но отображаются как единое дерево. Во время перетаскивания используется временное визуальное состояние, которое записывается в Ant Design Form после drop.

## Структура виджета

```text
src/widgets/tree/
├── constants/
├── helpers/
├── hooks/
├── ui/
│   ├── AdditionalField/
│   ├── AdditionalFieldSection/
│   ├── DragHandle/
│   ├── HiddenListFields/
│   └── Tree/
├── index.ts
└── types.ts
```

Каждая общая константа и чистая helper-функция находится в отдельном файле. Публичный API виджета экспортируется через `src/widgets/tree/index.ts`.

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
