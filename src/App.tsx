import { Global } from '@emotion/react'
import type { ButtonHTMLAttributes, Ref } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Form, Input } from 'antd'
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
import type {
  CollisionDetection,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  UniqueIdentifier,
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
import {
  AddFieldButton,
  AddSectionButton,
  appGlobalStyles,
  ChildrenList,
  DragHandleButton,
  DragHandleIcon,
  EmptyRow,
  HiddenListFieldsRoot,
  ItemOverlay,
  ItemRow,
  PageShell,
  SectionOverlay,
  SectionRow,
  SectionShell,
  SortableShell,
  Tree,
  TreeSection,
} from './App.styled'

interface AdditionalFieldsSection {
  guid: string
  name: string
  sort: number
}

interface AdditionalField {
  localId: string
  fieldName: string
  sectionGuid: string
  sectionSort: number
}

interface FormValues {
  additionalFieldsSections: AdditionalFieldsSection[]
  additionalFields: AdditionalField[]
}

interface TreeSectionValue extends AdditionalFieldsSection {
  additionalFields: AdditionalField[]
}

type ActiveType = 'additionalFieldSection' | 'additionalField'
type DragHandleProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  ref?: Ref<HTMLButtonElement>
}

interface HiddenListField {
  key: number
  name: number
}

function getActiveType(value: unknown): ActiveType | undefined {
  return value === 'additionalFieldSection' || value === 'additionalField'
    ? value
    : undefined
}

