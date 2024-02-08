function getUsers()
{
	let users = [];
	let userCells = document.querySelectorAll('[data-testid=UserCell]');

	for (let i = 0; i < userCells.length; i++) {

		let toAdd = true;

		let followBtns = Array.from(userCells[i].querySelectorAll('[role=button]')).filter(btn => {
			return (btn.textContent === WORDS[LANGUAGE].followingButtonText);
    	});

		if (!followBtns.length) {
			continue;
		}

		let spans = userCells[i].querySelectorAll('span');

		let hashtagName = Array.from(spans).filter(span => {
			return (span.textContent[0] === '@');
    	});

		if (hashtagName.length) {

			hashtagName = hashtagName[0].textContent;

			if (SKIP_USERS.includes(hashtagName)) {
				toAdd = false;
			}
		}

		let followYouSpans = Array.from(spans).filter(span => {
			return (span.textContent === WORDS[LANGUAGE].followsYouText);
    	});

		if (followYouSpans.length && !UNFOLLOW_FOLLOWERS) {
			toAdd = false;
		}

		if (toAdd) {
			users.push({
				'cell' : userCells[i],
				'followBtn' : followBtns[0],
				'hashtagName' : hashtagName
			});
		}
	}	

	return (users);
}

function doRequest(method, URI, data, callback)
{
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

async function unfollow()
{
	window.scrollTo({
		top: 0,
		behavior: 'smooth'
	});

	await sleep(getRandom(2, 3));

	let users = getUsers();

	if (!users.length) {

		let primaryColumn = document.querySelector('[data-testid="primaryColumn"]');

		if (!primaryColumn) {
			return (false);
		}

		let userCells = primaryColumn.querySelectorAll('[data-testid=UserCell]');

		if (userCells && userCells.length) {
			userCells[userCells.length-1].scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center'});
		}

		await sleep(getRandom(2, 3));

		for (let tries = 0; tries < 10; tries++) {

			console.log('try', tries);
	
			window.scrollTo({
				top: window.scrollY + getRandom(50, 100),
				behavior: 'smooth',
			});
	
			await sleep(getRandom(2, 3));
			users = getUsers();

			if (users.length) {
				break;
			}
		}

		if (!users.length) {
			return (false);
		}
	}

	stopMethod = stopRunning;

	let unfollowed = 0;

	for (let i = 0; i < users.length; i++) {

		await sleep(Math.ceil(getRandom(1, 3)));

		if (MAXIMUM_UNFOLLOW_ACTIONS_TOTAL && parseInt(getCookie('unfollowed'), 10) >= MAXIMUM_UNFOLLOW_ACTIONS_TOTAL) {
			return (false);
		}

		if ((MAXIMUM_UNFOLLOW_ACTIONS_PER_CYCLE && unfollowed >= MAXIMUM_UNFOLLOW_ACTIONS_PER_CYCLE) || forceStop) {

            // Remove data collect
			// doRequest('POST', '/actions/ajaxSaveAction',
			// {
			// 	user_id: USER_ID,
			// 	action: 'unfollow',
			// 	service : 'twitter',
			// 	count: unfollowed
		
			// }, function() {
			// });

			return !forceStop;
		}

		if (forceStop == true) {

			if (unfollowed > 0) {

            	// Remove data collect
				// doRequest('POST', '/actions/ajaxSaveAction',
				// {
				// 	user_id: USER_ID,
				// 	action: 'unfollow',
				// 	service : 'twitter',
				// 	count: unfollowed
			
				// }, function() {
				// });
			}

			return (false);
		}

		users[i].cell.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'center' });

		await sleep(getRandom(1, 2));

		users[i].followBtn.click();

		let confirmBtns = Array.from(document.querySelectorAll('[role=button]')).filter(btn => {
			return (btn.textContent === WORDS[LANGUAGE].confirmationButtonText);
    	});

		if (!confirmBtns.length) {
			continue;
		}

		await sleep(getRandom(1, 3));

		confirmBtns[0].click();
		unfollowed++;

		document.getElementById('statusText').innerText = processingText + unfollowed + '/' + ((MAXIMUM_UNFOLLOW_ACTIONS_PER_CYCLE != null) ? MAXIMUM_UNFOLLOW_ACTIONS_PER_CYCLE : '∞');
		setCookie('unfollowed', parseInt(getCookie('unfollowed'), 10) + 1, getCookie('expireUnfollow'));

		let supportElements = Array.from(document.querySelectorAll('a[href]')).filter(a => {
			return (a.getAttribute('href').includes(errorURI));
    	});

		console.log('supportElements', supportElements.length);

		if(supportElements.length >= 2) { // Restricted by Twitter
			return (false);
		}
	}

	if (unfollowed) {

		// Remove data collect
		// doRequest('POST', '/actions/ajaxSaveAction',
		// {
		// 	user_id: USER_ID,
		// 	action: 'unfollow',
		// 	service : 'twitter',
		// 	count: unfollowed
	
		// }, function() {
		// });
	}

	return (true);
}

