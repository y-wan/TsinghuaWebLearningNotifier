if (navigator.vendor === "Google Inc.") browser = chrome;

let colorOnline = '#00C853';
let badgeTextOnline = '√';
let titleOnline = '在线';
let colorOffline = '#DD2C00';
let badgeTextOffline = 'X';
let titleOffline = '离线';

setBadge = function(online=true) {
  if (online) {
    browser.browserAction.setBadgeBackgroundColor({color: colorOnline});
    browser.browserAction.setBadgeText({text: badgeTextOnline});
    browser.browserAction.setTitle({title: titleOnline});
  } else {
    browser.browserAction.setBadgeBackgroundColor({color: colorOffline});
    browser.browserAction.setBadgeText({text: badgeTextOffline});
    browser.browserAction.setTitle({title: titleOffline});
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
  let courseInfoList = {};
  let parser = new DOMParser();
  let htmlDoc = parser.parseFromString(page, "text/html");
  // renew web learning 2015 session
  let renewUrl = htmlDoc.getElementsByTagName("iframe")[0].getAttribute('src');
  let xhr = new XMLHttpRequest();
  xhr.open('GET', renewUrl, true);
  xhr.send();
  // retrieve course info list
  let courseTable = htmlDoc.getElementById("info_1");
  if (courseTable === null) return;
  let courseList = Array.from(courseTable.firstElementChild.children).slice(2);
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

getPopupMessage = function(courseInfo) {
  let message = "";
  message = generateMessage(message, courseInfo.numHomework, "未交作业");
  message = generateMessage(message, courseInfo.numNotice, "未读公告");
  message = generateMessage(message, courseInfo.numFile, "未读文件");
  return message;
}

updateSingleCourse = function(courseName, courseInfo) {
  let courseInfoOld = JSON.parse(localStorage.getItem(courseName));
  localStorage.setItem(courseName, JSON.stringify(courseInfo));
  let message = "";
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
      iconUrl: "",
      title: courseName,
      message: message,
      contextMessage: "点击进入课程页面",
      requireInteraction: false
    });
  }
}

createInfoPanel = function(courseInfoList) {
  let infoPanel = document.createElement("div");
  infoPanel.id = "info-panel";
  infoPanel.classList.add("box");
  for (let [courseName, courseInfo] of Object.entries(courseInfoList)) {
    let message = getPopupMessage(courseInfo);
    if (message === "") continue;
    let courseNode = document.createElement("article");
    courseNode.classList.add("media");
    let hyperlink = document.createElement("a");
    hyperlink.href = courseInfo.courseUrl;
    let content = document.createElement("div");
    content.classList.add("content");
    let titleNode = document.createElement("strong");
    titleNode.appendChild(document.createTextNode(courseName));
    content.appendChild(titleNode);
    let messageNode = document.createElement("p");
    let smallNode = document.createElement("small");
    smallNode.appendChild(document.createTextNode(message));
    messageNode.appendChild(smallNode);
    content.appendChild(messageNode);
    hyperlink.appendChild(content);
    courseNode.appendChild(hyperlink);
    infoPanel.appendChild(courseNode);
  }
  return infoPanel;
}

toggleSpin = function(spin=true) {
  if (spin) {
    document.getElementById('login').classList.add('is-loading');
    document.getElementById('user-icon').classList.add('fa-sync', 'fa-spin');
    document.getElementById('user-icon').classList.remove('fa-user');
  } else {
    document.getElementById('login').classList.remove('is-loading');
    document.getElementById('user-icon').classList.remove('fa-sync', 'fa-spin');
    document.getElementById('user-icon').classList.add('fa-user');
  }
}

getCourseInfo = function(popup=false) {
  let xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState == XMLHttpRequest.DONE) {
      if (popup) toggleSpin(false);
      let courseInfoList = parseCoursePage(xhr.responseText);
      for (let [courseName, courseInfo] of Object.entries(courseInfoList)) {
        updateSingleCourse(courseName, courseInfo);
      }
      if (popup) {
        document.getElementById('login-panel').style.display = "none";
        document.getElementById('logout-panel').style.display = "block";
        document.getElementById('username-online').innerText = localStorage.getItem('username');
        let infoPanelOld = document.getElementById("info-panel");
        if (infoPanelOld !== null) {
          infoPanelOld.parentNode.removeChild(infoPanelOld);
        }
        let infoPanel = createInfoPanel(courseInfoList);
        localStorage.setItem('infoPanelInnerHtml', infoPanel.innerHTML);
        document.getElementById("logout-panel").insertBefore(infoPanel, document.getElementById("username-online").nextSibling);
      }
    }
  }
  xhr.open('GET', 'http://learn.tsinghua.edu.cn/MultiLanguage/lesson/student/MyCourse.jsp', true);
  xhr.send();
};

login = function(username, password, popup=false) {
  if (popup) {
    toggleSpin(true);
    // preload old course info for online user
    if (localStorage.getItem('username') === username) {
      document.getElementById('login-panel').style.display = "none";
      document.getElementById('logout-panel').style.display = "block";
      document.getElementById('username-online').innerText = localStorage.getItem('username');
      let infoPanelOld = document.getElementById("info-panel");
      if (infoPanelOld === null && localStorage.getItem('infoPanelInnerHtml') !== null) {
        let infoPanelOld = document.createElement("div");
        infoPanelOld.id = "info-panel";
        infoPanelOld.classList.add("box");
        infoPanelOld.innerHTML = localStorage.getItem('infoPanelInnerHtml');
        document.getElementById("logout-panel").insertBefore(infoPanelOld, document.getElementById("username-online").nextSibling);
      }
    }
  }
  // get new course info
  let xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState == XMLHttpRequest.DONE) {
      // login failure
      if (xhr.responseText.indexOf('alert') > -1) {
        if (popup) toggleSpin(false);
        window.alert('用户名或密码错误');
        logout(popup);
        return;
      }
      // login success
      setBadge(online=true);
      localStorage.setItem('username', username);
      localStorage.setItem('password', password);
      getCourseInfo(popup);
    }
  }
  xhr.open('POST', 'https://learn.tsinghua.edu.cn/MultiLanguage/lesson/teacher/loginteacher.jsp', true);
  xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhr.send("userid=" + encodeURIComponent(username) + "&userpass=" + encodeURIComponent(password) + "&submit1=%E7%99%BB%E5%BD%95");
};

logout = function(popup=false) {
  localStorage.clear();
  if (popup) {
    document.getElementById('username').value = "";
    document.getElementById('password').value = "";
    document.getElementById('username-online').innerText = "";
    document.getElementById('login-panel').style.display = "block";
    document.getElementById('logout-panel').style.display = "none";
  }
  setBadge(online=false);
};