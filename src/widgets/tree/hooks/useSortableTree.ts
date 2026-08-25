import {
  closestCenter,
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
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { Form } from 'antd'
import type { FormInstance } from 'antd'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ADDITIONAL_FIELD_SECTION_TYPE,
  ADDITIONAL_FIELD_TYPE,
  INITIAL_VALUES,
} from '../constants'
import {
  cloneTreeValues,
  getActiveType,
  getOrderedAdditionalFieldsSections,
  groupAdditionalFieldsBySection,
  haveSameTreeValues,
  reorderTreeValues,
} from '../helpers'
import type {
  ActiveType,
  AdditionalFieldsSection,
  AdditionalFieldValue,
  AdditionalFieldsTreeSection,
  TreeFormValues,
} from '../types'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

export function useSortableTree(form: FormInstance<TreeFormValues>) {
  const watchedAdditionalFieldsSections =
    Form.useWatch<AdditionalFieldsSection[]>('additionalFieldsSections', form) ??
    INITIAL_VALUES.additionalFieldsSections
  const watchedAdditionalFields =
    Form.useWatch<AdditionalFieldValue[]>('additionalFields', form) ??
    INITIAL_VALUES.additionalFields
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
  const [activeType, setActiveType] = useState<ActiveType | null>(null)
  const [dragValues, setDragValues] = useState<TreeFormValues | null>(null)
  const dragValuesRef = useRef<TreeFormValues | null>(null)
  const pendingFormValuesRef = useRef<TreeFormValues | null>(null)
  const prefersReducedMotion = usePrefersReducedMotion()

  const formValues = useMemo<TreeFormValues>(
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
  const treeSections = useMemo<AdditionalFieldsTreeSection[]>(
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
      activeType === ADDITIONAL_FIELD_TYPE
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
    if (args.active.data.current?.type === ADDITIONAL_FIELD_SECTION_TYPE) {
      const sectionContainers = args.droppableContainers.filter(
        (container) => container.data.current?.type === ADDITIONAL_FIELD_SECTION_TYPE,
      )
      const sectionArgs = { ...args, droppableContainers: sectionContainers }

      return args.pointerCoordinates
        ? pointerWithin(sectionArgs)
        : closestCenter(sectionArgs)
    }

    const collisions = pointerWithin(args)
    const additionalFieldCollisions = collisions.filter(
      (collision) =>
        collision.data?.droppableContainer?.data.current?.type === ADDITIONAL_FIELD_TYPE,
    )
    if (additionalFieldCollisions.length > 0) return additionalFieldCollisions
    if (collisions.length > 0) return collisions
    return args.pointerCoordinates ? [] : closestCenter(args)
  }, [])

  const getCurrentValues = (): TreeFormValues => {
    const values = form.getFieldsValue([
      'additionalFieldsSections',
      'additionalFields',
    ]) as Partial<TreeFormValues>
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

  const handleDragCancel = () => {
    pendingFormValuesRef.current = null
    dragValuesRef.current = null
    setDragValues(null)
    resetActive()
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
    const currentAdditionalFields: AdditionalFieldValue[] =
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

  return {
    activeAdditionalField,
    activeAdditionalFieldsSection,
    activeType,
    collisionDetection,
    handleAddField,
    handleAddSection,
    handleDragCancel,
    handleDragEnd,
    handleDragOver,
    handleDragStart,
    prefersReducedMotion,
    sensors,
    treeSections,
  }
}
