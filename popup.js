const test_key = "pk_test_k6vUbWZRdIFGvA90o5OI36kJ",
    live_key = "pk_live_LPb5dYsW9Po0zJbeokPTvoAZ",
    baseUrl = "https://extension-connect.isoluce.net";
var clientSecret = null,
    stripe = null,
    cardElement = null;
    request = new XMLHttpRequest();
var savedAccount = null,
    actualAccount = null;


document.addEventListener('DOMContentLoaded', function ()
{
    var port = chrome.runtime.connect();

    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.username === undefined && request.statsRecovered === undefined) {
            return;
        }

        if (request.username !== undefined) {
            actualAccount = request.username;
            sendResponse({});

            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {isRunning: true}, function(response) {
                    if (response === undefined) {
                        isSubscribed();
                        return;
                    }
                    let stopScriptDiv = document.querySelector("#stop-script");
                    var stopBtn = document.querySelector('button[name="stop-btn"]');
                    let loading = document.getElementById("loading");
                
                    stopScriptDiv.style.display = "block";
                    loading.style.display = "none";
                    stopBtn.addEventListener('click', stopScript);
                });
            });
        }

        if (request.statsRecovered !== undefined && request.statsRecovered) {
            let statsGatheringDiv = document.querySelector("#stats-gathering");

            statsGatheringDiv.style.display = "none";
            isSubscribed();
            sendResponse({});
        }
    });
});

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

function isSubscribed()
{
    var statsGathering = document.getElementById("stats-gathering");
    let wrongAccount = document.getElementById("wrong-account");
    let account = document.getElementById("enter-account");
    var loading = document.getElementById("loading");
    var connect = document.getElementById("connect");
    var lite = document.getElementById("lite");
    var full = document.getElementById("full");
    var mode = null;
    
    // Data collect replacement
    loading.style.display = "none";
    full.style.display = "block";
    mode = "full"; // Can be "full" or "light" depending on subscription

    let popupToLoad = "loadPopup_"  + mode;
    window[popupToLoad]();


    // Remove data collect
    // doRequest("GET", "/twitterSubscriptions/isCurrentUserSubscribed", null, function() {
    //     loading.style.display = "none";
        
    //     if (request.status === 200) {
    //         var data = JSON.parse(request.responseText);
    //         console.log(data);
            
    //         if (data.user_id !== undefined) {
    //             document.getElementById("CurrentUserId").value = parseInt(data.user_id, 10);

    //             lite.querySelector("#username").value = "@" + data.account_twitter;
    //             full.querySelector("#username").value = "@" + data.account_twitter;

    //             if (data.account_twitter == null) {
    //                 account.style.display = "block";
    //                 loadPopup_connect();
    //                 return;
    //             }

    //             savedAccount = data.account_twitter;

    //             // In case i'm stupid while creating account
    //             savedAccount = actualAccount;

    //             if (savedAccount != actualAccount) {
    //                 let logout = wrongAccount.querySelector('[name="logout-btn"]');

    //                 wrongAccount.style.display = "block";
    //                 logout.addEventListener('click', logoutHandler);
    //                 return;
    //             }

    //             if (data.do_get_stats !== undefined && data.do_get_stats) {
    //                 let userId = document.getElementById("CurrentUserId").value;

    //                 chrome.storage.local.set({userId: userId}, function() {
    //                     chrome.runtime.sendMessage({directive: "get_stats"}, function(response) {
    //                         statsGathering.style.display = "block";
    //                         console.log(response);
    //                     });
    //                 });
    //                 return;
    //             }

    //             if (!data.hasError) {
    //                 full.style.display = "block";
    //                 mode = "full";
    //             }
    //             else {
    //                 lite.style.display = "block";
    //                 mode = "lite";
    //             }
    //         }
    //         else {
    //             connect.style.display = "block";
    //             mode = "connect";
    //         }
    //         let popupToLoad = "loadPopup_"  + mode;
    //         window[popupToLoad]();
    //     }
    // });
}

function connection()
{
    var thisDiv = document.getElementById("connect");
    let html = document.querySelector('html');

    var usernameInput = thisDiv.querySelector('#username');
    var passwordInput = thisDiv.querySelector('#password');

    let data = {
        "data[User][username]": usernameInput.value,
        "data[User][password]": passwordInput.value
    };

    html.style.height = "1px";
    loading.style.display = "block";
    connect.style.display = "none";

    doRequest("POST", "/users/ajaxLogin", data, function() {
        if (request.status === 200) {
            var data = JSON.parse(request.responseText);
            console.log(data);

            if (data.hasError) {
                console.log(data.error);
                loading.style.display = "none";
                connect.style.display = "block";
            }
            else {
                connect.style.display = "none";
                isSubscribed();
            }
        }
    });
}

