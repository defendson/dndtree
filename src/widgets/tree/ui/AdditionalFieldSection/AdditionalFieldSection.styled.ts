import { css } from '@emotion/react'
import styled from '@emotion/styled'
import { Button } from 'antd'

interface AdditionalFieldSectionShellProps {
  $isDragging: boolean
  $showDropIndicator: boolean
}

export const AdditionalFieldSectionShell = styled.div<AdditionalFieldSectionShellProps>`
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

export const AdditionalFieldSectionRoot = styled.div`
  padding: 8px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--section);
`

interface AdditionalFieldSectionHeaderProps {
  $hasHandle: boolean
}

export const AdditionalFieldSectionHeader = styled.div<AdditionalFieldSectionHeaderProps>`
  position: relative;
  display: flex;
  min-height: 48px;
  padding: ${({ $hasHandle }) => ($hasHandle ? '0 14px 0 50px' : '0 14px')};
  align-items: center;
  border-radius: 7px;
  color: var(--text);
  font-size: 15px;
  font-weight: 650;
`

export const AdditionalFieldsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  min-height: 8px;
  gap: 7px;
  padding: 4px 0 0 32px;

  @media (max-width: 520px) {
    padding-left: 20px;
  }
`

export const EmptyAdditionalFields = styled.div`
  grid-column: 1 / -1;
  min-height: 34px;
  border: 1px dashed var(--border);
  border-radius: 7px;
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
