browser.notifications.onClicked.addListener(function (notificationid) {
  if (notificationid.indexOf('-') <= -1) browser.tabs.create({ url: "http://learn.tsinghua.edu.cn/MultiLanguage/lesson/student/course_locate.jsp?course_id=" + notificationid });
  else browser.tabs.create({ url: "http://learn.cic.tsinghua.edu.cn/f/student/coursehome/" + notificationid });
});

getCourseInfo = function() {  
  let xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState == XMLHttpRequest.DONE) {
      let courseInfoList = parseCoursePage(xhr.responseText);
      for (let [courseName, courseInfo] of Object.entries(courseInfoList)) {
        updateSingleCourse(courseName, courseInfo);
      }
    }
  }
  xhr.open('GET', 'http://learn.tsinghua.edu.cn/MultiLanguage/lesson/student/MyCourse.jsp', true);
  xhr.send();
};

refresh = function() {
  if (localStorage.getItem('username') === null) return;
  let xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState == XMLHttpRequest.DONE) {
      // clear stored info and return if login fails
      if (xhr.responseText.indexOf('alert') > -1) {
        localStorage.clear();
        setBadge(online=false);
        return;
      }
      setBadge(online=true);
      getCourseInfo();
    }
  }
  xhr.open('POST', 'https://learn.tsinghua.edu.cn/MultiLanguage/lesson/teacher/loginteacher.jsp', true);
  xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhr.send("userid=" + encodeURIComponent(localStorage.getItem('username')) + "&userpass=" + encodeURIComponent(localStorage.getItem('password')) + "&submit1=%E7%99%BB%E5%BD%95");
};

const INTERVAL = 30 * 60 * 1000; // 30 minutes

setInterval(refresh, INTERVAL);

if (localStorage.getItem('username') !== null) {
  refresh();
} else {
  setBadge(online=false);
}