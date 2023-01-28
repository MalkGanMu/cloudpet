// pages/smallNest/smallNest.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 分页相关
    paging: {
      page: 1, //第几页
      limit: 8, //多少条
      total: 0, //总页数(接口赋值)
      loding: false, //是否到底了
    },

    // 分类相关
    classification: ['关注', '全部', '猫咪', '狗狗', '鸟类', '鱼类', '啮齿', '爬行', '哺乳'],
    classSelect: 1,

    // data
    petList: []
  },

  // 切换宠物类别
  CutClass(e) {
    // console.log(e);
    // 修改类别
    this.setData({
      classSelect: e.currentTarget.dataset.index,
      'paging.page': 1  //重置页面
    })

    this.getOneList();

  },

  // 载入宠物类别


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getOneList();
  },


  /**
   * 请求列表数据
   * @description 懒加载判断与合并数据
   * @return void
   */
  getList() {
    const db = wx.cloud.database();

    // 查询条件处理
    var targetArr = []; // 查询的类别数组
    var followArr = []; // 查询的关注数组

    // 如果类别不是'关注'
    if (this.data.classSelect != 0) {
      if (this.data.classSelect != 1) {
        targetArr = [this.data.classification[this.data.classSelect]];
      } else {
        targetArr = ['关注', '全部', '猫咪', '狗狗', '鸟类', '鱼类', '啮齿', '爬行', '哺乳'];
      }

      const MAX_SIZE = this.data.paging.limit
      db.collection('pets').where({
          classification: db.command.in(targetArr)
        })
        // .orderBy('createTime','desc')
        .skip((this.data.paging.page - 1) * MAX_SIZE)
        .limit(MAX_SIZE)
        .get()
        .then(res => {
          this.setData({
            'petList': this.data.petList.concat(res.data), //合并列表数据
          })
          console.log(this.data.petList)
          this.panBottom(); //检查是否触底
        })

    }

  },


  /**
   * [仅调用一次] 首次请求数据
   * @description 赋值首屏数据与总条数/判断是否到底
   * @return void 
   */
  getOneList() {
    const db = wx.cloud.database();

    // 查询条件处理
    var targetArr = []; // 查询的类别数组
    var followArr = []; // 查询的关注数组


    // 如果类别不是'关注'
    if (this.data.classSelect != 0) {
      if (this.data.classSelect != 1) {
        targetArr = [this.data.classification[this.data.classSelect]];
      } else {
        targetArr = ['关注', '全部', '猫咪', '狗狗', '鸟类', '鱼类', '啮齿', '爬行', '哺乳'];
      }

      // 查找数据库
      db.collection('pets').where({
        classification: db.command.in(targetArr)
      }).count().then(res => {
        this.setData({
          'paging.total': res.total, //总条数
        })
        console.log(res.total)
      })

      const MAX_SIZE = this.data.paging.limit
      db.collection('pets').where({
          classification: db.command.in(targetArr)
        })
        // .orderBy('createTime','desc')
        .skip((this.data.paging.page - 1) * MAX_SIZE)
        .limit(MAX_SIZE)
        .get()
        .then(res => {
          console.log(res)
          this.setData({
            'petList': res.data, //列表数据
          })
          console.log(this.data.petList)
          this.panBottom(); //检查是否触底
        })
    }

  },


  /**
   * 判断是否继续加载
   * @description 页码+1,有数据则继续请求
   * @return void
   */
  panNext() {
    // 页码计算，用来判断是否能继续加载分页数据
    const pageNum = this.data.paging.total % this.data.paging.limit === 0 ? this.data.paging.total / this.data.paging.limit : parseInt(this.data.paging.total / this.data.paging.limit) + 1;
    if (pageNum > 1 && pageNum > Number(this.data.paging.page)) {
      // 页码+1
      this.setData({
        'paging.page': Number(++this.data.paging.page)
      })
      // 有数据,继续请求
      this.getList()
    } else {
      // 到底了,改变变量标识
      this.setData({
        'paging.loding': true
      })
    }
  },

  /**
   * 判断是否到底
   * @description 通过接口返回的总条数得知是否还有下一页
   * @return void
   */
  panBottom() {
    // 页码计算，用来判断是否能继续加载分页数据
    const pageNum = this.data.paging.total % this.data.paging.limit === 0 ? this.data.paging.total / this.data.paging.limit : parseInt(this.data.paging.total / this.data.paging.limit) + 1;
    if (pageNum > 1 && pageNum > Number(this.data.paging.page)) {} else {
      // 到底了,改变变量标识
      this.setData({
        'paging.loding': true
      })
    }
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    // 页面触底了
    this.panNext()
    // console.log('触底了')
  },

})