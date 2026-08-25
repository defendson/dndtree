import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button, Form, Input } from 'antd'
import 'antd/dist/reset.css'
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import './App.css'

const INITIAL_VALUES = {
  additionalFieldsSections: [
    { guid: 'section-research', name: 'Исследование', sort: 0 },
    { guid: 'section-design', name: 'Проектирование', sort: 1 },
    { guid: 'section-build', name: 'Разработка', sort: 2 },
    { guid: 'section-release', name: 'Выпуск', sort: 3 },
  ],
  additionalFields: [
    {
      localId: 'item-interviews',
      fieldName: 'Интервью с командой',
      sectionGuid: 'section-research',
      sectionSort: 0,
    },
    {
      localId: 'item-feedback',
      fieldName: 'Собрать обратную связь',
      sectionGuid: 'section-research',
      sectionSort: 1,
    },
    {
      localId: 'item-journey',
      fieldName: 'Обновить карту пути',
      sectionGuid: 'section-design',
      sectionSort: 0,
    },
    {
      localId: 'item-prototype',
      fieldName: 'Подготовить прототип',
      sectionGuid: 'section-design',
      sectionSort: 1,
    },
    {
      localId: 'item-api',
      fieldName: 'Сверить API-контракт',
      sectionGuid: 'section-build',
      sectionSort: 0,
    },
    {
      localId: 'item-layout',
      fieldName: 'Собрать адаптивную сетку',
      sectionGuid: 'section-build',
      sectionSort: 1,
    },
    {
      localId: 'item-onboarding',
      fieldName: 'Сценарий первого запуска',
      sectionGuid: 'section-release',
      sectionSort: 0,
    },
    {
      localId: 'item-backlog',
      fieldName: 'Структура бэклога',
      sectionGuid: 'section-release',
      sectionSort: 1,
    },
  ],
}

const SECTION_FIELD_NAMES = ['guid', 'name', 'sort']
const ADDITIONAL_FIELD_NAMES = ['localId', 'fieldName', 'sectionGuid', 'sectionSort']
const SORTABLE_TRANSITION = {
  duration: 180,
  easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
}
const DROP_ANIMATION = {
  duration: 180,
  easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
}

function getOrderedAdditionalFieldsSections(additionalFieldsSections) {
  return [...additionalFieldsSections].sort((a, b) => a.sort - b.sort)
}

function groupAdditionalFieldsBySection(additionalFieldsSections, additionalFields) {
  const groups = new Map(additionalFieldsSections.map((section) => [section.guid, []]))

  for (const additionalField of additionalFields) {
    groups.get(additionalField.sectionGuid)?.push(additionalField)
  }

  for (const sectionFields of groups.values()) {
    sectionFields.sort((a, b) => a.sectionSort - b.sectionSort)
  }

  return groups
}

function flattenAdditionalFieldGroups(additionalFieldsSections, groups) {
  const additionalFields = []

  for (const section of additionalFieldsSections) {
    const sectionFields = groups.get(section.guid) ?? []
    sectionFields.forEach((additionalField, sectionSort) => {
      additionalFields.push({
        ...additionalField,
        sectionGuid: section.guid,
        sectionSort,
      })
    })
  }

  return additionalFields
}

function cloneTreeValues(values) {
  return {
    additionalFieldsSections: values.additionalFieldsSections.map((section) => ({
      ...section,
    })),
    additionalFields: values.additionalFields.map((additionalField) => ({
      ...additionalField,
    })),
  }
}

function findSectionGuid(id, additionalFieldsSections, additionalFields) {
  if (additionalFieldsSections.some((section) => section.guid === id)) return id
  return additionalFields.find((additionalField) => additionalField.localId === id)
    ?.sectionGuid
}

