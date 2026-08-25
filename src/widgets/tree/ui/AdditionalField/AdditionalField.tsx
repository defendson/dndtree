import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ADDITIONAL_FIELD_TYPE, SORTABLE_TRANSITION } from '../../constants'
import type { AdditionalFieldValue } from '../../types'
import { DragHandle } from '../DragHandle/DragHandle'
import type { DragHandleProps } from '../DragHandle/DragHandle'
import { AdditionalFieldRow, AdditionalFieldShell } from './AdditionalField.styled'

interface AdditionalFieldContentProps {
  additionalField: AdditionalFieldValue
  preview?: boolean
  handleProps?: DragHandleProps
}

function AdditionalFieldContent({
  additionalField,
  preview = false,
  handleProps = {},
}: AdditionalFieldContentProps) {
  return (
    <AdditionalFieldRow $hasHandle={!preview}>
      {additionalField.fieldName}
      {!preview ? (
        <DragHandle
          label={`Переместить элемент «${additionalField.fieldName}»`}
          handleProps={handleProps}
        />
      ) : null}
    </AdditionalFieldRow>
  )
}

interface AdditionalFieldProps {
  additionalField: AdditionalFieldValue
  prefersReducedMotion: boolean
}

export function AdditionalField({
  additionalField,
  prefersReducedMotion,
}: AdditionalFieldProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: additionalField.localId,
    data: { type: ADDITIONAL_FIELD_TYPE },
    transition: prefersReducedMotion ? null : SORTABLE_TRANSITION,
  })

  return (
    <AdditionalFieldShell
      ref={setNodeRef}
      $isDragging={isDragging}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <AdditionalFieldContent
        additionalField={additionalField}
        handleProps={{ ref: setActivatorNodeRef, ...attributes, ...listeners }}
      />
    </AdditionalFieldShell>
  )
}

interface AdditionalFieldPreviewProps {
  additionalField: AdditionalFieldValue
}

export function AdditionalFieldPreview({
  additionalField,
}: AdditionalFieldPreviewProps) {
  return <AdditionalFieldContent additionalField={additionalField} preview />
}
