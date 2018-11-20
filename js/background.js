browser.notifications.onClicked.addListener(function (notificationid) {
  if (notificationid.indexOf('-') <= -1) browser.tabs.create({ url: "http://learn.tsinghua.edu.cn/MultiLanguage/lesson/student/course_locate.jsp?course_id=" + notificationid });
  else browser.tabs.create({ url: "http://learn.cic.tsinghua.edu.cn/f/student/coursehome/" + notificationid });
});

refresh = function() {
  if (localStorage.getItem('username') === null) return;
  let username = localStorage.getItem('username');
  let password = localStorage.getItem('password');
  login(username, password, popup=false);
}

const INTERVAL = 30 * 60 * 1000; // 30 minutes

// initial refresh
if (localStorage.getItem('username') !== null) {
  refresh();
} else {
  setBadge(online=false);
}

// refresh loop
setInterval(refresh, INTERVAL);