function reorderTreeValues(values, activeId, overId, activeType) {
  if (activeId === overId) return values

  if (activeType === 'additionalFieldSection') {
    const oldIndex = values.additionalFieldsSections.findIndex(
      (section) => section.guid === activeId,
    )
    const newIndex = values.additionalFieldsSections.findIndex(
      (section) => section.guid === overId,
    )
    if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return values

    return {
      ...values,
      additionalFieldsSections: arrayMove(
        values.additionalFieldsSections,
        oldIndex,
        newIndex,
      ).map((section, sort) => ({ ...section, sort })),
    }
  }

  const sourceGuid = findSectionGuid(
    activeId,
    values.additionalFieldsSections,
    values.additionalFields,
  )
  const destinationGuid = findSectionGuid(
    overId,
    values.additionalFieldsSections,
    values.additionalFields,
  )
  if (!sourceGuid || !destinationGuid) return values

  const groups = groupAdditionalFieldsBySection(
    values.additionalFieldsSections,
    values.additionalFields,
  )
  const sourceFields = groups.get(sourceGuid) ?? []
  const destinationFields = groups.get(destinationGuid) ?? []
  const oldIndex = sourceFields.findIndex(
    (additionalField) => additionalField.localId === activeId,
  )
  if (oldIndex < 0) return values

  if (sourceGuid === destinationGuid) {
    const newIndex = sourceFields.findIndex(
      (additionalField) => additionalField.localId === overId,
    )
    const targetIndex = newIndex >= 0 ? newIndex : sourceFields.length - 1
    if (oldIndex === targetIndex) return values
    groups.set(sourceGuid, arrayMove(sourceFields, oldIndex, targetIndex))
  } else {
    const [movingField] = sourceFields.splice(oldIndex, 1)
    const overIndex = destinationFields.findIndex(
      (additionalField) => additionalField.localId === overId,
    )
    destinationFields.splice(
      overIndex >= 0 ? overIndex : destinationFields.length,
      0,
      movingField,
    )
  }

  return {
    ...values,
    additionalFields: flattenAdditionalFieldGroups(
      values.additionalFieldsSections,
      groups,
    ),
  }
}

function haveSameTreeValues(left, right) {
  if (
    left.additionalFieldsSections.length !== right.additionalFieldsSections.length ||
    left.additionalFields.length !== right.additionalFields.length
  ) {
    return false
  }

  return (
    left.additionalFieldsSections.every((section, index) => {
      const rightSection = right.additionalFieldsSections[index]
      return (
        rightSection?.guid === section.guid &&
        rightSection.name === section.name &&
        rightSection.sort === section.sort
      )
    }) &&
    left.additionalFields.every((additionalField, index) => {
      const rightAdditionalField = right.additionalFields[index]
      return (
        rightAdditionalField?.localId === additionalField.localId &&
        rightAdditionalField.fieldName === additionalField.fieldName &&
        rightAdditionalField.sectionGuid === additionalField.sectionGuid &&
        rightAdditionalField.sectionSort === additionalField.sectionSort
      )
    })
  )
}

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches)

    handleChange()
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersReducedMotion
}

function HiddenListFields({ fields, names }) {
  return (
    <div className="form-list-hidden" aria-hidden="true">
      {fields.map((field) => (
        <div key={field.key}>
          {names.map((name) => (
            <Form.Item key={name} name={[field.name, name]} hidden>
              <Input />
            </Form.Item>
          ))}
        </div>
      ))}
    </div>
  )
}

function DragHandle({ label, handleProps }) {
  return (
    <button
      type="button"
      className="drag-handle"
      aria-label={label}
      {...handleProps}
    >
      <svg
        className="drag-handle-icon"
        viewBox="0 0 12 18"
        aria-hidden="true"
      >
        <circle cx="3" cy="3" r="1.5" />
        <circle cx="9" cy="3" r="1.5" />
        <circle cx="3" cy="9" r="1.5" />
        <circle cx="9" cy="9" r="1.5" />
        <circle cx="3" cy="15" r="1.5" />
        <circle cx="9" cy="15" r="1.5" />
      </svg>
    </button>
  )
}

function AdditionalFieldRowContent({ additionalField, preview = false, handleProps = {} }) {
  return (
    <div className={`item-row${preview ? ' is-preview' : ''}`}>
      {additionalField.fieldName}
      {!preview ? (
        <DragHandle
          label={`Переместить элемент «${additionalField.fieldName}»`}
          handleProps={handleProps}
        />
      ) : null}
    </div>
  )
}

function SortableAdditionalField({ additionalField, prefersReducedMotion }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: additionalField.localId,
    data: { type: 'additionalField' },
    transition: prefersReducedMotion ? null : SORTABLE_TRANSITION,
  })

  return (
    <div
      ref={setNodeRef}
      className={isDragging ? 'sortable-shell is-dragging' : 'sortable-shell'}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <AdditionalFieldRowContent
        additionalField={additionalField}
        handleProps={{ ref: setActivatorNodeRef, ...attributes, ...listeners }}
      />
    </div>
  )
}

