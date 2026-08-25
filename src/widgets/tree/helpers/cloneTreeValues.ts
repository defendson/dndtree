import { BusinessProcessFormFields } from '../constants'
import type { TreeFormValues } from '../types'

export function cloneTreeValues(values: TreeFormValues): TreeFormValues {
  return {
    [BusinessProcessFormFields.additionalFieldsSections]: values[
      BusinessProcessFormFields.additionalFieldsSections
    ].map((section) => ({ ...section })),
    [BusinessProcessFormFields.additionalFields]: values[
      BusinessProcessFormFields.additionalFields
    ].map((additionalField) => ({ ...additionalField })),
  }
}
