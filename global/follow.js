// Récupères les bouttons des utilisateurs.
async function getUsersCell() {
    let btns = document.querySelectorAll("[data-testid]");
    
    usersCell = Array.from(btns).filter(btn => {
        return btn.getAttribute('data-testid').includes('UserCell');
    });
    return;
}

// Récupères les infos (follow et followers) d'un utilisateur donnée (en utilisant 'usersCell').
async function getInfosAndFollow() {
    await sleep(getRandom(1, 3));

    let spans = document.querySelectorAll("span");
    let btns = document.querySelectorAll("[data-testid]");
    let followBtns = [];
    let usernames = [];
    let allInfos = [];

    usernames = Array.from(spans).filter(span => {
        return span.innerText[0] == '@' && span.innerText != myName;
    });

    allInfos = Array.from(spans).filter(span => {
        return !isNaN(parseInt(span.innerText, 10));
    });
    
    followBtns = Array.from(btns).filter(btn => {
        return btn.getAttribute('data-testid').includes('follow');
    });

    if (!followBtns[0] || !followBtns[0].getAttribute('data-testid') || followBtns[0].getAttribute('data-testid').includes('unfollow')) {
        return 0;
    }

    usersInfo.push([allInfos[0].innerText, allInfos[2].innerText, usernames[0].innerText]);
    await sleep(getRandom(2, 4));
    followBtns[0].click();
    sessionFollow--;
    setCookie('followed', parseInt(getCookie('followed'), 10) + 1, getCookie("expireFollow"));
    await sleep(getRandom(2, 4));
    return 1;
}

// Récupères les bouttons où la valeur de data-testid vaut 'value'.
async function getSpecificBtn(tempWindow, doc, value) {
    let btns = undefined;
    let specificBtns = undefined;

    for (let tries = 0; (specificBtns === undefined || specificBtns.length == 0) && tries < 3; tries++) {
        console.log('tries[2]: ', tries);

        if (tries != 0) {
            tempWindow.scrollTo({
                top: tempWindow.scrollY+getRandom(300, 500),
                behavior: 'smooth',
            });
        }
        btns = doc.querySelectorAll("[data-testid]");
        specificBtns = Array.from(btns).filter(btn => {
            return btn.getAttribute('data-testid') == value;
        });
        await sleep(getRandom(1, 3));
    }
    return (specificBtns);
}

// Like et retweet 'likeAndRetweetCount' postes sur le compte Twitter de l'utilisateur avec le plus de followers.
async function likeAndRetweetMostFollowers(index) {
    usersCell[index].click();
    await sleep(2, 4);

    for (let i = 0; i < likeAndRetweetCount; i++) {
        let likeBtns = await getSpecificBtn(window, document, 'like');
        let retweetBtns = await getSpecificBtn(window, document, 'retweet');

        if (likeBtns === undefined || likeBtns.length == 0) {
            break;
        }
        if (retweetBtns === undefined || retweetBtns.length == 0) {
            break;
        }
        likeBtns[0].click();
        await sleep(1, 2);
        retweetBtns[0].click();
        await sleep(1, 4);
        let confirmBtns = await getSpecificBtn(window, document, 'tweetButton');
        if (confirmBtns === undefined || confirmBtns.length == 0) {
            break;
        }
        confirmBtns[0].click();
        await sleep(getRandom(1, 4));
    }
    window.history.back();
    return;
}

// Like et retweet un post sur le compte Twitter 'link'.
async function likeAndRetweetUs() {
    let tempWindow = window.open(link, 'likeAndRetweet');
    
    await sleep(2, 3);
    window.focus();

    // Récupère les bouttons like et retweet.
    let likeBtns = await getSpecificBtn(tempWindow, tempWindow.document, 'like');
    let retweetBtns = await getSpecificBtn(tempWindow, tempWindow.document, 'retweet');

    if (likeBtns === undefined || likeBtns.length == 0) {
        tempWindow.close();
        return false;
    }
    if (retweetBtns === undefined || retweetBtns.length == 0) {
        tempWindow.close();
        return false;
    }
    likeBtns[0].click();
    await sleep(1, 2);

    retweetBtns[0].click();
    await sleep(1, 4);

    // Récupère le boutton de confirmation du retweet.
    let confirmBtns = await getSpecificBtn(tempWindow, tempWindow.document, 'tweetButton');
    if (confirmBtns === undefined || confirmBtns.length == 0) {
        tempWindow.close();
        return false;
    }
    confirmBtns[0].click();
    await sleep(getRandom(1, 4));

    tempWindow.close();
    return true;
}

