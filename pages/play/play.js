// pages/play/play.js
var song = require('../../utils/mock.js').songs;
var strRe = /\[(\d{2}:\d{2})\.\d{2,}\](.*)/;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    abc : {}
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) { 

    //   var data = song[options.id] || {};
    //   console.log(typeof this.getlyriclist(data));

      this.setData({
          currentId: options.id
      });
      this.idKey = wx.getStorageSync('ids'); //拿到所有歌曲id值
      console.log(this.idKey)
      this.idsArr = Object.keys(this.idKey);
     
  },
  onReady: function () {   
      console.log('听说你不出来那我就要试试')
      this.reload(this.data.currentId);
      
  },
  onShow: function () {
      this.animation = wx.createAnimation({
          duration: 1000,
          timingFunction: 'ease',
      });
  },
  onHide: function () {
      this.clearTurner();
  },
  onUnload: function () {
      this.clearTurner();
  },
  actionEvent: function (e) {  // 控制播放按钮
  console.log('你先进来咯？')
      var method = this.data.status === 'play' ? 'pause' : 'play';
      this.setData({
          status: method,
          action: {
              method: method
          }
      });

      if (method === 'pause') 
        this.clearTurner();
  },
  clearTurner: function () {  // 清除动态条时间
  console.log('清除个时间')
    if (this.turner) {
          clearInterval(this.turner);
          this.turner = null;
      }
  },
  getlyriclist: function (data) { // 歌词滚动区
      console.log('歌词区进来了')
    //   console.log(data);
      var obj = {},
          lyricList = [],
          zh = data.zh ? data.zh.split('\n') : [],
          en = data.en ? data.en.split('\n') : [];
        // console.log(zh)
        zh.forEach(function (str) {
            var arr = str.match(strRe);
          if (!arr) return;

          var k = arr[1],
              v = arr[2] || '(music)';

          if (!obj[k]) obj[k] = {};
          obj[k].zh = v;
      });
      if (en.length) {
          this.isensong = true;
          en.forEach(function (str) {
              var arr = str.match(strRe);
              if (!arr) return;

              var k = arr[1],
                  v = arr[2] || '(music)';

              if (!obj[k]) obj[k] = {};
              obj[k].en = v;
          });
      } else {
          this.isensong = false;
      }

      for (var t in obj) {
          var ts = t.split(':');
          var time = parseInt(ts[0]) * 60 + parseInt(ts[1]);

          if (lyricList.length) {
              lyricList[lyricList.length - 1].endtime = time;
          }

          lyricList.push({
              time: time,
              zh: obj[t].zh,
              en: obj[t].en
          });
      }

      return lyricList;
  },
  reload: function (id) {  //每次载入页面 默认参数
      console.log('控制载入函数----->'+id);
      var data = song[id] || {};
      this.clearTurner();
      this.animation.translateY(0).step({
          duration: 1000,
          delay: 100
      });
      wx.setNavigationBarTitle({
          title: data.name
      });
      let that = this;
      let playid =id;
      wx.request({
          url: 'http://172.17.2.234:3000/music/url', ///  --     
          data: {
              id: playid
          },
          header: {
              'content-type': 'application/json'
          },
          success: function (res) {
              //   console.log(111);
              //   console.log(res.data.data[0]);
              let murl = res.data.data[0];
              that.setData({
                  src: murl.url
              })
          }
      });
      this.setData({ //设置默认属性
          per: 0,
          deg: 0,
          status: 'play',
          lyricHidden: true,
          toastHidden: true,
          favHidden: true,
          fav: wx.getStorageSync('fav')[id] ? 'liked' : 'unlike',
          mode: this.data.mode || 'loop',
          currentId: id,
          currentTime: '0',
          currentIndex: -1,
          timeText: '00:00',
          durationText: '',
          animationData: this.animation.export(),
          title: data.name,
          picurl: data.album.picUrl,
          action: {
              method: 'setCurrentTime',
              data: 0
          },
          lyricList: this.getlyriclist(data)
      });

      setTimeout(() => {
          this.setData({
              action: {
                  method: 'play'
              }
          })
      }, 100);
  },
  getnextsongid: function () {  //判断播放模式
      if (this.data.mode === 'single') {
          return this.data.currentid;
      } else if (this.data.mode === 'random') {
          return idsarr[math.floor(math.random() * idsarr.length)]
      } else if (this.data.mode === 'loop') {
          return this.idKey[number(this.data.currentid)].nextid;
      }
  },
  switchbgEvent: function (e) {   // 点击切换歌词页面
      this.setData({
          lyricHidden: !this.data.lyricHidden
      });
  },
  timeupdateEvent:function(e){  // 获得歌曲播放序列
    //   console.log(e);
      var t = e.detail.currentTime,  // 获取当前播放毫秒数
          d = e.detail.duration,    //获得总时长
          step = this.isEnSong ? 78 : 55,
          list = this.data.lyricList,
          cIndex = this.data.currentIndex;
        //   console.log(this)
      if (cIndex < list.length - 1 && t >= list[cIndex + 1].time) {
          this.animation.translateY(-step * (cIndex + 1)).step();
          this.setData({
              currentTime: t,
              currentIndex: cIndex + 1,
              animationData: this.animation.export()
          });
      }

      this.setData({
          per: Math.floor(t / d * 100),
          timeText: this.formatTime(t),
          durationText: this.formatTime(d)
      });

      if (!this.turner && this.data.status === 'play') {
          this.turner = setInterval(() => {
              this.setData({
                  deg: this.data.deg + 1,
              })
          }, 50);
      }
  },
  errorEvent: function (e) {
      console.log("加载资源失败 code：", e.detail.errMsg);
      this.reload(this.idKey[Number(this.data.currentId)].nextid);
  },
  prevEvent: function (e) {
      this.reload(this.idKey[Number(this.data.currentId)].preid);
  },
  nextEvent: function (e) {
      this.reload(this.idKey[Number(this.data.currentId)].nextid);
  },
  endevent: function (e) {
      this.reload(this.getnextsongid());
  },
  switchModeEvent: function (e) {//播放模式提醒模态框
      var newMode = 'loop';
      var toastMsg = "列表循环";
      if (this.data.mode === 'loop') {
          newMode = 'single';
          toastMsg = "单曲循环";
      } else if (this.data.mode === 'single') {
          newMode = 'random';
          toastMsg = "随机播放";
      }
      this.setData({
          mode: newMode,
          toastMsg: toastMsg,
          toastHidden: false
      })
  },
  formattime: function (time) {//拿到时间序列
      time = math.floor(time);
      var m = math.floor(time / 60).tostring();
      m = m.length < 2 ? '0' + m : m;

      var s = (time - parseint(m) * 60).tostring();
      s = s.length < 2 ? '0' + s : s;

      return `${m}:${s}`;
  }
})
