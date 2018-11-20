// login
document.getElementById('login').onclick = () => {
  let username = document.getElementById('username').value;
  let password = document.getElementById('password').value;
  if (username.trim() === "" || password === "") return;
  login(username, password, popup=true);
};

// logout
document.getElementById('logout').onclick = () => {
  logout(popup=true);
};

// initialize popup page
if (localStorage.getItem('username') !== null) {
  let username = localStorage.getItem('username');
  let password = localStorage.getItem('password');
  document.getElementById('username').value = username;
  document.getElementById('password').value = password;
  login(username, password, popup=true);
}