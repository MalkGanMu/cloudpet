// pages/add/add.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 标题输入框状态
    titleState: 0,
    // 内容输入框状态
    contentState: 0,

    // 标题
    title: null,
    // 内容
    content: null,

    images: [],
  },





  /* 标题文本框聚焦时更改状态*/
  TitleInputFocus: function (e) {
    this.setData({
      titleState: 1
    })
  },
  /* 标题文本框失焦时更改状态*/
  TitleInputBlur: function (e) {
    this.setData({
      titleState: 0
    })
  },

  /* 内容文本框聚焦时更改状态*/
  ContentInputFocus: function (e) {
    this.setData({
      contentState: 1
    })
  },
  /* 内容文本框失焦时更改状态*/
  ContentInputBlur: function (e) {
    this.setData({
      contentState: 0
    })
  },

  // 添加图片
  addImg(e) {
    var that = this;
    // 选择图片
    wx.chooseMedia({
      count: 9,
      mediaType: ['image'],
      success: function (res) {
        console.log(res);
        // 循环每张照片
        res.tempFiles.forEach(element => {
          // 获取照片本地路径
          var file_Path = element.tempFilePath
          // 上传照片
          wx.cloud.uploadFile({
              cloudPath: Date.now() + ".jpg",
              //url: '',
              filePath: file_Path,
              //name: 'file',
            })
            .then(res => {
              // 将返回的照片网络路径添加到数组images,并重新渲染前端
              console.log(res);
              var img = that.data.images;
              img.push(res.fileID)
              that.setData({
                images: img
              })
            })
        });
      }
    })

  },

  // 删除图片
  delImg(e) {
    var that = this;
    var img = that.data.images;
    img.splice(e.currentTarget.dataset.index, 1)
    that.setData({
      images: img
    })
    console.log(e)
  },

  // 获取输入框中的title
  getInputTitle(e) {
    this.setData({
      title: e.detail.value
    });
  },

  // 获取输入框中的content
  getInputContent(e) {
    this.setData({
      content: e.detail.value
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

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