export default defineAppConfig({
  pages: [
    'pages/task-hall/index',
    'pages/schedule/index',
    'pages/records/index',
    'pages/supplies/index',
    'pages/profile/index',
    'pages/task-detail/index',
    'pages/record-detail/index',
    'pages/task-publish/index',
    'pages/volunteer-review/index',
    'pages/statistics/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#FF7A45',
    navigationBarTitleText: '社区志愿通',
    navigationBarTextStyle: 'white',
    backgroundColor: '#FFF7F2'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#FF7A45',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/task-hall/index',
        text: '任务大厅'
      },
      {
        pagePath: 'pages/schedule/index',
        text: '我的排班'
      },
      {
        pagePath: 'pages/records/index',
        text: '探访记录'
      },
      {
        pagePath: 'pages/supplies/index',
        text: '物资领取'
      },
      {
        pagePath: 'pages/profile/index',
        text: '个人中心'
      }
    ]
  }
})
