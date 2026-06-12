export default defineAppConfig({
  pages: [
    'pages/jobs/index',
    'pages/progress/index',
    'pages/messages/index',
    'pages/store/index',
    'pages/resume/index',
    'pages/job-detail/index',
    'pages/chat-detail/index',
    'pages/edit-resume/index',
    'pages/publish-job/index',
    'pages/candidate-detail/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#FFFFFF',
    navigationBarTitleText: '快招',
    navigationBarTextStyle: 'black',
    backgroundColor: '#F7F8FA',
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#FF6B35',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/jobs/index',
        text: '找工作',
      },
      {
        pagePath: 'pages/progress/index',
        text: '进度',
      },
      {
        pagePath: 'pages/messages/index',
        text: '消息',
      },
      {
        pagePath: 'pages/store/index',
        text: '门店',
      },
      {
        pagePath: 'pages/resume/index',
        text: '我的',
      },
    ],
  },
});
