import { ADDITIONAL_FIELD_SECTION_TYPE } from '../constants/additionalFieldSectionType'
import { ADDITIONAL_FIELD_TYPE } from '../constants/additionalFieldType'
import type { ActiveType } from '../types'

export function getActiveType(value: unknown): ActiveType | undefined {
  return value === ADDITIONAL_FIELD_SECTION_TYPE || value === ADDITIONAL_FIELD_TYPE
    ? value
    : undefined
}