// Follow les comptes utilisateur sur la page actuelle.
async function follow() {

    if (forceStop == true){
        return;
    }

    let followed = 0;
    maxFollow = sessionFollow;

    document.getElementById('statusCircle').style.backgroundColor = processingColor;
    document.getElementById('statusText').innerText = processingText + followed + '/' + maxFollow;

    await getUsersCell();
    if (!usersCell.length) {
        isScrollOver = true;
        if (limit < 0) {
            return;
        }
        for (let tries = 0; tries < 10; tries++) {
            console.log('tries[3]: ', tries);
            window.scrollTo({
                top: window.scrollY + getRandom(50, 100),
                behavior: 'smooth',
            });
            await sleep(getRandom(2, 7));
            usersCell = [];
            await getUsersCell();
            // Si on ne trouve pas de bouttons follow sur la page actuelle, la routine se termine.
            if (!followBtns || followBtns.length) {
                isScrollOver = true;
                break;
            }
        }
    }

    if (usersCell.length) {
        for (; lastFollow < usersCell.length && !forceStop; lastFollow++){

            let element = usersCell[lastFollow].querySelectorAll("[role='button']")[0];

            if (forceStop) {
                maxFollow = followed;
                isScrollOver = true;
                return;
            }

            if (element.getAttribute('data-testid').includes('follow') && !element.getAttribute('data-testid').includes('unfollow')) {
                usersCell[lastFollow].click();
                if (await getInfosAndFollow() == 1)
                followed++;
                if (!forceStop){
                    document.getElementById('statusCircle').style.backgroundColor = processingColor;
                    document.getElementById('statusText').innerText = processingText + followed + '/' + maxFollow;
                }
                await sleep(1, 2);
                let ahref = document.querySelectorAll('a[href]');
                let supportLinkCount = 0;
    
                for (let i = 0; i < ahref.length; i++) {
                    let currentAhrefLink = ahref[i].getAttribute('href');

                    if (currentAhrefLink.includes("support.twitter.com") && !currentAhrefLink.includes(protectedAccountLearnMore)) {
                        supportLinkCount++;
                    }
                    if(supportLinkCount == 2) {
                        console.log('Action restricted by Twitter.');
                        isScrollOver = true;
                        return;
                    }
                }
                await sleep(1, 2);
                window.history.back();
                await sleep(2, 4);
                usersCell = [];
                await getUsersCell();
                // La routine se termine après 'limit' retweet.
                if (getCookie('followed') >= limit) {
                    isScrollOver = true;
                    return;
                }
                // Tout les 'followBeforeSleep', la routine se met en pause pendant 'sleepTime'.
                if (sessionFollow <= 0) {
                    return;
                }
                // Tout les 'followBeforeLike', on appele 'likeAndRetweetUs'.
                if (window.checkLikeUs !== undefined) {
                    await checkLikeUs();
                }
                if (lastFollow >= 27) {
                    lastFollow -= Math.floor(getRandom(2, 4));
                }
            }
            await sleep(getRandom(2, 5));
            window.scrollTo({
                top: usersCell[lastFollow].getBoundingClientRect().top + (window.scrollY - getRandom(10, 30)),
                behavior: 'smooth',
            });
        }
    }
    usersCell = [];
}

// Détermine l'utilisateur avec le plus de followers sur les 'followBeforeSleep' derniers follows.
function getMostFollowers() {
    let mostFollowers = -1;
    let indexMostFollowers = 0;

    for (let i = 0; i < usersInfo.length; i++) {
        if (usersInfo[i][1] && parseInt(usersInfo[i][1].replace(/,/i, ''), 10) > mostFollowers) {
            mostFollowers = parseInt(usersInfo[i][1].replace(/,/i, ''), 10);
            indexMostFollowers = i;
        }
    }
    return indexMostFollowers;
}