const INITIAL_VALUES: FormValues = {
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

const SECTION_FIELD_NAMES = ['guid', 'name', 'sort'] as const
const ADDITIONAL_FIELD_NAMES = [
  'localId',
  'fieldName',
  'sectionGuid',
  'sectionSort',
] as const
const SORTABLE_TRANSITION = {
  duration: 180,
  easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
}
const DROP_ANIMATION = {
  duration: 180,
  easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
}

function getOrderedAdditionalFieldsSections(
  additionalFieldsSections: AdditionalFieldsSection[],
) {
  return [...additionalFieldsSections].sort((a, b) => a.sort - b.sort)
}

function groupAdditionalFieldsBySection(
  additionalFieldsSections: AdditionalFieldsSection[],
  additionalFields: AdditionalField[],
) {
  const groups = new Map<string, AdditionalField[]>(
    additionalFieldsSections.map((section) => [section.guid, []]),
  )

  for (const additionalField of additionalFields) {
    groups.get(additionalField.sectionGuid)?.push(additionalField)
  }

  for (const sectionFields of groups.values()) {
    sectionFields.sort((a, b) => a.sectionSort - b.sectionSort)
  }

  return groups
}

function flattenAdditionalFieldGroups(
  additionalFieldsSections: AdditionalFieldsSection[],
  groups: Map<string, AdditionalField[]>,
) {
  const additionalFields: AdditionalField[] = []

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

function cloneTreeValues(values: FormValues): FormValues {
  return {
    additionalFieldsSections: values.additionalFieldsSections.map((section) => ({
      ...section,
    })),
    additionalFields: values.additionalFields.map((additionalField) => ({
      ...additionalField,
    })),
  }
}

function findSectionGuid(
  id: UniqueIdentifier,
  additionalFieldsSections: AdditionalFieldsSection[],
  additionalFields: AdditionalField[],
): string | undefined {
  if (typeof id !== 'string') return undefined
  if (additionalFieldsSections.some((section) => section.guid === id)) return id
  return additionalFields.find((additionalField) => additionalField.localId === id)
    ?.sectionGuid
}

function reorderTreeValues(
  values: FormValues,
  activeId: UniqueIdentifier,
  overId: UniqueIdentifier,
  activeType: ActiveType | undefined,
): FormValues {
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
    if (!movingField) return values
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

function haveSameTreeValues(left: FormValues, right: FormValues) {
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

interface HiddenListFieldsProps {
  fields: HiddenListField[]
  names: readonly string[]
}

function HiddenListFields({ fields, names }: HiddenListFieldsProps) {
  return (
    <HiddenListFieldsRoot aria-hidden="true">
      {fields.map((field) => (
        <div key={field.key}>
          {names.map((name) => (
            <Form.Item key={name} name={[field.name, name]} hidden>
              <Input />
            </Form.Item>
          ))}
        </div>
      ))}
    </HiddenListFieldsRoot>
  )
}

interface DragHandleComponentProps {
  label: string
  handleProps: DragHandleProps
}

function DragHandle({ label, handleProps }: DragHandleComponentProps) {
  return (
    <DragHandleButton
      type="button"
      aria-label={label}
      {...handleProps}
    >
      <DragHandleIcon viewBox="0 0 12 18" aria-hidden="true">
        <circle cx="3" cy="3" r="1.5" />
        <circle cx="9" cy="3" r="1.5" />
        <circle cx="3" cy="9" r="1.5" />
        <circle cx="9" cy="9" r="1.5" />
        <circle cx="3" cy="15" r="1.5" />
        <circle cx="9" cy="15" r="1.5" />
      </DragHandleIcon>
    </DragHandleButton>
  )
}

interface AdditionalFieldRowContentProps {
  additionalField: AdditionalField
  preview?: boolean
  handleProps?: DragHandleProps
}

function AdditionalFieldRowContent({
  additionalField,
  preview = false,
  handleProps = {},
}: AdditionalFieldRowContentProps) {
  return (
    <ItemRow $hasHandle={!preview}>
      {additionalField.fieldName}
      {!preview ? (
        <DragHandle
          label={`Переместить элемент «${additionalField.fieldName}»`}
          handleProps={handleProps}
        />
      ) : null}
    </ItemRow>
  )
}

interface SortableAdditionalFieldProps {
  additionalField: AdditionalField
  prefersReducedMotion: boolean
}

function SortableAdditionalField({
  additionalField,
  prefersReducedMotion,
}: SortableAdditionalFieldProps) {
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
    <SortableShell
      ref={setNodeRef}
      $isDragging={isDragging}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <AdditionalFieldRowContent
        additionalField={additionalField}
        handleProps={{ ref: setActivatorNodeRef, ...attributes, ...listeners }}
      />
    </SortableShell>
  )
}

interface SectionContentProps {
  section: TreeSectionValue
  preview?: boolean
  sectionHandleProps?: DragHandleProps
  onAddField?: (sectionGuid: string) => void
  prefersReducedMotion?: boolean
}

function SectionContent({
  section,
  preview = false,
  sectionHandleProps = {},
  onAddField,
  prefersReducedMotion = false,
}: SectionContentProps) {
  return (
    <TreeSection>
      <SectionRow $hasHandle={!preview}>
        {section.name}
        {!preview ? (
          <DragHandle
            label={`Переместить секцию «${section.name}»`}
            handleProps={sectionHandleProps}
          />
        ) : null}
      </SectionRow>

      <ChildrenList>
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
          <EmptyRow aria-hidden="true" />
        ) : null}
        {!preview ? (
          <AddFieldButton
            type="dashed"
            block
            onClick={() => onAddField?.(section.guid)}
          >
            Добавить поле
          </AddFieldButton>
        ) : null}
      </ChildrenList>
    </TreeSection>
  )
}

interface SortableSectionProps {
  section: TreeSectionValue
  onAddField: (sectionGuid: string) => void
  prefersReducedMotion: boolean
}

function SortableSection({
  section,
  onAddField,
  prefersReducedMotion,
}: SortableSectionProps) {
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
    <SectionShell
      ref={setNodeRef}
      $isDragging={isDragging}
      $showDropIndicator={showDropIndicator}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <SectionContent
        section={section}
        onAddField={onAddField}
        prefersReducedMotion={prefersReducedMotion}
        sectionHandleProps={{ ref: setActivatorNodeRef, ...attributes, ...listeners }}
      />
    </SectionShell>
  )
}

