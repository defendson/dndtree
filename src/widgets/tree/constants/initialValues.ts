import type { TreeFormValues } from '../types'
import { BusinessProcessFormFields } from './businessProcessFormFields'

export const INITIAL_VALUES: TreeFormValues = {
  [BusinessProcessFormFields.additionalFieldsSections]: [
    { guid: 'section-research', name: 'Исследование', sort: 0 },
    { guid: 'section-design', name: 'Проектирование', sort: 1 },
    { guid: 'section-build', name: 'Разработка', sort: 2 },
    { guid: 'section-release', name: 'Выпуск', sort: 3 },
  ],
  [BusinessProcessFormFields.additionalFields]: [
    {
      localId: 'item-interviews',
      fieldName: 'Интервью с командой',
      sectionGuid: 'section-research',
      sectionSort: 0,
    },
    {
      localId: 'item-feedback',
      fieldName: 'Собрать обратную связь',
      sectionGuid: 'section-research',
      sectionSort: 1,
    },
    {
      localId: 'item-journey',
      fieldName: 'Обновить карту пути',
      sectionGuid: 'section-design',
      sectionSort: 0,
    },
    {
      localId: 'item-prototype',
      fieldName: 'Подготовить прототип',
      sectionGuid: 'section-design',
      sectionSort: 1,
    },
    {
      localId: 'item-api',
      fieldName: 'Сверить API-контракт',
      sectionGuid: 'section-build',
      sectionSort: 0,
    },
    {
      localId: 'item-layout',
      fieldName: 'Собрать адаптивную сетку',
      sectionGuid: 'section-build',
      sectionSort: 1,
    },
    {
      localId: 'item-onboarding',
      fieldName: 'Сценарий первого запуска',
      sectionGuid: 'section-release',
      sectionSort: 0,
    },
    {
      localId: 'item-backlog',
      fieldName: 'Структура бэклога',
      sectionGuid: 'section-release',
      sectionSort: 1,
    },
  ],
}