function getFormattedDate(date)
{
    let monthArray = ['Jan', 'Feb', 'Mar', 'Apr', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let splitedDate = date.split(/ /g);
    let month = (monthArray.indexOf(splitedDate[2]) + 1 >= 10) ? monthArray.indexOf(splitedDate[2]) + 1 : '0' + monthArray.indexOf(splitedDate[2]) + 1;
    return month + '/' + splitedDate[1] + '/' + splitedDate[3];
}

function dateToInt(date)
{
	let splitedDate = date.split('/');

	return splitedDate[2] + splitedDate[0] + splitedDate[1];
}

function getAllStorage()
{
    let values = {};
    let keys = Object.keys(localStorage);
	let i = keys.length;
	let isDate = new RegExp("Twitter../../....");

    while (i--) {
		if (isDate.test(keys[i])) {
			values[keys[i].replace('Twitter', '')] = localStorage.getItem(keys[i]);
		}
    }
    return values;
}

function initSkipUser()
{
	var usersInfo = getAllStorage();
	var usersDate = Object.keys(usersInfo);

	if (usersDate.length > 0 && !dateDaysAgo && SMART_UNFOLLOW) {

		var dateDaysAgo = new Date();

		dateDaysAgo.setDate(dateDaysAgo.getDate() - DAYS_BEFORE_UNFOLLOW);
		dateDaysAgo = getFormattedDate(dateDaysAgo.toUTCString());
		dateDaysAgo = dateToInt(dateDaysAgo);

		for (var i = 0; i < usersDate.length; i++) {
			if (dateToInt(usersDate[i]) > dateDaysAgo) {
				var splitedUsers = usersInfo[usersDate[i]].split(',');

				for (var j = 0; j < splitedUsers.length; j++) {
					if (splitedUsers[j][0] == '@') {
						splitedUsers[j] = splitedUsers[j].substring(1, splitedUsers[j].length)
					}
					SKIP_USERS.push(splitedUsers[j].toLowerCase());
				}
			} else {
				localStorage.removeItem(usersDate[i]);
			}
		}
	}
}

function getCookie(cname) 
{
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

function setCookie(cname, cvalue, date) 
{
    var expires = "expires="+ date;
    document.cookie = cname + "=" + cvalue + ";" + expires + ";domain=twitter.com;path=/";
}

function setFollowCookie(exdays) {
    var date = new Date();
    date.setTime(date.getTime() + (exdays*24*60*60*1000));
    if (getCookie("expireUnfollow") == "") {
        setCookie("expireUnfollow", date.toUTCString(), date.toUTCString());
    }
    setCookie("unfollowed", '0', date.toUTCString());
}

async function doAsync()
{
    document.querySelector('header[role="banner"]').innerHTML = statusPopup;
	
    if (!getCookie('unfollowed')) {
        setFollowCookie(1);
	}

	console.log('Unfollowed today : ', parseInt(getCookie('unfollowed'), 10));

	initSkipUser();

    document.querySelector('div[data-at-shortcutkeys]').style += ';pointer-events: none;';

	for(;;) {

		document.getElementById('statusCircle').style.backgroundColor = processingColor;
		document.getElementById('statusText').innerText = processingText + '0/' + ((MAXIMUM_UNFOLLOW_ACTIONS_PER_CYCLE != null) ? MAXIMUM_UNFOLLOW_ACTIONS_PER_CYCLE : '∞');

		if (!await unfollow()) {
			break;
		}

		stopMethod = stopNotRunning;

		let sleepTime = Math.ceil(getRandom(sleepTimeMin, sleepTimeMax));
		document.getElementById('statusCircle').style.backgroundColor = sleepColor;
		document.getElementById('statusText').innerText = sleepText + Math.ceil(secToMin(sleepTime)) + 'min';

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

	if (parseInt(getCookie('unfollowed'), 10) >= MAXIMUM_UNFOLLOW_ACTIONS_TOTAL) {
		rapport = 'Total desired of unfollow actions performed for today !';
	}

	document.getElementById('statusCircle').style.backgroundColor = finishColor;
	document.getElementById('statusText').innerText = finishText;
    await sleep(1, 2);
    location.reload();
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

	var LANGUAGE = document.querySelector('html[lang]').getAttribute('lang');
	var baseUrl = "https://extension-connect.isoluce.net";
    var errorURI = "support.twitter.com";
	var request = new XMLHttpRequest();
	var USER_ID = -1;

	var forceStop = false;
	var stopMethod = stopNotRunning;
	var SMART_UNFOLLOW = false;
	var DAYS_BEFORE_UNFOLLOW = 3;
	var UNFOLLOW_FOLLOWERS = false;
	var SKIP_USERS = [];
	var USER_ID = -1;

	var MAXIMUM_UNFOLLOW_ACTIONS_TOTAL = 12;
	var MAXIMUM_UNFOLLOW_ACTIONS_PER_CYCLE = 3;

	var isScrollOver = false;
	var sleepTimeMin;
	var sleepTimeMax;

	var WORDS = {
		//English language:
		en: {
			followsYouText: "Follows you",
			followingButtonText: "Following",
			confirmationButtonText: "Unfollow"
		},
		//Spanish language:
		es: {
			followsYouText: "Te sigue",
			followingButtonText: "Siguiendo",
			confirmationButtonText: "Dejar de seguir"
		},
		//French language:
		fr: {
			followsYouText: "Abonné",
			followingButtonText: "Abonné",
			confirmationButtonText: "Se désabonner"
		}
	};

    var minToSec = (min) => (min * 60);
    var secToMin = (sec) => (sec / 60);
    var getRandom = (min, max) => (Math.random() * (max - min) + min);
    var sleep = (seconds) => new Promise(_ => setTimeout(_, seconds * 1000));

    var processingText = 'Unfollow : ';
    var processingColor = 'orange';

    var sleepText = 'Sleep : ';
    var sleepColor = 'red';

    var stoppingText = "Stopping...";
    var stoppingColor = "red";

    var finishText = 'Finish !';
    var finishColor = 'green';

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