import type { UniqueIdentifier } from '@dnd-kit/core'
import type { AdditionalFieldsSection, AdditionalFieldValue } from '../types'

export function findSectionGuid(
  id: UniqueIdentifier,
  additionalFieldsSections: AdditionalFieldsSection[],
  additionalFields: AdditionalFieldValue[],
): string | undefined {
  if (typeof id !== 'string') return undefined
  if (additionalFieldsSections.some((section) => section.guid === id)) return id

  return additionalFields.find((additionalField) => additionalField.localId === id)
    ?.sectionGuid
}
