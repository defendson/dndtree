import { Global } from '@emotion/react'
import { DndContext, DragOverlay } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Form } from 'antd'
import 'antd/dist/reset.css'
import { createPortal } from 'react-dom'
import { ADDITIONAL_FIELD_NAMES } from '../../constants/additionalFieldNames'
import { ADDITIONAL_FIELD_SECTION_TYPE } from '../../constants/additionalFieldSectionType'
import { ADDITIONAL_FIELD_TYPE } from '../../constants/additionalFieldType'
import { DROP_ANIMATION } from '../../constants/dropAnimation'
import { INITIAL_VALUES } from '../../constants/initialValues'
import { SECTION_FIELD_NAMES } from '../../constants/sectionFieldNames'
import { useSortableTree } from '../../hooks/useSortableTree'
import type { TreeFormValues } from '../../types'
import { AdditionalFieldPreview } from '../AdditionalField/AdditionalField'
import {
  AdditionalFieldSection,
  AdditionalFieldSectionPreview,
} from '../AdditionalFieldSection/AdditionalFieldSection'
import { HiddenListFields } from '../HiddenListFields/HiddenListFields'
import {
  AddSectionButton,
  AdditionalFieldOverlay,
  AdditionalFieldSectionOverlay,
  treeGlobalStyles,
  TreePage,
  TreeRoot,
} from './Tree.styled'

export function Tree() {
  const [form] = Form.useForm<TreeFormValues>()
  const {
    activeAdditionalField,
    activeAdditionalFieldsSection,
    activeType,
    collisionDetection,
    handleAddField,
    handleAddSection,
    handleDragCancel,
    handleDragEnd,
    handleDragOver,
    handleDragStart,
    prefersReducedMotion,
    sensors,
    treeSections,
  } = useSortableTree(form)

  return (
    <>
      <Global styles={treeGlobalStyles} />
      <TreePage>
        <Form form={form} initialValues={INITIAL_VALUES}>
          <Form.List name="additionalFields">
            {(additionalFieldEntries) => (
              <HiddenListFields
                fields={additionalFieldEntries}
                names={ADDITIONAL_FIELD_NAMES}
              />
            )}
          </Form.List>

          <Form.List name="additionalFieldsSections">
            {(sectionFields) => (
              <HiddenListFields fields={sectionFields} names={SECTION_FIELD_NAMES} />
            )}
          </Form.List>

          <DndContext
            sensors={sensors}
            collisionDetection={collisionDetection}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <SortableContext
              items={treeSections.map((section) => section.guid)}
              strategy={verticalListSortingStrategy}
            >
              <TreeRoot aria-label="Сортируемое дерево проекта">
                {treeSections.map((section) => (
                  <AdditionalFieldSection
                    key={section.guid}
                    section={section}
                    onAddField={handleAddField}
                    prefersReducedMotion={prefersReducedMotion}
                  />
                ))}
              </TreeRoot>
            </SortableContext>

            {createPortal(
              <DragOverlay dropAnimation={prefersReducedMotion ? null : DROP_ANIMATION}>
                {activeType === ADDITIONAL_FIELD_SECTION_TYPE &&
                activeAdditionalFieldsSection ? (
                  <AdditionalFieldSectionOverlay>
                    <AdditionalFieldSectionPreview
                      section={activeAdditionalFieldsSection}
                    />
                  </AdditionalFieldSectionOverlay>
                ) : null}
                {activeType === ADDITIONAL_FIELD_TYPE && activeAdditionalField ? (
                  <AdditionalFieldOverlay>
                    <AdditionalFieldPreview additionalField={activeAdditionalField} />
                  </AdditionalFieldOverlay>
                ) : null}
              </DragOverlay>,
              document.body,
            )}
          </DndContext>

          <AddSectionButton
            type="dashed"
            block
            onClick={handleAddSection}
          >
            Добавить раздел
          </AddSectionButton>
        </Form>
      </TreePage>
    </>
  )
}
