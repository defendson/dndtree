import type { TreeFormValues } from '../types'

export function haveSameTreeValues(left: TreeFormValues, right: TreeFormValues) {
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
