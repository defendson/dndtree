import type { AdditionalFieldsSection, AdditionalFieldValue } from '../types'

export function groupAdditionalFieldsBySection(
  additionalFieldsSections: AdditionalFieldsSection[],
  additionalFields: AdditionalFieldValue[],
) {
  const groups = new Map<string, AdditionalFieldValue[]>(
    additionalFieldsSections.map((section) => [section.guid, []]),
  )

  for (const additionalField of additionalFields) {
    groups.get(additionalField.sectionGuid)?.push(additionalField)
  }

  for (const sectionFields of groups.values()) {
    sectionFields.sort((left, right) => left.sectionSort - right.sectionSort)
  }

  return groups
}
