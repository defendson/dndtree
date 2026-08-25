import { css } from '@emotion/react'
import styled from '@emotion/styled'
import { Button } from 'antd'

export const treeGlobalStyles = css`
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

export const TreePage = styled.main`
  width: min(620px, calc(100% - 32px));
  margin: 0 auto;
  padding: 48px 0;

  @media (max-width: 520px) {
    width: min(100% - 20px, 620px);
    padding: 20px 0;
  }
`

export const TreeRoot = styled.div`
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

const overlayStyles = css`
  width: 100%;
  overflow: hidden;
  border-radius: 10px;
  box-shadow: 0 18px 44px rgb(26 32 44 / 18%);
  transform: rotate(0.35deg);
`

export const AdditionalFieldSectionOverlay = styled.div`
  ${overlayStyles};
`

export const AdditionalFieldOverlay = styled.div`
  ${overlayStyles};
`
