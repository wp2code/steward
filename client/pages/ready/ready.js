// pages/ready/ready.js
var util = require('../../utils/util.js')
var amap = require('../../utils/amap.js')
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    winHeight: '300', //手机屏幕高度
    currentTab: 0, //tab 切换标识
    weatherData: {}, //天气
    wakeUpTime: '', //起床时间 wake
    punchInTime: '', //打卡时间
    strategy: 0, //0：公交 1：自驾 2：骑行 3：步行
    city: '上海',
    originName: '我的位置', //起点
    destinationName: '', // 目的地
    origin: '', //起点 经度,纬度 例如： '116.481028,39.989643'
    destination: '', // 目的地 经度,纬度
    scale: 12, //地图比例
    longitude: '121.475424', //经度
    latitude: '31.191984', //纬度
    markers: [], //地图标识
    polyline: [], //路线
    drivingStrategy: [{
        strategy: 10,
        strategyName: ['路程较短']
      }, {
        strategy: 12,
        strategyName: ['躲避拥堵']
      },
      {
        strategy: 13,
        strategyName: ['不走高速']
      },
      {
        strategy: 14,
        strategyName: ['避免收费']
      },
      {
        strategy: 19,
        strategyName: ['高速优先']
      },
      {
        strategy: 20,
        strategyName: ['躲避拥堵', '不走高速']
      }
    ], //自驾策略
    transitStrategy: [{
        strategy: 0,
        strategyName: '最快捷'
      },
      {
        strategy: 2,
        strategyName: '最少换乘'
      },
      {
        strategy: 3,
        strategyName: '最少步行'
      },
      {
        strategy: 1,
        strategyName: '最经济'
      },
      {
        strategy: 5,
        strategyName: '不乘地铁'
      }
    ], //公交策略
    myStrategy: [{
      strategyType: 0, //交通策略类
      detail: [{
        origin: '', //起点
        originName: '', //终点
        destination: '', //起点名称 或方式
        destinationName: '' //终点名称 或方式
      }]
    }] //我的策略
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var weatherData = app.globalData.weatherData;
    var winHeight = app.globalData.phoneInfo.windowHeight;
    this.setData({
      winHeight: winHeight,
      weatherData: weatherData
    })

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    this.mapCtx = wx.createMapContext('navi-map')
  },
  getCenterLocation: function() {
    this.mapCtx.getCenterLocation({
      success: function(res) {
        console.log(res.longitude)
        console.log(res.latitude)
      }
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    if (this.data.currentTab == 1) {

    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },
  /**
   * 选择交通方式
   */
  swichStrategy: function(e) {
    var strategy = e.currentTarget.dataset.strategy;
    console.log(strategy);
    this.setData({
      strategy: strategy
    })
    this.query(strategy);
  },
  search: function(e) {
    var strategy = this.data.strategy
    this.query(strategy)
  },
  query: function(strategy) {
    var params = {
      city: this.data.city,
      origin: this.data.origin,
      destination: this.data.destination,
    }
    console.log(params);
    var that = this;
    if (strategy == 0) { //公交
      amap.getTransitRoute(params, function(data) {
        var trafficInfo = amap.transitRouteDefaultResult(data, params.origin, params.destination);
        console.log(trafficInfo);
        that.setData({
          markers: trafficInfo.markers,
          polyline: trafficInfo.polyline
        })
      });
    } else if (strategy == 1) { //自驾
      amap.getDrivingRoute(params, function(data) {
        var trafficInfo = amap.drivingRoutDefaultResult(data, params.origin, params.destination);
        console.log(trafficInfo);
        that.setData({
          markers: trafficInfo.markers,
          polyline: trafficInfo.polyline
        })
      });
    } else if (strategy == 2) { //骑行
      amap.getRidingRout(params, function(data) {
        var trafficInfo = amap.ridingRoutDefaultResult(data, params.origin, params.destination);
        console.log(trafficInfo);
        that.setData({
          markers: trafficInfo.markers,
          polyline: trafficInfo.polyline
        })
      });
    } else if (strategy == 3) { //步行
      amap.getWalkingRoute(params, function(data) {
        var trafficInfo = amap.walkingRouteDefaultResult(data, params.origin, params.destination);
        console.log(trafficInfo);
        that.setData({
          markers: trafficInfo.markers,
          polyline: trafficInfo.polyline
        })
      });
    }
  },
  selectedStrategy: function(e) {
    var strategy = this.data.strategy;
    var origin = this.data.origin;
    var destination = this.data.destination;
    var city = this.data.city;
    var paramStr = 'st=' + strategy + "&origin=" + origin + "&destination=" + destination + "&city=" + city;
    if (e.currentTarget.dataset.strategytype != undefined) {
      paramStr = paramStr + '&stype=' + e.currentTarget.dataset.strategytype;
    }
    var url = '../traffic_detail/traffic_detail?' + paramStr
    console.log(url);
    wx.navigateTo({
      url: url
    })
  },

  bindfocus: function(e) {
    var lotType = e.currentTarget.dataset.lottype;
    var that = this;
    wx.chooseLocation({
      success: function(res) {
        console.log(res);
        var name = res.name;
        var address = res.address;
        var loaction = res.longitude + "," + res.latitude;
        var len = util.strlen(name);
        if (len > 8) {
          name = name.substring(0, 8) + "...";
        }
        if (lotType == 0) { //起点位置
          that.setData({
            origin: loaction,
            originName: name
          })
        } else if (lotType == 1) { //终点位置
          that.setData({
            destination: loaction,
            destinationName: name
          })
        }
      }
    })

  },
  swichTab: function(e) {
    var currentTab = e.currentTarget.dataset.currenttab;
    this.setData({
      currentTab: currentTab
    })
    if (currentTab == 1) {
      var that = this;
      wx.getLocation({
        type: 'gcj02',
        altitude: true,
        success: function(res) {
          console.log(res);
          that.setData({
            longitude: res.longitude,
            latitude: res.latitude,
            origin: res.longitude + "," + res.latitude,
            originName: '我的位置'
          })
          var params = {
            city: that.data.city,
            origin: that.data.origin,
            destination: that.data.destination,
          }
          amap.getTransitRoute(params, function(data) {
            var trafficInfo = amap.transitRouteDefaultResult(data, params.origin, params.destination);
            that.setData({
              markers: trafficInfo.markers,
              polyline: trafficInfo.polyline
            })
          });
          // amap.getRegeo(currLocation, function (data) {
          //   console.log(data);
          // })
        }
      })
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  save: function(e) {
    console.log(e)
  },
  trafficDetail: function(e) {
    var trafficType = e.currentTarget.dataset.traffictype;
    wx.navigateTo({
      url: '../traffic/traffic?type=' + trafficType,
    })
  },
  nearbyClick: function(e) {

  },
  routeClick: function(e) {
    console.log("routeClick...")
    wx.navigateTo({
      url: '../traffic/traffic',
    })
  },
  newRouteClick: function(e) {

  },
  startClick: function(e) {
    util.timer(this)
    if (!this.setTimeout) {
      this.setData({
        btnClass: 'work work-on',
        workStatus: "上班打卡"
      })
      this.getDateTimer();
    } else {
      this.clearTimeout()
    }
  },
  clickScale: function(e) {
    var scaleType = e.currentTarget.dataset.scaletype;
    var scale = e.currentTarget.dataset.scale; //5-20
    var newScale = scale + scaleType * 1; //增量1
    if (newScale < 5) {
      newScale = 5;
    }
    if (newScale > 20) {
      newScale = 20
    }
    this.setData({
      scale: newScale
    })
  },
  bindmarkertap: function(e) {
    console.log(e);
    console.log(this.data.trafficInfo);
    var marker = this.data.trafficInfo.markers[e.markerId];
    console.log(marker);
    var params = {
      location: marker.longitude + "," + marker.latitude
    }
    amap.getRegeo(params, function(data) {
      console.log(data);
    })
  },
  wakeUp: function(e) {
    var wareUpTime = this.data.wareUpTime;
    if (!wareUpTime) {
      wx.vibrateLong()
      var wakeUpTime = util.formatDate(new Date(), "h:m:s");
      this.setData({
        wakeUpTime: wakeUpTime
      })
    } else {
      wx.showToast({
        icon: 'success',
        duration: 2000,
        title: '你已经起床了啦~',
      })
    }
  },
  punchIn: function(e) {
    var punchInTime = this.data.punchInTime;
    if (!punchInTime) {
      wx.vibrateLong();
      var punchInTime = util.formatDate(new Date(), "h:m:s");
      this.setData({
        punchInTime: punchInTime
      })
    } else {
      wx.showToast({
        icon: 'success',
        duration: 2000,
        title: '你已经打卡啦~',
      })
    }
  }
})