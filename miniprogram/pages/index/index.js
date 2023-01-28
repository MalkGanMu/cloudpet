Page({

  data: {
    //autoplay
    autoplay: false,
    // 数据相关
    list: [],
    heightList: [],
    // 分页相关
    paging: {
      page: 1, //第几页
      limit: 8, //多少条
      total: 0, //总页数(接口赋值)
      loding: false, //是否到底了
    }
  },

  toArticledetail(e) {
    console.log(e)
    //将文章信息对象转为json
    var articleDetailJson = JSON.stringify(this.data.list[e.currentTarget.dataset.index])
    console.log(articleDetailJson)
    wx.navigateTo({
      url: '../articledetail/articledetail?args=' + articleDetailJson
    })
  },

  pro(element) {
    return new Promise((resolve, reject) => {
      var winWid = wx.getSystemInfoSync().windowWidth; //获取当前屏幕的宽度
      var winHei = wx.getSystemInfoSync().windowHeight; //获取当前屏幕的高度
      // console.log(winHei)
      wx.getImageInfo({
        src: element.imgs[0],
        complete: (res) => {
          var imgh = res.height; //图片高度
          var imgw = res.width;
          var swiperH = winWid * imgh / imgw  //等比设置swiper的高度。  
          //即 屏幕宽度 / swiper高度 = 图片宽度 / 图片高度  -->  swiper高度 = 屏幕宽度 * 图片高度 / 图片宽度
          if (swiperH > winHei / 4 * 3) { //如果图片高度超过屏幕一半,则强制缩小
            swiperH = winHei / 4 * 3;
          }
          swiperH = swiperH + 'px'
          console.log("图片:" + element.imgs[0] + ";屏幕宽度:" + winWid + ";图片宽度:" + imgw + ";图片高度:" + imgh + ";最终高度:" + swiperH);
          this.setData({
            // swiperHeight: swiperH, //设置swiper高度
            'heightList': this.data.heightList.concat(swiperH) //合并列表数据
          })
          resolve();
        }
      })
      
    });
  },
  //swiper高度自适配
  async SetImgHeight(e) {
    // this.setData({
    //   // swiperHeight: swiperH, //设置swiper高度
    //   'heightList': []
    // })

    // this.data.list.forEach(async (element) => {
    //   console.log(element._id)
    //   await this.pro(element);
    // });
    // console.log("执行完毕")

    for (let i = 0; i < e.length; i++) {
      const element = e[i];
      console.log(element._id)
      await this.pro(element);
    }
    // console.log("执行完毕")
  },

  //无用
  // handleSwiper: function(e){
  //   var that = this
  //   that.setData({
  //      current: e.detail.current
  //   })
  // },

  onLoad(options) {
    // 首次请求数据
    this.getOneList();
  },

  /**
   * 请求列表数据
   * @description 懒加载判断与合并数据
   * @return void
   */
  getList() {
    //调用云函数,获取列表
    wx.cloud.callFunction({
        name: "getPosts",
        data: {
          page: this.data.paging.page, //第几页
          limit: this.data.paging.limit //一页多少条
        },
      })
      .then(res => {
        let data = res.result.lists
        this.setData({
          'list': this.data.list.concat(data) //合并列表数据
        })
        this.SetImgHeight(data);
        // 判断是否到底
        this.panBottom()
      })
  },


  /**
   * [仅调用一次] 首次请求数据
   * @description 赋值首屏数据与总条数/判断是否到底
   * @return void 
   */
  getOneList() {
    // var app = getApp();
    // const db = wx.cloud.database();
    // const countResult = db.collection('posts').count()
    // const total = countResult.total
    // const MAX_SIZE = this.data.paging.limit

    // db.collection('posts')
    // .orderBy('createTime','desc')
    // .skip((this.data.paging.page - 1) * MAX_SIZE)
    // .limit(MAX_SIZE)
    // .get()
    // .then(res => {
    //   console.log(res)
    //   console.log(total)
    //   this.setData({
    //     'paging.total': total,//总条数
    //     'list': res.result.data,//列表数据
    //   })
    // })

    //调用云函数,获取列表
    wx.cloud.callFunction({
        name: "getPosts",
        data: {
          page: this.data.paging.page, //第几页
          limit: this.data.paging.limit //一页多少条
        },
      })
      .then(res => {
        console.log(res)
        this.setData({
          'paging.total': res.result.total, //总条数
          'list': res.result.lists, //列表数据.
        })
        console.log(this.data.list)
        this.SetImgHeight(res.result.lists);
        // 判断是否到底
        this.panBottom()
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
  onReachBottom() {
    // 页面触底了
    this.panNext()
    // console.log('触底了')
  },

})