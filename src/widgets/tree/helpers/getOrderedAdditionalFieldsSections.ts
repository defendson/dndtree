import type { AdditionalFieldsSection } from '../types'

export function getOrderedAdditionalFieldsSections(
  additionalFieldsSections: AdditionalFieldsSection[],
) {
  return [...additionalFieldsSections].sort((left, right) => left.sort - right.sort)
}
