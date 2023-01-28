// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
}) // 使用当前云环境
const db = cloud.database();
// 云函数入口函数
exports.main = async (event, context) => {
  var result = {
    total: 0,
    lists: null
  }
  const countResult = await db.collection('posts').count()
  const total = countResult.total

  const MAX_SIZE = event.limit
  var feedbacks = []

  await db.collection('posts')
    .orderBy('createTime', 'desc')
    .skip((event.page - 1) * MAX_SIZE)
    .limit(MAX_SIZE).get()
    .then(res => {
      console.log(res)
      feedbacks = res.data
    })

  result.total = total
  result.lists = feedbacks
  return result
  // return await db.collection("posts").get()
}