function SectionContent({
  section,
  preview = false,
  sectionHandleProps = {},
  onAddField,
  prefersReducedMotion = false,
}) {
  return (
    <div className={`tree-section${preview ? ' is-preview' : ''}`}>
      <div className="section-row">
        {section.name}
        {!preview ? (
          <DragHandle
            label={`Переместить секцию «${section.name}»`}
            handleProps={sectionHandleProps}
          />
        ) : null}
      </div>

      <div className="children-list">
        {preview ? (
          section.additionalFields.map((additionalField) => (
            <AdditionalFieldRowContent
              key={additionalField.localId}
              additionalField={additionalField}
              preview
            />
          ))
        ) : (
          <SortableContext
            items={section.additionalFields.map((additionalField) => additionalField.localId)}
            strategy={rectSortingStrategy}
          >
            {section.additionalFields.map((additionalField) => (
              <SortableAdditionalField
                key={additionalField.localId}
                additionalField={additionalField}
                prefersReducedMotion={prefersReducedMotion}
              />
            ))}
          </SortableContext>
        )}
        {section.additionalFields.length === 0 ? (
          <div className="empty-row" aria-hidden="true" />
        ) : null}
        {!preview ? (
          <Button
            className="add-field-button"
            type="dashed"
            block
            onClick={() => onAddField(section.guid)}
          >
            Добавить поле
          </Button>
        ) : null}
      </div>
    </div>
  )
}