// Fonction principale qui lance le reste.
async function main() {
    let statusParent = document.querySelector('header[role="banner"]');
    statusParent.innerHTML += statusPopup;

    document.querySelector('div[data-at-shortcutkeys]').style += ';pointer-events: none;';

    while(!isScrollOver && !forceStop){

        await follow();

        if (sessionFollow <= 0 || forceStop) {

            let indexMostFollowers = getMostFollowers();
            let date = 'Twitter' + getFormattedDate(getCookie("expire"));
            let prevUsersInfo = (localStorage.getItem(date)) ? localStorage.getItem(date).split(',') : [];
            
            for (let i = 0; i < usersInfo.length; i++) {
                prevUsersInfo.push(usersInfo[i][2]);
            }
            localStorage.removeItem(date);
            localStorage.setItem(date, prevUsersInfo);

            // Remove data collect
            // doRequest('POST', '/actions/ajaxSaveAction', {user_id: userId, action: 'follow', service : 'twitter', count: maxFollow}, () => {
            //     var data = JSON.parse(request.responseText);
            //     console.log(data);
            // });

            if (forceStop == true){
                return;
            }

            stopMethod = stopNotRunning;

            if (likeAndRetweetCount != 0) {
                await likeAndRetweetMostFollowers(indexMostFollowers);
                await sleep(getRandom(1, 2));
                if (!document.getElementById('statusCircle')) {
                    statusParent = document.querySelector('header[role="banner"]');
                    statusParent.innerHTML += statusPopup;
                }
            }
            usersInfo = [];
            usersCell = [];
            if (!isScrollOver) {
                console.log('Sleep...');
                document.getElementById('statusCircle').style.backgroundColor = sleepColor;
                sleepTime = Math.ceil(getRandom(sleepTimeMin, sleepTimeMax));
                while (sleepTime > 0) {
                    if (sleepTime < 60) {
                        document.getElementById('statusText').innerText = sleepText + sleepTime + 's';
                    } else {
                        document.getElementById('statusText').innerText = sleepText + Math.ceil(secToMin(sleepTime)) + 'min';
                    }
                    await sleep(1);
                    sleepTime--;
                }
            }
            // Randomise le nombre de follow a effectuer durant la session.
            sessionFollow = Math.round(getRandom(followBeforeSleepMin, followBeforeSleepMax));
        }

        stopMethod = stopNotRunning;
    }

    console.log('Process finished; Total followed: ' + getCookie('followed'));
    document.getElementById('statusCircle').style.backgroundColor = finishColor;
    document.getElementById('statusText').innerText = finishText;
    await sleep(1, 2);
    location.reload();
}

function doAsync() {
    if (!getCookie('followed')) {
        setFollowCookie(1);
    }

    console.log('Followed today : ', getCookie('followed'));
    if (getCookie('followed') < limit && sessionFollow > 0) {
        main();
    }
}

