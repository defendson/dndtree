import type { TreeFormValues } from '../types'

export function cloneTreeValues(values: TreeFormValues): TreeFormValues {
  return {
    additionalFieldsSections: values.additionalFieldsSections.map((section) => ({
      ...section,
    })),
    additionalFields: values.additionalFields.map((additionalField) => ({
      ...additionalField,
    })),
  }
}
