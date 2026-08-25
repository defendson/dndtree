import type { UniqueIdentifier } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { ADDITIONAL_FIELD_SECTION_TYPE } from '../constants'
import type { ActiveType, TreeFormValues } from '../types'
import { findSectionGuid } from './findSectionGuid'
import { flattenAdditionalFieldGroups } from './flattenAdditionalFieldGroups'
import { groupAdditionalFieldsBySection } from './groupAdditionalFieldsBySection'

export function reorderTreeValues(
  values: TreeFormValues,
  activeId: UniqueIdentifier,
  overId: UniqueIdentifier,
  activeType: ActiveType | undefined,
): TreeFormValues {
  if (activeId === overId) return values

  if (activeType === ADDITIONAL_FIELD_SECTION_TYPE) {
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
