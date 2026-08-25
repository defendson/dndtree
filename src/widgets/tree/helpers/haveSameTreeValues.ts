import { BusinessProcessFormFields } from '../constants'
import type { TreeFormValues } from '../types'

export function haveSameTreeValues(left: TreeFormValues, right: TreeFormValues) {
  const leftSections = left[BusinessProcessFormFields.additionalFieldsSections]
  const rightSections = right[BusinessProcessFormFields.additionalFieldsSections]
  const leftFields = left[BusinessProcessFormFields.additionalFields]
  const rightFields = right[BusinessProcessFormFields.additionalFields]

  if (
    leftSections.length !== rightSections.length ||
    leftFields.length !== rightFields.length
  ) {
    return false
  }

  return (
    leftSections.every((section, index) => {
      const rightSection = rightSections[index]
      return (
        rightSection?.guid === section.guid &&
        rightSection.name === section.name &&
        rightSection.sort === section.sort
      )
    }) &&
    leftFields.every((additionalField, index) => {
      const rightAdditionalField = rightFields[index]
      return (
        rightAdditionalField?.localId === additionalField.localId &&
        rightAdditionalField.fieldName === additionalField.fieldName &&
        rightAdditionalField.sectionGuid === additionalField.sectionGuid &&
        rightAdditionalField.sectionSort === additionalField.sectionSort
      )
    })
  )
}
