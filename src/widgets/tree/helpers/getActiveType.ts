import {
  ADDITIONAL_FIELD_SECTION_TYPE,
  ADDITIONAL_FIELD_TYPE,
} from '../constants'
import type { ActiveType } from '../types'

export function getActiveType(value: unknown): ActiveType | undefined {
  return value === ADDITIONAL_FIELD_SECTION_TYPE || value === ADDITIONAL_FIELD_TYPE
    ? value
    : undefined
}
