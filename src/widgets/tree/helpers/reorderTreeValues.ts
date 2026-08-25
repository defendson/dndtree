import type { UniqueIdentifier } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import {
  ADDITIONAL_FIELD_SECTION_TYPE,
  BusinessProcessFormFields,
} from '../constants'
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

  const additionalFieldsSections =
    values[BusinessProcessFormFields.additionalFieldsSections]
  const additionalFields = values[BusinessProcessFormFields.additionalFields]

  if (activeType === ADDITIONAL_FIELD_SECTION_TYPE) {
    const oldIndex = additionalFieldsSections.findIndex(
      (section) => section.guid === activeId,
    )
    const newIndex = additionalFieldsSections.findIndex(
      (section) => section.guid === overId,
    )
    if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return values

    return {
      ...values,
      [BusinessProcessFormFields.additionalFieldsSections]: arrayMove(
        additionalFieldsSections,
        oldIndex,
        newIndex,
      ).map((section, sort) => ({ ...section, sort })),
    }
  }

  const sourceGuid = findSectionGuid(
    activeId,
    additionalFieldsSections,
    additionalFields,
  )
  const destinationGuid = findSectionGuid(
    overId,
    additionalFieldsSections,
    additionalFields,
  )
  if (!sourceGuid || !destinationGuid) return values

  const groups = groupAdditionalFieldsBySection(
    additionalFieldsSections,
    additionalFields,
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
    [BusinessProcessFormFields.additionalFields]: flattenAdditionalFieldGroups(
      additionalFieldsSections,
      groups,
    ),
  }
}
