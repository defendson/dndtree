import { css } from '@emotion/react'
import styled from '@emotion/styled'
import { Button } from 'antd'

export const appGlobalStyles = css`
  :root {
    --page: #f7f7f8;
    --surface: #ffffff;
    --section: #eceef1;
    --hover: #e4e7eb;
    --border: #d9dce1;
    --text: #20242c;
    --accent: #4f67e8;
    color: var(--text);
    background: var(--page);
    font-family:
      ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-synthesis: none;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  * {
    box-sizing: border-box;
  }

  html,
  body {
    min-width: 320px;
    min-height: 100%;
    margin: 0;
    background: var(--page);
  }

  ::selection {
    color: white;
    background: var(--accent);
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      transition-duration: 0.01ms !important;
      animation-duration: 0.01ms !important;
    }
  }
`

export const PageShell = styled.main`
  width: min(620px, calc(100% - 32px));
  margin: 0 auto;
  padding: 48px 0;

  @media (max-width: 520px) {
    width: min(100% - 20px, 620px);
    padding: 20px 0;
  }
`

export const HiddenListFieldsRoot = styled.div`
  display: none;
`

export const Tree = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

export const AddSectionButton = styled(Button)`
  && {
    height: 48px;
    margin-top: 12px;
    border-color: var(--border);
    border-radius: 10px;
    color: var(--text);
    background: transparent;
    box-shadow: none;
  }

  &&:hover,
  &&:focus-visible {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--surface);
  }
`

export const AddFieldButton = styled(Button)`
  && {
    grid-column: 1 / -1;
    height: 40px;
    border-color: var(--border);
    border-radius: 7px;
    color: var(--text);
    background: transparent;
    box-shadow: none;
  }

  &&:hover,
  &&:focus-visible {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--surface);
  }
`

interface SectionShellProps {
  $isDragging: boolean
  $showDropIndicator: boolean
}

export const SectionShell = styled.div<SectionShellProps>`
  position: relative;
  opacity: ${({ $isDragging }) => ($isDragging ? 0.2 : 1)};
  transition: opacity 120ms ease;

  ${({ $showDropIndicator }) =>
    $showDropIndicator &&
    css`
      &::before {
        position: absolute;
        z-index: 2;
        top: -7px;
        right: 0;
        left: 0;
        height: 2px;
        border-radius: 2px;
        background: var(--accent);
        content: '';
      }
    `}
`

export const TreeSection = styled.div`
  padding: 8px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--section);
`

const rowStyles = css`
  position: relative;
  display: flex;
  min-height: 48px;
  align-items: center;
  border-radius: 7px;
  color: var(--text);
`

interface RowProps {
  $hasHandle: boolean
}

export const SectionRow = styled.div<RowProps>`
  ${rowStyles};
  padding: ${({ $hasHandle }) => ($hasHandle ? '0 14px 0 50px' : '0 14px')};
  font-size: 15px;
  font-weight: 650;
`

export const ItemRow = styled.div<RowProps>`
  ${rowStyles};
  min-height: 64px;
  padding: ${({ $hasHandle }) =>
    $hasHandle ? '12px 14px 12px 50px' : '12px 14px'};
  border: 1px solid var(--border);
  background: var(--surface);
  font-size: 14px;
  font-weight: 500;
  line-height: 1.35;
  overflow-wrap: anywhere;
`

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

export const ChildrenList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  min-height: 8px;
  gap: 7px;
  padding: 4px 0 0 32px;

  @media (max-width: 520px) {
    padding-left: 20px;
  }
`

interface SortableShellProps {
  $isDragging: boolean
}

export const SortableShell = styled.div<SortableShellProps>`
  min-width: 0;
  opacity: ${({ $isDragging }) => ($isDragging ? 0.2 : 1)};
`

export const EmptyRow = styled.div`
  grid-column: 1 / -1;
  min-height: 34px;
  border: 1px dashed var(--border);
  border-radius: 7px;
`

const overlayStyles = css`
  overflow: hidden;
  border-radius: 10px;
  box-shadow: 0 18px 44px rgb(26 32 44 / 18%);
  transform: rotate(0.35deg);
`

export const SectionOverlay = styled.div`
  ${overlayStyles};
  width: 100%;
`

export const ItemOverlay = styled.div`
  ${overlayStyles};
  width: 100%;
`
