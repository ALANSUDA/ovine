import isFunction from 'lodash/isFunction'
import { createGlobalStyle, css, DefaultTheme } from 'styled-components'

import { app } from '@/app'

const getSiteStyle = (props: DefaultTheme) => {
  try {
    const siteStyle = app.styled.globalStyle
    return !isFunction(siteStyle) ? siteStyle : siteStyle(props)
  } catch (_) {
    //
  }

  return undefined
}

// 全局样式
const GlobalStyle = createGlobalStyle`
  /** lib 全局样式 */
  .app-root {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .form-control-static {
    min-height: 34px;
    padding-top: 7px;
    padding-bottom: 7px;
    margin-bottom: 0;
  }

  .form-line-break-json {
    
  }

  .clickable {
    user-select: none;
    cursor: pointer;
  }

  .l-h-1 {
    line-height: 1;
  }

  .sub-h-full {
    & > *:only-child {
      height: 100%;
    }
  }

  /** 适配 bootstrap 升级,等 amis 官方升级搭配 4.0+ 就可以 */
  svg.icon {
    top: 0 !important;
  }
  .glyphicon {
    display: inline-block;
    font: normal normal normal 14px/1 FontAwesome;
    font-size: inherit;
    text-rendering: auto;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;

    &-th:before {
      content: "\f009";
    }
    &-sort:before {
      content: "\f0ec";
      transform: rotate(90deg);
    }
    &-remove:before {
      content: "\f00d";
    }
  }
  
  [role=button] {
    cursor: pointer;
  }


  /** lib 主题相关的全局样式 */
  /** amis 兼容  */
  ${({ theme: { ns, colors } }) => css`
    body > div {
      color: ${colors.text};
    }

    .line-break-json {
      .${ns}JsonField {
        width: 100%;
        span {
          white-space: normal;
          word-break: all;
        }
      }
    }

    .${ns}Chart {
      min-width: 100px !important;
      min-height: 100px !important;
    }

    .${ns}DateRangePicker {
      align-items: center;
    }

    .${ns}Drawer {
      &.hide-close-button {
        .${ns}Drawer-close {
          display: none;
        }
      }
    }

    /** 1.0.14 Tree BUG */
    .${ns}Tree-itemIcon {
      line-height: 30px;
      &.${ns}Tree-leafIcon {
        svg {
          display: block;
          margin-top: 8px;
        }
      }
      svg {
        display: none;
      }
    }
  `}

  /** site 全局样式 */
  ${({ theme }) => getSiteStyle(theme)}
`

export default GlobalStyle
