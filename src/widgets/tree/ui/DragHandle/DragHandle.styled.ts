import styled from '@emotion/styled'

export const DragHandleButton = styled.button`
  position: absolute;
  top: 8px;
  left: 8px;
  display: grid;
  width: 32px;
  height: 32px;
  padding: 0;
  place-items: center;
  border: 1px solid transparent;
  border-radius: 6px;
  color: var(--text);
  background: transparent;
  cursor: grab;
  opacity: 0.48;
  touch-action: none;
  transition:
    color 120ms ease,
    border-color 120ms ease,
    background-color 120ms ease,
    opacity 120ms ease;

  &:hover {
    border-color: var(--border);
    color: var(--accent);
    background: var(--surface);
    opacity: 1;
  }

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
    color: var(--accent);
    opacity: 1;
  }

  &:active,
  &[aria-pressed='true'] {
    cursor: grabbing;
  }
`

export const DragHandleIcon = styled.svg`
  width: 12px;
  height: 18px;
  fill: currentColor;
  pointer-events: none;
`
