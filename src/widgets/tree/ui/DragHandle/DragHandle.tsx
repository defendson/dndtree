import type { ButtonHTMLAttributes, Ref } from 'react'
import { DragHandleButton, DragHandleIcon } from './DragHandle.styled'

export type DragHandleProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  ref?: Ref<HTMLButtonElement>
}

interface DragHandleComponentProps {
  label: string
  handleProps: DragHandleProps
}

export function DragHandle({ label, handleProps }: DragHandleComponentProps) {
  return (
    <DragHandleButton
      type="button"
      aria-label={label}
      {...handleProps}
    >
      <DragHandleIcon viewBox="0 0 12 18" aria-hidden="true">
        <circle cx="3" cy="3" r="1.5" />
        <circle cx="9" cy="3" r="1.5" />
        <circle cx="3" cy="9" r="1.5" />
        <circle cx="9" cy="9" r="1.5" />
        <circle cx="3" cy="15" r="1.5" />
        <circle cx="9" cy="15" r="1.5" />
      </DragHandleIcon>
    </DragHandleButton>
  )
}
