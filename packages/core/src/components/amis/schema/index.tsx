import { RendererProps, RenderOptions } from 'amis/lib/factory'
import { isEmpty } from 'lodash'
import React, { useMemo } from 'react'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { ThemeConsumer } from 'styled-components'

import { storage } from '@/constants'
import { getGlobal, setGlobal } from '@/utils/store'

import renderAmis from './amis'
import { resolveLibSchema, wrapCss } from './func'
import { LibSchema } from './types'

export type AmisProps = {
  schema: LibSchema
  props?: RendererProps
  option?: RenderOptions
}

// 文档 https://baidu.github.io/amis/docs/getting-started
// 源码 https://github.com/baidu/amis/blob/master/examples/components/App.jsx
type Props = AmisProps & RouteComponentProps<any>

export const Amis = withRouter((props: Props) => {
  const { schema, props: amisProps, option = {}, history } = props

  const { preset } = schema

  const envSchema: LibSchema = useMemo(() => {
    const cssSchema = wrapCss(schema)
    if (!preset || isEmpty(preset)) {
      return cssSchema
    }
    const codeStore = getGlobal<any>(storage.dev.code) || {}
    const libSchema = resolveLibSchema(cssSchema)
    if (codeStore.enable) {
      setGlobal(storage.dev.code, {
        enable: true,
        schema: libSchema,
      })
    }
    return libSchema
  }, [schema])

  return (
    <ThemeConsumer>
      {(theme) =>
        renderAmis({
          history,
          theme,
          option,
          props: amisProps,
          schema: envSchema,
        })
      }
    </ThemeConsumer>
  )
})