function App() {
  const [form] = Form.useForm<FormValues>()
  const watchedAdditionalFieldsSections =
    Form.useWatch<AdditionalFieldsSection[]>('additionalFieldsSections', form) ??
    INITIAL_VALUES.additionalFieldsSections
  const watchedAdditionalFields =
    Form.useWatch<AdditionalField[]>('additionalFields', form) ??
    INITIAL_VALUES.additionalFields
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
  const [activeType, setActiveType] = useState<ActiveType | null>(null)
  const [dragValues, setDragValues] = useState<FormValues | null>(null)
  const dragValuesRef = useRef<FormValues | null>(null)
  const pendingFormValuesRef = useRef<FormValues | null>(null)
  const prefersReducedMotion = usePrefersReducedMotion()

  const formValues = useMemo<FormValues>(
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
  const treeSections = useMemo<TreeSectionValue[]>(
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

  const collisionDetection = useCallback<CollisionDetection>((args) => {
    if (args.active.data.current?.type === 'additionalFieldSection') {
      const sectionContainers = args.droppableContainers.filter(
        (container) => container.data.current?.type === 'additionalFieldSection',
      )
      const sectionArgs = { ...args, droppableContainers: sectionContainers }

      return args.pointerCoordinates
        ? pointerWithin(sectionArgs)
        : closestCenter(sectionArgs)
    }

    const collisions = pointerWithin(args)
    const additionalFieldCollisions = collisions.filter(
      (collision) =>
        collision.data?.droppableContainer?.data.current?.type === 'additionalField',
    )
    if (additionalFieldCollisions.length > 0) return additionalFieldCollisions
    if (collisions.length > 0) return collisions
    return args.pointerCoordinates ? [] : closestCenter(args)
  }, [])

  const getCurrentValues = (): FormValues => {
    const values = form.getFieldsValue([
      'additionalFieldsSections',
      'additionalFields',
    ]) as Partial<FormValues>
    return {
      additionalFieldsSections: getOrderedAdditionalFieldsSections(
        values.additionalFieldsSections ?? [],
      ),
      additionalFields: values.additionalFields ?? [],
    }
  }

  const handleDragStart = ({ active }: DragStartEvent) => {
    const current = cloneTreeValues(getCurrentValues())
    dragValuesRef.current = current
    pendingFormValuesRef.current = null
    setDragValues(current)
    setActiveId(active.id)
    setActiveType(getActiveType(active.data.current?.type) ?? null)
  }

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    if (!over || !dragValuesRef.current) return

    const nextValues = reorderTreeValues(
      dragValuesRef.current,
      active.id,
      over.id,
      getActiveType(active.data.current?.type),
    )
    if (nextValues === dragValuesRef.current) return

    dragValuesRef.current = nextValues
    setDragValues(nextValues)
  }

  const resetActive = () => {
    setActiveId(null)
    setActiveType(null)
  }

  const handleDragEnd = ({ over }: DragEndEvent) => {
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
    const currentSections: AdditionalFieldsSection[] =
      form.getFieldValue('additionalFieldsSections') ?? []
    form.setFieldValue('additionalFieldsSections', [
      ...currentSections,
      {
        guid: `section-${crypto.randomUUID()}`,
        name: 'Новый раздел',
        sort: currentSections.length,
      },
    ])
  }

  const handleAddField = (sectionGuid: string) => {
    const currentAdditionalFields: AdditionalField[] =
      form.getFieldValue('additionalFields') ?? []
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
    <>
      <Global styles={appGlobalStyles} />
      <PageShell>
        <Form form={form} initialValues={INITIAL_VALUES}>
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
              <Tree aria-label="Сортируемое дерево проекта">
                {treeSections.map((section) => (
                  <SortableSection
                    key={section.guid}
                    section={section}
                    onAddField={handleAddField}
                    prefersReducedMotion={prefersReducedMotion}
                  />
                ))}
              </Tree>
            </SortableContext>

            {createPortal(
              <DragOverlay dropAnimation={prefersReducedMotion ? null : DROP_ANIMATION}>
                {activeType === 'additionalFieldSection' && activeAdditionalFieldsSection ? (
                  <SectionOverlay>
                    <SectionContent section={activeAdditionalFieldsSection} preview />
                  </SectionOverlay>
                ) : null}
                {activeType === 'additionalField' && activeAdditionalField ? (
                  <ItemOverlay>
                    <AdditionalFieldRowContent
                      additionalField={activeAdditionalField}
                      preview
                    />
                  </ItemOverlay>
                ) : null}
              </DragOverlay>,
              document.body,
            )}
          </DndContext>

          <AddSectionButton
            type="dashed"
            block
            onClick={handleAddSection}
          >
            Добавить раздел
          </AddSectionButton>
        </Form>
      </PageShell>
    </>
  )
}

export default App
