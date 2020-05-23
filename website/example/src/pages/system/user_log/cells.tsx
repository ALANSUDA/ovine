import { get } from 'lodash'
import React from 'react'

import { strDelimiter } from '@core/constants'
import { getActionAddrMap } from '@core/routes/config'

export const ActionAddrCell = (props) => {
  const { actionAddr } = props.data
  const addrMap = getActionAddrMap()
  const label = (get(addrMap, `${actionAddr}.label`) || '') as string
  const [actionPath, actionItems] = label.split(strDelimiter)

  return (
    <td>
      {!actionPath ? (
        '-'
      ) : (
        <>
          <span>{actionPath}</span>
          <span className="p-l-sm">{actionItems}</span>
        </>
      )}
    </td>
  )
}
