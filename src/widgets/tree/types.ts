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
  additionalFieldsSections: AdditionalFieldsSection[]
  additionalFields: AdditionalFieldValue[]
}

export interface AdditionalFieldsTreeSection extends AdditionalFieldsSection {
  additionalFields: AdditionalFieldValue[]
}

export type ActiveType = 'additionalFieldSection' | 'additionalField'
