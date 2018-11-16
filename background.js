browser.notifications.onClicked.addListener(function(notificationid) {
    if (notificationid.indexOf('-') <= -1) browser.tabs.create({ url: "http://learn.tsinghua.edu.cn/MultiLanguage/lesson/student/course_locate.jsp?course_id=" + notificationid });
    else browser.tabs.create({ url: "http://learn.cic.tsinghua.edu.cn/f/student/coursehome/" + notificationid });
});

browser.browserAction.onClicked.addListener(function() {
    browser.tabs.create({ url: "http://learn.tsinghua.edu.cn/" });
});

function refresh() {
    var xhr = new XMLHttpRequest();
    generateMessage = function(message, number, type) {
        if (number <= 0) return message;
        if (message !== "") message += "，";
        return message + number.toString() + "个新" + type;
    };
    getCourseId = function(url) {
        if (url.indexOf('course_id') > -1) return url.split('=').slice(-1)[0];
        else return url.split('/').slice(-1)[0];
    };
    xhr.onreadystatechange = function() {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            parser = new DOMParser();
            htmlDoc = parser.parseFromString(xhr.responseText, "text/html");
            let courseList = Array.from(htmlDoc.getElementById("info_1").firstElementChild.children).slice(2);
            let message = {};
            courseList.forEach(item => {
                let url = item.children[0].children[1].href;
                let courseUrl = url.indexOf('/MultiLanguage') > -1 ? "http://learn.tsinghua.edu.cn" + url.slice(url.indexOf('/MultiLanguage')) : url;
                let courseName = item.children[0].children[1].text.split("(")[0].trim();
                let numHomework = parseInt(item.children[1].children[0].textContent);
                let numNotice = parseInt(item.children[2].children[0].textContent);
                let numFile = parseInt(item.children[3].children[0].textContent);
                message[courseName] = { courseUrl, numHomework, numNotice, numFile };
            });
            // deal with new info
            for (let courseName in message) {
                let courseInfoOld = JSON.parse(localStorage.getItem(courseName));
                let courseInfo = message[courseName];
                localStorage.setItem(courseName, JSON.stringify(courseInfo));
                if (courseInfoOld !== null) {
                    let newHomework = courseInfo.numHomework - courseInfoOld.numHomework;
                    let newNotice = courseInfo.numNotice - courseInfoOld.numNotice;
                    let newFile = courseInfo.numFile - courseInfoOld.numFile;
                    let message = "";
                    message = generateMessage(message, newHomework, "作业");
                    message = generateMessage(message, newNotice, "公告");
                    message = generateMessage(message, newFile, "文件");
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
        }
    }
    xhr.open('POST', 'https://learn.tsinghua.edu.cn/MultiLanguage/lesson/teacher/loginteacher.jsp', true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.send("userid=" + localStorage.username + "&userpass=" + localStorage.password + "&submit1=%E7%99%BB%E5%BD%95");
    xhr.open('GET', 'http://learn.tsinghua.edu.cn/MultiLanguage/lesson/student/MyCourse.jsp', true);
    xhr.send();
}

const INTERVAL = 30 * 60 * 1000; // 30 minutes

setInterval(refresh, INTERVAL);
