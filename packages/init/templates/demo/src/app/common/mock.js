/**
 * 定义一些全局需要的 MOCK 数据
 */

import { times } from 'lodash'

export default {
  'GET ovapi/system/role/filter': () => {
    return {
      data: {
        list: times(20, (i) => ({
          id: i + 10,
          name: `角色-${i + 10}`,
        })),
      },
    }
  },
  'GET ovapi/system/user/item/$id': ({ data = {} }) => {
    return {
      data: {
        avatar: 'https://www.biaobaiju.com/uploads/20180225/23/1519573791-gcmpiQFtAk.jpg',
        id: data.id,
        username: 'userLoginUsername',
        nickname: '你好啊',
        signature: '超级想睡觉，超级想睡觉超级想睡觉超级想睡觉超级想睡觉。',
        remark: '这个家伙就知道睡觉。',
        updateTime: Date.now() / 1000,
      },
    }
  },
}