function SortableSection({ section, onAddField, prefersReducedMotion }) {
  const {
    active,
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({
    id: section.guid,
    data: { type: 'additionalFieldSection' },
    transition: prefersReducedMotion ? null : SORTABLE_TRANSITION,
  })

  const showDropIndicator = isOver && active?.data.current?.type === 'additionalFieldSection'

  return (
    <div
      ref={setNodeRef}
      className={`section-shell${isDragging ? ' is-dragging' : ''}${showDropIndicator ? ' show-drop-indicator' : ''}`}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <SectionContent
        section={section}
        onAddField={onAddField}
        prefersReducedMotion={prefersReducedMotion}
        sectionHandleProps={{ ref: setActivatorNodeRef, ...attributes, ...listeners }}
      />
    </div>
  )
}

function App() {
  const [form] = Form.useForm()
  const watchedAdditionalFieldsSections =
    Form.useWatch('additionalFieldsSections', form) ?? INITIAL_VALUES.additionalFieldsSections
  const watchedAdditionalFields =
    Form.useWatch('additionalFields', form) ?? INITIAL_VALUES.additionalFields
  const [activeId, setActiveId] = useState(null)
  const [activeType, setActiveType] = useState(null)
  const [dragValues, setDragValues] = useState(null)
  const dragValuesRef = useRef(null)
  const pendingFormValuesRef = useRef(null)
  const prefersReducedMotion = usePrefersReducedMotion()

  const formValues = useMemo(
    () => ({
      additionalFieldsSections: getOrderedAdditionalFieldsSections(
        watchedAdditionalFieldsSections,
      ),
      additionalFields: watchedAdditionalFields,
    }),
    [watchedAdditionalFields, watchedAdditionalFieldsSections],
  )
  const visualValues = dragValues ?? formValues

  const additionalFieldsSections = useMemo(
    () => getOrderedAdditionalFieldsSections(visualValues.additionalFieldsSections),
    [visualValues.additionalFieldsSections],
  )
  const additionalFieldsBySection = useMemo(
    () => groupAdditionalFieldsBySection(additionalFieldsSections, visualValues.additionalFields),
    [additionalFieldsSections, visualValues.additionalFields],
  )
  const treeSections = useMemo(
    () =>
      additionalFieldsSections.map((section) => ({
        ...section,
        additionalFields: additionalFieldsBySection.get(section.guid) ?? [],
      })),
    [additionalFieldsBySection, additionalFieldsSections],
  )

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const activeAdditionalFieldsSection = useMemo(
    () => treeSections.find((section) => section.guid === activeId),
    [activeId, treeSections],
  )
  const activeAdditionalField = useMemo(
    () =>
      activeType === 'additionalField'
        ? visualValues.additionalFields.find(
            (additionalField) => additionalField.localId === activeId,
          )
        : null,
    [activeId, activeType, visualValues.additionalFields],
  )

  useEffect(() => {
    const pendingFormValues = pendingFormValuesRef.current
    if (
      activeId !== null ||
      !pendingFormValues ||
      !haveSameTreeValues(formValues, pendingFormValues)
    ) {
      return
    }

    pendingFormValuesRef.current = null
    dragValuesRef.current = null
    setDragValues(null)
  }, [activeId, formValues])

  const collisionDetection = useCallback((args) => {
    if (args.active.data.current?.type === 'additionalFieldSection') {
      const sectionContainers = args.droppableContainers.filter(
        (container) => container.data.current?.type === 'additionalFieldSection',
      )
      return closestCenter({ ...args, droppableContainers: sectionContainers })
    }

    const collisions = pointerWithin(args)
    const additionalFieldCollisions = collisions.filter(
      (collision) =>
        collision.data?.droppableContainer?.data.current?.type === 'additionalField',
    )
    if (additionalFieldCollisions.length > 0) return additionalFieldCollisions
    if (collisions.length > 0) return collisions
    return closestCenter(args)
  }, [])

  const getCurrentValues = () => {
    const values = form.getFieldsValue(['additionalFieldsSections', 'additionalFields'])
    return {
      additionalFieldsSections: getOrderedAdditionalFieldsSections(
        values.additionalFieldsSections ?? [],
      ),
      additionalFields: values.additionalFields ?? [],
    }
  }

  const handleDragStart = ({ active }) => {
    const current = cloneTreeValues(getCurrentValues())
    dragValuesRef.current = current
    pendingFormValuesRef.current = null
    setDragValues(current)
    setActiveId(active.id)
    setActiveType(active.data.current?.type ?? null)
  }

  const handleDragOver = ({ active, over }) => {
    if (!over || !dragValuesRef.current) return

    const nextValues = reorderTreeValues(
      dragValuesRef.current,
      active.id,
      over.id,
      active.data.current?.type,
    )
    if (nextValues === dragValuesRef.current) return

    dragValuesRef.current = nextValues
    setDragValues(nextValues)
  }

  const resetActive = () => {
    setActiveId(null)
    setActiveType(null)
  }

  const handleDragEnd = ({ over }) => {
    const finalValues = dragValuesRef.current
    if (!over || !finalValues) {
      handleDragCancel()
      return
    }

    pendingFormValuesRef.current = finalValues
    form.setFieldsValue(finalValues)
    resetActive()
  }

  const handleDragCancel = () => {
    pendingFormValuesRef.current = null
    dragValuesRef.current = null
    setDragValues(null)
    resetActive()
  }

  const handleAddSection = () => {
    const currentSections = form.getFieldValue('additionalFieldsSections') ?? []
    form.setFieldValue('additionalFieldsSections', [
      ...currentSections,
      {
        guid: `section-${crypto.randomUUID()}`,
        name: 'Новый раздел',
        sort: currentSections.length,
      },
    ])
  }

  const handleAddField = (sectionGuid) => {
    const currentAdditionalFields = form.getFieldValue('additionalFields') ?? []
    const nextSectionSort = currentAdditionalFields.reduce((highestSort, additionalField) => {
      if (additionalField.sectionGuid !== sectionGuid) return highestSort
      return Math.max(highestSort, Number(additionalField.sectionSort))
    }, -1) + 1

    form.setFieldValue('additionalFields', [
      ...currentAdditionalFields,
      {
        localId: `field-${crypto.randomUUID()}`,
        fieldName: 'Новое поле',
        sectionGuid,
        sectionSort: nextSectionSort,
      },
    ])
  }

  return (
    <main className="page-shell">
      <Form form={form} initialValues={INITIAL_VALUES} className="tree-form">
        <Form.List name="additionalFields">
          {(additionalFieldEntries) => (
            <HiddenListFields
              fields={additionalFieldEntries}
              names={ADDITIONAL_FIELD_NAMES}
            />
          )}
        </Form.List>

        <Form.List name="additionalFieldsSections">
          {(sectionFields) => (
            <HiddenListFields fields={sectionFields} names={SECTION_FIELD_NAMES} />
          )}
        </Form.List>

        <DndContext
          sensors={sensors}
          collisionDetection={collisionDetection}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext
            items={treeSections.map((section) => section.guid)}
            strategy={verticalListSortingStrategy}
          >
            <div className="tree" aria-label="Сортируемое дерево проекта">
              {treeSections.map((section) => (
                <SortableSection
                  key={section.guid}
                  section={section}
                  onAddField={handleAddField}
                  prefersReducedMotion={prefersReducedMotion}
                />
              ))}
            </div>
          </SortableContext>

          <DragOverlay dropAnimation={prefersReducedMotion ? null : DROP_ANIMATION}>
            {activeType === 'additionalFieldSection' && activeAdditionalFieldsSection ? (
              <div className="section-overlay">
                <SectionContent section={activeAdditionalFieldsSection} preview />
              </div>
            ) : null}
            {activeType === 'additionalField' && activeAdditionalField ? (
              <div className="item-overlay">
                <AdditionalFieldRowContent
                  additionalField={activeAdditionalField}
                  preview
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        <Button
          className="add-section-button"
          type="dashed"
          block
          onClick={handleAddSection}
        >
          Добавить раздел
        </Button>
      </Form>
    </main>
  )
}

export default App
