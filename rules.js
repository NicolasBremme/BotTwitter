function appendRules() {
    var headerDiv = document.querySelector('header[role="banner"]');
    var customUI = document.querySelector('div[class="customUI"]');
    var username = "";

    if (!customUI) {
        headerDiv.innerHTML +=
        '<div class="customUI r-1qd0xha" style="display: block;">' +
            '<div style="bottom: 10px;left: 10px;right: 60%;min-width:500px;position: fixed;z-index: 150;background-color: #ffff;border: rgb(207, 217, 222) 1px solid;border-radius: 16px;padding: 10px;color: black;">' +
            '<div style="bottom: 10px;left: 10px;right: 60%;min-width:500px;position: fixed;z-index: 150;background-color: #ffff;border: rgb(207, 217, 222) 1px solid;border-radius: 16px;padding: 10px;color: black;"><div style="height:20px;display:flex;flex-basis:auto;flex-direction:column;flex-shrink: 0;margin-bottom: 10px;margin-left: 0px;margin-right: 0px;margin-top: 0px;min-height: 0px;min-width: 0px;padding-bottom: 0px;padding-left: 0px;padding-right: 0px;padding-top: 0px;position: relative;border-bottom-width: 1px;border-bottom-color:rgb(207, 217, 222);" class="css-1dbjc4n"><div class="css-1dbjc4n r-1awozwy r-18u37iz r-1h3ijdo r-1777fci r-1jgb5lz r-ymttw5 r-13qz1uu"><div class="css-1dbjc4n r-1habvwh r-1pz39u2 r-1777fci r-15ysp7h r-s8bhmr"><div aria-label="Fermer" role="button" tabindex="0" class="css-18t94o4 css-1dbjc4n r-1niwhzg r-42olwf r-sdzlij r-1phboty r-rs99b7 r-ero68b r-vkv6oe r-1ny4l3l r-o7ynqc r-6416eg r-lrvibr btnClose" style="margin-left: calc(-6px);"><div dir="auto" class="css-901oao r-1awozwy r-13gxpu9 r-6koalj r-18u37iz r-16y2uox r-1qd0xha r-a023e6 r-b88u0q r-1777fci r-rjixqe r-bcqeeo r-q4m81j r-qvutc0" style="margin-right: 20px !important; justify-content: right !important;"><svg viewBox="0 0 24 24" aria-hidden="true" class="r-13gxpu9 r-4qtqp9 r-yyyyoo r-18yzcnr r-dnmrzs r-bnwqim r-1plcrui r-lrvibr r-yc9v9c"><g><path d="M13.414 12l5.793-5.793c.39-.39.39-1.023 0-1.414s-1.023-.39-1.414 0L12 10.586 6.207 4.793c-.39-.39-1.023-.39-1.414 0s-.39 1.023 0 1.414L10.586 12l-5.793 5.793c-.39.39-.39 1.023 0 1.414.195.195.45.293.707.293s.512-.098.707-.293L12 13.414l5.793 5.793c.195.195.45.293.707.293s.512-.098.707-.293c.39-.39.39-1.023 0-1.414L13.414 12z"></path></g></svg><span class="css-901oao css-16my406 css-bfa6kz r-poiln3 r-a023e6 r-rjixqe r-bcqeeo r-qvutc0"></span></div></div></div></div></div>' +
                '<span style="font-size:20px;margin-left:20px;font-family: inherit;font-weight:bold;">- Follow limit per day:</span><br>' +
                '<span style="font-size:20px;margin-left:20px;font-family: inherit;">"400" by default, and "1000" for certified user.</span><br>' +
                '<span style="font-size:20px;margin-left:20px;font-family: inherit;font-weight:bold;">- Unfollow limit per day:</span><br>' +
                '<span style="font-size:20px;margin-left:20px;font-family: inherit;">not clear, we recommand a limit of around "400" per day and 3-5 per cycle.</span><br>' +
                '<span style="font-size:20px;margin-left:20px;font-family: inherit;font-weight:bold;">- Danger:</span>' +
                '<br><span style="font-size:20px;margin-left:20px;font-family: inherit;">be carefull when using this extension, bad parameters can definitively get you ban. If you\'re not sure about what you\'re doing, you should use the default configuration.</span>' +
                '<br><span style="font-size:20px;margin-left:20px;font-family: inherit;">(note: even the default config is not 100% safe)</span>' +
            '</div>' +
        '</div>';
    }

    var closeBtn = document.getElementsByClassName('btnClose')[0];
    var modal = document.getElementsByClassName('customUI')[0];

    closeBtn.onclick = function() {
        modal.style.display = "none";
    }

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

    chrome.runtime.sendMessage({username: username}, (response) => {});

    delete window.headerDiv;
    delete window.customUI;
    delete window.username;
}
appendRules();