import styled from '@emotion/styled'

interface AdditionalFieldRowProps {
  $hasHandle: boolean
}

export const AdditionalFieldRow = styled.div<AdditionalFieldRowProps>`
  position: relative;
  display: flex;
  min-height: 64px;
  padding: ${({ $hasHandle }) =>
    $hasHandle ? '12px 14px 12px 50px' : '12px 14px'};
  align-items: center;
  border: 1px solid var(--border);
  border-radius: 7px;
  color: var(--text);
  background: var(--surface);
  font-size: 14px;
  font-weight: 500;
  line-height: 1.35;
  overflow-wrap: anywhere;
`

interface AdditionalFieldShellProps {
  $isDragging: boolean
}

export const AdditionalFieldShell = styled.div<AdditionalFieldShellProps>`
  min-width: 0;
  opacity: ${({ $isDragging }) => ($isDragging ? 0.2 : 1)};

  @media (prefers-reduced-motion: reduce) {
    transition-duration: 0.01ms !important;
  }
`
