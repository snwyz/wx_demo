//index.js

const data = require('../../utils/mock.js').songs;

Page({

  /** 
   * 页面的初始数据
   */
  data: {
      imgUrls: [
          '../../images/1.jpg',
          '../../images/2.jpg',
          '../../images/3.jpg',
          
      ],
      indicatorDots: true,
      autoplay: true,
      circular:true,
      interval: 3000,
      duration: 1000
  },
  trunPlay:function(e){
      console.log(e);
      let dataset = e.currentTarget.dataset;// 拿到数据源的id
      wx.navigateTo({
          url: `../play/play?id=${dataset.id}`
      })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    //   console.log(data);
      let arr = [],
          idKey = {},
          keys = Object.keys(data), //将 json数据转换为数组类型~
          len = keys.length;
        //   console.log(keys)

    for (let i = 0; i < len; i++){
        let j = keys[i]; // 拿到每一个 json 中的 音乐 id 值
        // console.log(j);
        arr.push(Object.assign({ id: j }, data[j])); // 这里用到深拷贝。那么浅拷贝又是什么？就是浅拷贝是都指向同一块内存区块地址！
        // console.log(arr);                                            // 深拷贝则是另外开辟了一块内存区。
        idKey[j] = {
            preid : i > 0? keys[i-1] : 0 ,
            nextid : i < len - 1 ? keys[i+1] : 0 
        }     
    }
    idKey[keys[0]].preid = keys[len - 1];
    idKey[keys[len - 1]].nextid = keys[0];      
    this.setData({
        retrunData : arr
    });
    wx.setStorageSync('ids',idKey);  //同一个微信用户，同一个小程序 storage 上限为 10MB
    // console.log(idKey)                         //将 data 存储在本地缓存中指定的 key 中，会覆盖掉原来该 key 对应的内容，这是一个同步接口。
  }
})