function sign()
{
    var thisDiv = document.getElementById("connect");
    let html = document.querySelector('html');
    var emailRegex = /^(([a-z0-9!\#$%&\\\'*+\/=?^_`{|}~-]+\.?)*[a-z0-9!\#$%&\\\'*+\/=?^_`{|}~-]+)@(([a-z0-9-_]+\.?)*[a-z0-9-_]+)\.[a-z]{2,}$/i;

    var usernameInput = thisDiv.querySelector('#username');
    var passwordInput = thisDiv.querySelector('#password');
    var accountInput = thisDiv.querySelector('#account');

    let data = {
        "data[User][username]": usernameInput.value,
        "data[User][password]": passwordInput.value,
        "data[User][account_twitter]": accountInput.value
    };

    if (usernameInput.value.length == 0 || passwordInput.value == 0) {
        console.log("Empty field");
        return;
    }

    if (!usernameInput.value.match(emailRegex)) {
        console.log("Invalid email");
        return;
    }

    html.style.height = "1px";
    loading.style.display = "block";
    connect.style.display = "none";

    doRequest("POST", "/users/ajaxSign", data, function() {
        if (request.status === 200) {
            var data = JSON.parse(request.responseText);
            console.log(data);

            if (data.hasError) {
                console.log(data.error);
                loading.style.display = "none";
                connect.style.display = "block";
            }
            else {
                connect.style.display = "none";
                isSubscribed();
            }
        }
    });
}

function logoutHandler()
{
    let html = document.querySelector('html');
    let wrongAccount = document.getElementById("wrong-account");
    let logout = wrongAccount.querySelector('[name="logout-btn"]');

    document.getElementById("lite").style.display = "none";
    document.getElementById("full").style.display = "none";
    loading.style.display = "block";
    html.style.height = "1px";

    wrongAccount.style.display = "none";
    logout.removeEventListener('click', logoutHandler);

    doRequest("POST", "/users/ajaxLogout", null, function() {
        if (request.status === 200) {
            var data = JSON.parse(request.responseText);
            console.log(data);

            if (!data.hasError) {
                connect.style.display = "block";
                loadPopup_connect();
            }
            loading.style.display = "none";
        }
    });
}

function confirmAccount() {
    let accountDiv = document.getElementById("enter-account");
    let accountInput = accountDiv.querySelector("#account");
    let html = document.querySelector("html");
    let loading = document.getElementById("loading");

    let askUsername = accountDiv.querySelector("#askUsername");
    let forceAskUsername = accountDiv.querySelector("#forceAskUsername");

    if (accountInput.value.length == 0) {
        askUsername.style.display = "none";
        forceAskUsername.style.display = "block";
        accountInput.style = "border: solid rgb(255, 95, 95) 2px;";
    }
    
    let data = {
        "data[User][account_twitter]": accountInput.value
    };

    html.style.height = "1px";
    loading.style.display = "block";
    accountDiv.style.display = "none";

    doRequest("POST", "/users/ajaxSaveAccount", data, function() {
        if (request.status === 200) {
            var data = JSON.parse(request.responseText);
            console.log(data);

            if (data.hasError) {
                console.log(data.error);
                loading.style.display = "none";
                accountDiv.style.display = "block";
            }
            else {
                isSubscribed();
            }
        }
    });
}

function stopScript()
{
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {stop: true}, function(response) {
            let stopScriptDiv = document.querySelector("#stop-script");
    
            stopScriptDiv.style.display = "none";
            isSubscribed();
        });
    });
}

function loadPopup_connect()
{
    var thisDiv = document.getElementById("connect");
    var loginBtn = thisDiv.querySelector('#login');
    var signBtn = thisDiv.querySelector('#sign');
    var loginRedirect = thisDiv.querySelector('#redirect-login');
    var signRedirect = thisDiv.querySelector('#redirect-sign');
    var title = thisDiv.querySelector('#title');
    var confirmAccountBtn = document.getElementById("confirm-account");

    loginBtn.addEventListener('click', connection);
    signBtn.addEventListener('click', sign);
    confirmAccountBtn.addEventListener('click', confirmAccount);

    loginRedirect.addEventListener('click', function() {
        title.innerText = "LOGIN PAGE";
        thisDiv.querySelector("#login-block").style.display = "block";
        thisDiv.querySelector("#sign-block").style.display = "none";
        thisDiv.querySelectorAll('input').forEach(input => {
            input.value = "";
        });
    });
    signRedirect.addEventListener('click', function() {
        title.innerText = "SIGNIN PAGE";
        thisDiv.querySelector("#login-block").style.display = "none";
        thisDiv.querySelector("#sign-block").style.display = "block";
        thisDiv.querySelectorAll('input').forEach(input => {
            input.value = "";
        });
    });
}