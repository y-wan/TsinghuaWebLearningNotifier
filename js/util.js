generateMessage = function(message, number, type) {
  if (number <= 0) return message;
  if (message !== "") message += "，";
  return message + number.toString() + "个新" + type;
};

getCourseId = function(url) {
  if (url.indexOf('course_id') > -1) return url.split('=').slice(-1)[0];
  else return url.split('/').slice(-1)[0];
};

onCoursePage = function () {
  if (xhr.readyState == XMLHttpRequest.DONE) {
    // parse web learning home page
    parser = new DOMParser();
    htmlDoc = parser.parseFromString(xhr.responseText, "text/html");
    let courseTable = htmlDoc.getElementById("info_1");
    if (courseTable === null) return;
    let courseList = Array.from(courseTable.firstElementChild.children).slice(2);
    let courseInfoList = {};
    courseList.forEach(item => {
      let url = item.children[0].children[1].href;
      let courseUrl = url.indexOf('/MultiLanguage') > -1 ? "http://learn.tsinghua.edu.cn" + url.slice(url.indexOf('/MultiLanguage')) : url;
      let courseName = item.children[0].children[1].text.split("(")[0].trim();
      let numHomework = parseInt(item.children[1].children[0].textContent);
      let numNotice = parseInt(item.children[2].children[0].textContent);
      let numFile = parseInt(item.children[3].children[0].textContent);
      courseInfoList[courseName] = { courseUrl, numHomework, numNotice, numFile };
    });
    // deal with new info
    for (let courseName in courseInfoList) {
      let courseInfoOld = JSON.parse(localStorage.getItem(courseName));
      let courseInfo = courseInfoList[courseName];
      localStorage.setItem(courseName, JSON.stringify(courseInfo));
      let message = "";
      if (courseInfoOld !== null) {
        let newHomework = courseInfo.numHomework - courseInfoOld.numHomework;
        let newNotice = courseInfo.numNotice - courseInfoOld.numNotice;
        let newFile = courseInfo.numFile - courseInfoOld.numFile;
        message = generateMessage(message, newHomework, "作业");
        message = generateMessage(message, newNotice, "公告");
        message = generateMessage(message, newFile, "文件");
      } else {
        let newNotice = courseInfo.numNotice;
        let newFile = courseInfo.numFile;
        message = generateMessage(message, newNotice, "公告");
        message = generateMessage(message, newFile, "文件");
      }
      if (message !== "") {
        browser.notifications.create(getCourseId(courseInfo.courseUrl), {
          type: "basic",
          iconUrl: "favicon.png",
          title: courseName,
          message: message,
          contextMessage: "点击进入课程页面",
          requireInteraction: false
        });
      }
    }
  }
};