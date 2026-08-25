import type { AdditionalFieldsSection, AdditionalFieldValue } from '../types'

export function flattenAdditionalFieldGroups(
  additionalFieldsSections: AdditionalFieldsSection[],
  groups: Map<string, AdditionalFieldValue[]>,
) {
  const additionalFields: AdditionalFieldValue[] = []

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
