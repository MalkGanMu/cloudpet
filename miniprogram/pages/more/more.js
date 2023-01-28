// pages/more/more.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // userData
    userID: 100002,
    userInfo: null,
    hasUserInfo: false,
    canIUseGetUserProfile: false,

    // 记录swiper下标
    swiperIndex: 0,

    // 所有宠物
    petList: [],
    petTotal: 0,
    MAXdisplay: 0,
    selectPet: null,

    // petData 单只宠物
    petPostTotal: 0,
    petLike: 0,
    petFollow: 0,

    // 分页相关
    paging: {
      page: 1, //第几页
      limit: 9, //多少条
      total: 0, //总页数(接口赋值)
      loding: false, //是否到底了
    },
    petPostList: []
  },

  // 登录
  onLogin(e) {
    var app = getApp()
    if (this.data.hasUserInfo) {
      console.log(app.globalData.userInfo.nickName)
    } else {
      wx.getUserProfile({
        desc: '获取您的头像及用户名信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
        success: (res) => {
          console.log(res)
          var app = getApp()
          app.globalData.userInfo = res.userInfo; // 将用户信息存到globalData里面
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })

      this.getPets();
    }

  },

  // 方法A
  getOpenID() {
    return new Promise((resolve, reject) => {
      // 获取openid
      let that = this;
      wx.cloud.callFunction({
        name: 'getOpenID',
        complete: res => {
          //你想要完成的功能，比如存储openid到全局
          that.data.userID = res.result.openid;
          resolve(res)
        }
      })
    })
  },
  //方法B
  getPets() {
    const db = wx.cloud.database();
    this.getOpenID().then(res => { // 方法A执行完后执行方法B
      // 填写方法B的内容
      console.log(res) // 输出内容：res
      db.collection('pets').where({
          hostID: res.result.openid
        })
        .get()
        .then(res => {
          console.log(res)
          this.setData({
            petList: res.data,
            petTotal: res.data.length
          })

          // 计算宠物总数及但也最大显示数量
          if (res.data.length > 3) {
            this.setData({
              MAXdisplay: 3
            })
          } else if (res.data.length > 0) {
            this.setData({
              MAXdisplay: res.data.length - 1
            })
          }

          // 选择初始宠物下标
          var index = this.data.MAXdisplay;
          this.setData({
            selectPet: res.data[index],
            petPostTotal: res.data[index].postList.length,
            petLike: res.data[index].clout,
            petFollow: res.data[index].fansList.length
          })
          this.getOneList()

        })
    }).catch(res => {
      console.log(res) // 输出内容：'失败啦'
    })
  },

  cutPet(e) {
    console.log(e.detail.current)
    // 选择初始宠物下标
    var index = (e.detail.current + this.data.MAXdisplay) % this.data.petTotal;
    this.setData({
      selectPet: this.data.petList[index],
      petPostTotal: this.data.petList[index].postList.length,
      petLike: this.data.petList[index].clout,
      petFollow: this.data.petList[index].fansList.length,

      'paging.page': 1,  //重置页面
      petPostList: []
    })
    this.getOneList();
  },

  cutPetIndex(e) {
    console.log(e.currentTarget.dataset.index)
    this.setData({
      swiperIndex: e.currentTarget.dataset.index
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },


  /**
   * 请求列表数据
   * @description 懒加载判断与合并数据
   * @return void
   */
  getList() {
    const db = wx.cloud.database();

    // 查询条件处理
    var targetList = this.data.selectPet.postList; // 查询的宠物

    const MAX_SIZE = this.data.paging.limit
    db.collection('posts').where({
        _id: db.command.in(targetList)
      })
      // .orderBy('createTime','desc')
      .skip((this.data.paging.page - 1) * MAX_SIZE)
      .limit(MAX_SIZE)
      .get()
      .then(res => {
        this.setData({
          'petPostList': this.data.petPostList.concat(res.data), //合并列表数据
        })
        console.log(this.data.petPostList)
        this.panBottom(); //检查是否触底
      })

  },


  /**
   * [仅调用一次] 首次请求数据
   * @description 赋值首屏数据与总条数/判断是否到底
   * @return void 
   */
  getOneList() {
    const db = wx.cloud.database();

    // 查询条件处理
    var targetList = this.data.selectPet.postList; // 查询的宠物


    // 查找数据库
    db.collection('posts').where({
      _id: db.command.in(targetList)
    }).count().then(res => {
      this.setData({
        'paging.total': res.total, //总条数
      })
      console.log(res.total)
    })

    const MAX_SIZE = this.data.paging.limit
    db.collection('posts').where({
        _id: db.command.in(targetList)
      })
      // .orderBy('createTime','desc')
      .skip((this.data.paging.page - 1) * MAX_SIZE)
      .limit(MAX_SIZE)
      .get()
      .then(res => {
        console.log(res)
        this.setData({
          'petPostList': res.data, //列表数据
        })
        console.log(this.data.petPostList)
        this.panBottom(); //检查是否触底
      })

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
  // onReachBottom() {
  //   // 页面触底了
  //   this.panNext()
  //   console.log('触底了')
  // },

  scrolltolower(e){
    this.panNext()
    console.log('触底了' + e)
  }

})