function getFormattedDate(date) {
    let monthArray = ['Jan', 'Feb', 'Mar', 'Apr', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let splitedDate = date.split(/ /g);
    let month = (monthArray.indexOf(splitedDate[2]) + 1 >= 10) ? monthArray.indexOf(splitedDate[2]) + 1 : '0' + monthArray.indexOf(splitedDate[2]) + 1;

    return month + '/' + splitedDate[1] + '/' + splitedDate[3];
}

function getCookie(cname)  {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');

    for (var i = 0; i <ca.length; i++) {
        var c = ca[i];

        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function setCookie(cname, cvalue, date)  {
    var expires = "expires="+ date;

    document.cookie = cname + "=" + cvalue + ";" + expires + ";domain=twitter.com;path=/";
}

function setFollowCookie(exdays) {
    var date = new Date();

    date.setTime(date.getTime() + (exdays*24*60*60*1000));
    if (getCookie("expireFollow") == "") {
        setCookie("expireFollow", date.toUTCString(), date.toUTCString());
    }
    setCookie("followed", 0, date.toUTCString());
}

function doRequest(method, URI, data, callback) {
    var formData = new FormData();

    request.open(method, baseUrl + URI);
    request.onload = callback;

    if (data != null) {
        for (let key in data) {
            formData.append(key, data[key]);
        }
        request.send(formData);
        return;
    }
    request.send();
}

function stopRunning() {
    if (document.getElementById('statusCircle').length != 0) {
        document.getElementById('statusCircle').style.backgroundColor = stoppingColor;
        document.getElementById('statusText').innerText = stoppingText;
    }
    forceStop = true;
}

function stopNotRunning() {
    if (document.getElementById('statusCircle').length != 0) {
        document.getElementById('statusCircle').style.backgroundColor = stoppingColor;
        document.getElementById('statusText').innerText = stoppingText;
    }
    location.reload();
}

if (once_global === undefined) {
    var once_global = true;

	var request = new XMLHttpRequest();
	var baseUrl = "https://extension-connect.isoluce.net";
    var link = "https://twitter.com/GHFR_by_ETGR";
    var errorURI = 'support.twitter.com';
    var protectedAccountLearnMore = "articles/14016";
    var followBeforeLike = 50;
    var userId = 0;

    var minToSec = (min) => (min * 60);
    var secToMin = (sec) => (sec / 60);
    var getRandom = (min, max) => (Math.random() * (max - min) + min);
    var sleep = (seconds) => new Promise(_ => setTimeout(_, seconds * 1000));
    
    // GOT FROM CHROME LOCAL STORAGE
    var maxFollow;
    var limit;
    var followBeforeSleepMin;
    var followBeforeSleepMax;
    var sleepTimeMin;
    var sleepTimeMax;
    var likeAndRetweetCount;
    var myName = "";

	var forceStop = false;
	var stopMethod = stopNotRunning;
    var isScrollOver = false;
    var usersCell = [];
    var usersInfo = [];
    var sessionFollow = 0;
    var lastFollow = 0;

    var processingText = "Follow : ";
    var processingColor = "orange";

    var sleepText = "Sleep : ";
    var sleepColor = "red";

    var stoppingText = "Stopping...";
    var stoppingColor = "red";

    var stoppingText = "Stopping...";
    var stoppingColor = "red";

    var finishText = "Finish !";
    var finishColor = "green";

    var statusPopup =
    '<style>\
        .margin-top{margin-top:2px;}.margin-left{margin-left:10px;}.status_text{font-weight: bold;font-size: 16px;display: inline-block;text-align: center;}.circle{display:inline-block;width:18px;height:18px;border-radius:18px;vertical-align:baseline;vertical-align:middle;}\
    </style>\
    <div style="background-color: rgba(0, 0, 0, 0.4);left:0;right:0;top:0;bottom:0;position:fixed;"></div>\
    <div style="bottom: 10px;right: 10px;width:200px;position: fixed;z-index: 151;background-color: #ffff;border: rgb(207, 217, 222) 1px solid;border-radius: 16px;padding: 10px;"><div style="display: flex;flex-direction: column;margin-bottom: 10px;"><div style="border-bottom: 1px solid rgba(var(--b6a,219,219,219),1);flex-direction: col;height: 43px;-webkit-flex-direction: row;">\
    <h1 class="m82CD  TNiR1" style="overflow: hidden;text-overflow:ellipsis;white-space:nowrap;display:flex;flex-grow:1;font-size:16px;font-weight: 600; justify-content: center;line-height: 24px;text-align: center;"><p class="margin-left margin-top" style="color: black !important;">State: </p><p id="statusCircle" class="circle margin-left margin-top" style="background-color:' + processingColor + ';margin-right:10px;"></p"></h1>\
    </div></div><span style="font-size:20px;margin-left:20px;margin-right:20px;font-family: inherit;font-weight:bold;display:block;">\
    <p id="statusText" class="status_text margin-left margin-top" style="color: black !important;"> Status ' + processingText + '</p>\
    </span></div></div>';

    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.stop === undefined && request.isRunning === undefined) {
            return;
        }
        if (request.stop) {
            stopMethod();
            sendResponse({});
            return;
        }
        sendResponse({running: true});
    });
}