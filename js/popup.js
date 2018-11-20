getLoginPopup = function() {
  document.getElementById('login-panel').style.display = "none";
  document.getElementById('logout-panel').style.display = "block";
  document.getElementById('username-online').innerText = localStorage.getItem('username');
  let xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState == XMLHttpRequest.DONE) {
      let courseInfoList = parseCoursePage(xhr.responseText);
      let prevPanel = document.getElementById("info-panel");
      if (prevPanel !== null) {
        prevPanel.parentNode.removeChild(prevPanel);
      }
      let infoPanel = document.createElement("div");
      infoPanel.id = "info-panel";
      infoPanel.classList.add("box");
      for (let [courseName, courseInfo] of Object.entries(courseInfoList)) {
        let [message, url] = updateSingleCourse(courseName, courseInfo);
        if (message === "") continue;
        let courseNode = document.createElement("article");
        courseNode.classList.add("media");
        let hyperlink = document.createElement("a");
        hyperlink.href = url;
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
      document.getElementById("logout-panel").insertBefore(infoPanel, document.getElementById("username-online").nextSibling);
    }
  }
  xhr.open('GET', 'http://learn.tsinghua.edu.cn/MultiLanguage/lesson/student/MyCourse.jsp', true);
  xhr.send();
};

login = function() {
  let username = document.getElementById('username').value;
  let password = document.getElementById('password').value;
  let xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState == XMLHttpRequest.DONE) {
      // login failure
      if (xhr.responseText.indexOf('alert') > -1) {
        window.alert('用户名或密码错误');
        setBadge(online=false);
        return;
      }
      // login success
      setBadge(online=true);
      localStorage.setItem('username', username);
      localStorage.setItem('password', password);
      getLoginPopup();
    }
  }
  xhr.open('POST', 'https://learn.tsinghua.edu.cn/MultiLanguage/lesson/teacher/loginteacher.jsp', true);
  xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhr.send("userid=" + encodeURIComponent(username) + "&userpass=" + encodeURIComponent(password) + "&submit1=%E7%99%BB%E5%BD%95");
}

// login
document.getElementById('login').onclick = () => {
  let username = document.getElementById('username').value;
  let password = document.getElementById('password').value;
  if (username.trim() === "" || password === "") return;
  login();
};

// logout
document.getElementById('logout').onclick = () => {
  let username = localStorage.username;
  localStorage.clear();
  document.getElementById('username').value = "";
  document.getElementById('password').value = "";
  document.getElementById('username-online').innerText = "";
  document.getElementById('login-panel').style.display = "block";
  document.getElementById('logout-panel').style.display = "none";
  setBadge(online=false);
};

if (localStorage.getItem('username') !== null) {
  document.getElementById('username').value = localStorage.getItem('username');
  document.getElementById('password').value = localStorage.getItem('password');
  login();
}