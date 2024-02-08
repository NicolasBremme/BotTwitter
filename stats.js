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

function getStat(username, label, currentWindow)
{
    let block = currentWindow.document.querySelector('a[href="/'+username+'/'+label+'"]');

    if (!block){
        return (false);
    }

    let spans = Array.from(block.querySelectorAll('span')).filter(span => {
        return (!/\D/.test(span.textContent));
    });

    if (!spans.length){
        return (false);
    }

    return (parseInt(spans[0].textContent));
}

async function getUserStats()
{
    if (USER_ID == -1){
        return (false);
    }

    let username = null;

    document.querySelectorAll('script').forEach(script => {

        let objectBrut = script.innerText;

        if (objectBrut.includes('window.__INITIAL_STATE__=')) {

            objectBrut = objectBrut.replaceAll(/window.__INITIAL_STATE__=|;|/g,'');
            objectBrut = objectBrut.split('window.__META_DATA__')[0];

            var object = JSON.parse(objectBrut);
            let userIds = Object.keys(object.entities.users.entities);

            if (userIds && userIds.length){
                username = object.entities.users.entities[userIds[0]].screen_name;
            }
        }
    });

    if (!username){
        return (false);
    }

    let onProfilePage = false;
    let pathname = location.pathname;

    if (pathname !== '/'){

        let chunks = pathname.split('/');
        if (chunks && chunks.length > 1 && chunks[1] == username){
            onProfilePage = true;
        }
    }

    let currentWindow = window;

    if (!onProfilePage){

        currentWindow = window.open(twitterUrl + username, '_blank', 'location=no,height=570,width=520,scrollbars=no,status=no');
        window.focus();
    }

    await sleep(getRandom(2, 3));

    let followingCount = getStat(username, 'following', currentWindow);
    let followerCount = getStat(username, 'followers', currentWindow);

    if (!onProfilePage){
        currentWindow.close();
    }

    if ((typeof(followingCount) === 'number' && followingCount >= 0) && 
        (typeof(followerCount) === 'number' && followerCount >= 0) && USER_ID != -1) {

        let statInfos = {
            user_id: USER_ID,
            follower_count: followerCount,
            following_count : followingCount,
            service : 'twitter'
        };

        doRequest('POST', '/stats/ajaxSaveStat', statInfos, () => {
            delete window.baseUrl;
            delete window.request;
            delete window.instaUrl;
            delete window.username;
            delete window.USER_ID;
            delete window.sleep;
            delete window.getRandom;
            delete window.doRequest;

            chrome.runtime.sendMessage({statsRecovered: true}, function(response) {
            });
        });
    }
}

if (typeof init == 'undefined') {
    var init = true;

    var baseUrl = 'https://extension-connect.isoluce.net';
    var twitterUrl = 'https://twitter.com/';
    var request = new XMLHttpRequest();
    var USER_ID = -1;

    var sleep = (seconds) => new Promise(_ => setTimeout(_, seconds * 1000));
    var getRandom = (min, max) => (Math.random() * (max - min) + min);

    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.isStatsRunning === undefined) {
            return;
        }
        sendResponse({statsRecovered: false});
    });

    chrome.storage.local.get('userId', function(obj) {
        USER_ID = parseInt(obj.userId, 10);
        getUserStats();
	});
}
