// pages/healthsquare/articledetail/articledetail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    autoplay: false,
    images: [],
    imgheight: 15,

    title:null,
    content:null,
    createTime:null,

    userName:null,
    userIcon:null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

    //将json转化为对象
    var articleDetailBean = JSON.parse(options.args)
    console.log(articleDetailBean)
    //保存图片
    this.setData({
      images: articleDetailBean.imgs,

      //保存标题和内容 并渲染
      title: articleDetailBean.title,
      content: articleDetailBean.content,
      createTime: articleDetailBean.createTime,

      //保存作者信息
      userName:articleDetailBean.userName,
      userIcon: articleDetailBean.userIcon
    })
    

    //获取首图高度
    var that = this;
    wx.getImageInfo({
      src: this.data.images[0],
      success: function (res) {
        console.log(res);
        var ratio = res.width / res.height;
        //计算的高度值  
        var viewHeight = 750 / ratio;
        that.setData({
          imgheight: viewHeight
        })
      },

    })

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})