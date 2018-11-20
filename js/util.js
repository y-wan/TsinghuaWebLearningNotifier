let colorOnline = '#00C853';
let textOnline = '√';
let colorOffline = '#DD2C00';
let textOffline = 'X';

setBadge = function(online=true) {
  if (online) {
    browser.browserAction.setBadgeBackgroundColor({color: colorOnline});
    browser.browserAction.setBadgeText({text: textOnline});
  } else {
    browser.browserAction.setBadgeBackgroundColor({color: colorOffline});
    browser.browserAction.setBadgeText({text: textOffline});
  }
}

generateMessage = function(message, number, type, sep='，') {
  if (number <= 0) return message;
  if (message !== "") message += sep;
  return message + number.toString() + "个" + type;
};

getCourseId = function(url) {
  if (url.indexOf('course_id') > -1) return url.split('=').slice(-1)[0];
  else return url.split('/').slice(-1)[0];
};

parseCoursePage = function(page) {
  parser = new DOMParser();
  htmlDoc = parser.parseFromString(page, "text/html");
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
  return courseInfoList;
}

updateSingleCourse = function(courseName, courseInfo) {
  let courseInfoOld = JSON.parse(localStorage.getItem(courseName));
  localStorage.setItem(courseName, JSON.stringify(courseInfo));
  let messagePopup = "";
  let message = "";
  messagePopup = generateMessage(messagePopup, courseInfo.numHomework, "未交作业", sep='<br/>');
  messagePopup = generateMessage(messagePopup, courseInfo.numNotice, "未读公告", sep='<br/>');
  messagePopup = generateMessage(messagePopup, courseInfo.numFile, "未读文件", sep='<br/>');
  if (courseInfoOld !== null) {
    let newHomework = courseInfo.numHomework - courseInfoOld.numHomework;
    let newNotice = courseInfo.numNotice - courseInfoOld.numNotice;
    let newFile = courseInfo.numFile - courseInfoOld.numFile;
    message = generateMessage(message, newHomework, "新作业");
    message = generateMessage(message, newNotice, "新公告");
    message = generateMessage(message, newFile, "新文件");
  } else {
    let newNotice = courseInfo.numNotice;
    let newFile = courseInfo.numFile;
    message = generateMessage(message, newNotice, "新公告");
    message = generateMessage(message, newFile, "新文件");
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
  return [messagePopup, courseInfo.courseUrl];
}