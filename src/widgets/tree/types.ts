import { BusinessProcessFormFields } from './constants/businessProcessFormFields'

export interface AdditionalFieldsSection {
  guid: string
  name: string
  sort: number
}

export interface AdditionalFieldValue {
  localId: string
  fieldName: string
  sectionGuid: string
  sectionSort: number
}

export interface TreeFormValues {
  [BusinessProcessFormFields.additionalFieldsSections]: AdditionalFieldsSection[]
  [BusinessProcessFormFields.additionalFields]: AdditionalFieldValue[]
}

export interface AdditionalFieldsTreeSection extends AdditionalFieldsSection {
  additionalFields: AdditionalFieldValue[]
}

export type ActiveType = 'additionalFieldSection' | 'additionalField'
