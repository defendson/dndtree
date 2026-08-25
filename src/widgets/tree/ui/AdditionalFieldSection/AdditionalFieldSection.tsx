import { rectSortingStrategy, SortableContext, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  ADDITIONAL_FIELD_SECTION_TYPE,
  SORTABLE_TRANSITION,
} from '../../constants'
import type { AdditionalFieldsTreeSection } from '../../types'
import { AdditionalField, AdditionalFieldPreview } from '../AdditionalField/AdditionalField'
import { DragHandle } from '../DragHandle/DragHandle'
import type { DragHandleProps } from '../DragHandle/DragHandle'
import {
  AddFieldButton,
  AdditionalFieldsList,
  AdditionalFieldSectionHeader,
  AdditionalFieldSectionRoot,
  AdditionalFieldSectionShell,
  EmptyAdditionalFields,
} from './AdditionalFieldSection.styled'

interface AdditionalFieldSectionContentProps {
  section: AdditionalFieldsTreeSection
  preview?: boolean
  sectionHandleProps?: DragHandleProps
  onAddField?: (sectionGuid: string) => void
  prefersReducedMotion?: boolean
}

function AdditionalFieldSectionContent({
  section,
  preview = false,
  sectionHandleProps = {},
  onAddField,
  prefersReducedMotion = false,
}: AdditionalFieldSectionContentProps) {
  return (
    <AdditionalFieldSectionRoot>
      <AdditionalFieldSectionHeader $hasHandle={!preview}>
        {section.name}
        {!preview ? (
          <DragHandle
            label={`Переместить секцию «${section.name}»`}
            handleProps={sectionHandleProps}
          />
        ) : null}
      </AdditionalFieldSectionHeader>

      <AdditionalFieldsList>
        {preview ? (
          section.additionalFields.map((additionalField) => (
            <AdditionalFieldPreview
              key={additionalField.localId}
              additionalField={additionalField}
            />
          ))
        ) : (
          <SortableContext
            items={section.additionalFields.map((additionalField) => additionalField.localId)}
            strategy={rectSortingStrategy}
          >
            {section.additionalFields.map((additionalField) => (
              <AdditionalField
                key={additionalField.localId}
                additionalField={additionalField}
                prefersReducedMotion={prefersReducedMotion}
              />
            ))}
          </SortableContext>
        )}
        {section.additionalFields.length === 0 ? (
          <EmptyAdditionalFields aria-hidden="true" />
        ) : null}
        {!preview ? (
          <AddFieldButton
            type="dashed"
            block
            onClick={() => onAddField?.(section.guid)}
          >
            Добавить поле
          </AddFieldButton>
        ) : null}
      </AdditionalFieldsList>
    </AdditionalFieldSectionRoot>
  )
}

interface AdditionalFieldSectionProps {
  section: AdditionalFieldsTreeSection
  onAddField: (sectionGuid: string) => void
  prefersReducedMotion: boolean
}

export function AdditionalFieldSection({
  section,
  onAddField,
  prefersReducedMotion,
}: AdditionalFieldSectionProps) {
  const {
    active,
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({
    id: section.guid,
    data: { type: ADDITIONAL_FIELD_SECTION_TYPE },
    transition: prefersReducedMotion ? null : SORTABLE_TRANSITION,
  })

  const showDropIndicator =
    isOver && active?.data.current?.type === ADDITIONAL_FIELD_SECTION_TYPE

  return (
    <AdditionalFieldSectionShell
      ref={setNodeRef}
      $isDragging={isDragging}
      $showDropIndicator={showDropIndicator}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <AdditionalFieldSectionContent
        section={section}
        onAddField={onAddField}
        prefersReducedMotion={prefersReducedMotion}
        sectionHandleProps={{ ref: setActivatorNodeRef, ...attributes, ...listeners }}
      />
    </AdditionalFieldSectionShell>
  )
}

interface AdditionalFieldSectionPreviewProps {
  section: AdditionalFieldsTreeSection
}

export function AdditionalFieldSectionPreview({
  section,
}: AdditionalFieldSectionPreviewProps) {
  return <AdditionalFieldSectionContent section={section} preview />
}
