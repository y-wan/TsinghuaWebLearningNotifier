if (localStorage.getItem('username') !== null) {
  document.getElementById('login-panel').style.display = "none";
  document.getElementById('logout-panel').style.display = "block";
  document.getElementById('username-online').innerText = localStorage.getItem('username');
}

// login
document.getElementById('login').onclick = () => {
  let username = document.getElementById('username').value;
  let password = document.getElementById('password').value;
  if (username.trim() === "" || password === "") return;
  let xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
      if (xhr.readyState == XMLHttpRequest.DONE) {
        // login failure
        if (xhr.responseText.indexOf('alert') > -1) {
            window.alert('用户名或密码错误');
            return;
        }
        // login success
        localStorage.setItem('username', document.getElementById('username').value);
        localStorage.setItem('password', document.getElementById('password').value);
        window.alert('用户' + localStorage.username + '登陆成功');
        document.getElementById('login-panel').style.display = "none";
        document.getElementById('logout-panel').style.display = "block";
        document.getElementById('username-online').innerText = localStorage.username;
        xhr.onreadystatechange = onCoursePage;
        xhr.open('GET', 'http://learn.tsinghua.edu.cn/MultiLanguage/lesson/student/MyCourse.jsp', true);
        xhr.send();
        
      }
  }
  xhr.open('POST', 'https://learn.tsinghua.edu.cn/MultiLanguage/lesson/teacher/loginteacher.jsp', true);
  xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhr.send("userid=" + encodeURIComponent(username) + "&userpass=" + encodeURIComponent(password) + "&submit1=%E7%99%BB%E5%BD%95");
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
  window.alert('用户' + username + '注销成功');
};