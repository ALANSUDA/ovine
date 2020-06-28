import 'jquery.fancytree/dist/skin-win8/ui.fancytree.css'
import 'jquery.fancytree'

import React from 'react'

import Aside from '@/layout/aside'
import Code from '@/layout/code'
import Preview from '@/layout/preview'
import Reference from '@/layout/reference'
import TopBar from '@/layout/topbar'

import { StyledEditor, StyledEditorBody } from './styled'

export default () => {
  return (
    <StyledEditor>
      <TopBar />
      <StyledEditorBody>
        <Aside />
        <Code />
        <Preview />
        <Reference />
      </StyledEditorBody>
    </StyledEditor>
  )
}
