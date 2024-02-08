function clickHandler_full(event)
{
    event.preventDefault();
    var thisDiv = document.getElementById("full");
    var stopScriptDiv = document.querySelector("#stop-script");
    let target = event.target || event.srcElement;
    let username = thisDiv.querySelector('#username');
    let userId = document.getElementById('CurrentUserId').value;
    let inputs = thisDiv.querySelectorAll('input');
    let values = [];

    for (let i = 0; i < inputs.length; i++) {
        if (!inputs[i].getAttribute("class") || !inputs[i].getAttribute("class").includes("ignore")) {
            if (inputs[i].getAttribute('type') == 'checkbox') {
                values.push(inputs[i].checked);
            }
            else {
                values.push(inputs[i].value);
            }
        }
    }

    // Not used anymore
    // if (target.getAttribute('action').includes('follow') && username.value.length == 1) {
    //     let spans = thisDiv.querySelectorAll('span[name="user"]');

    //     thisDiv.querySelector('#settingsFollow').style.display = 'block';
    //     thisDiv.querySelector('#username').style = "border: 2px solid red;"
    //     spans[0].style.display = 'none';
    //     spans[1].style.display = 'none';
    //     spans[2].style.display = 'block';
    //     return;
    // }

    chrome.storage.local.set({userId: userId}, function() {
        console.log('userId saved.');

        chrome.storage.local.set({inputsValue: values}, function() {
            console.log('Inputs saved.');

            chrome.runtime.sendMessage({directive: target.getAttribute('action')}, function(response) {
                thisDiv.style.display = "none";
                stopScriptDiv.style.display = "block";
            });
        });
    });
}

function settingsHandler_full(event)
{
    var thisDiv = document.getElementById("full");
    let target = event.target;
    let action = target.getAttribute('action');
    let followSettings = thisDiv.querySelector('#settingsFollow');
    let unfollowSettings = thisDiv.querySelector('#settingsUnfollow');
    let html = document.querySelector('html');
    
    html.style.height = "1px";

    if (action == 'follow') {
        if (followSettings.style.display == "none") {
            followSettings.style.display = 'block';
            unfollowSettings.style.display = 'none';
        }
        else {
            followSettings.style.display = 'none';
            unfollowSettings.style.display = 'none';
        }
    } else if (action == 'unfollow') {
        if (unfollowSettings.style.display == "none") {
            followSettings.style.display = 'none';
            unfollowSettings.style.display = 'block';
        }
        else {
            followSettings.style.display = 'none';
            unfollowSettings.style.display = 'none';
        }
    }
}

function onchangeHandler_full(event)
{
    var thisDiv = document.getElementById("full");
    let target = event.target;

    if (target.id.includes("slider") && target.id.includes("Display")) {
        thisDiv.querySelector("#" + target.id.replace('Display', '')).value = parseInt(target.value, 10);
        return;
    }
    else if (target.id.includes("slider")) {
        thisDiv.querySelector("#" + target.id + "Display").value = parseInt(target.value, 10);
        return;
    }
    if (parseInt(target.id[target.id.length - 1], 10) % 2 == 1) {
        let secondId = target.id.substring(0, target.id.length - 1) + (parseInt(target.id[target.id.length - 1], 10) + 1);

        thisDiv.querySelector("#" + secondId).min = parseInt(target.value, 10);
        if (parseInt(thisDiv.querySelector("#" + secondId).value, 10) <=  parseInt(target.value, 10)) {
            thisDiv.querySelector("#" + secondId).value = parseInt(target.value, 10) + 1;
        }
    }
    else if (parseInt(target.id[target.id.length - 1], 10) % 2 == 0) {
        let firstId = target.id.substring(0, target.id.length - 1) + (parseInt(target.id[target.id.length - 1], 10) - 1);

        target.min = 2;
        if (parseInt(thisDiv.querySelector("#" + firstId).value, 10) >= parseInt(target.value, 10)) {
            thisDiv.querySelector("#" + firstId).value = (parseInt(target.value, 10) - 1 > 1) ? parseInt(target.value, 10) - 1 : 1;
        }
    }
}

function checkboxHandler_full(event)
{
    var thisDiv = document.getElementById("full");
    let target = event.target;
    let name = target.getAttribute('name');

    if (name == 'forceUnfollow' && target.checked) {
        console.log('force');
    }
    else if (name == 'smartUnfollow') {
        let display = thisDiv.querySelectorAll('[name="daysUnfollow"]');
        let html = document.querySelector('html');
        html.style.height = "1px";

        if (target.checked) {
            for (let i = 0; i < display.length; i++) {
                display[i].style.display = 'block';
            }
        } else {
            for (let i = 0; i < display.length; i++) {
                display[i].style.display = 'none';
            }
        }
    }
}

function loadPopup_full()
{
    var thisDiv = document.getElementById("full");

    var btns = thisDiv.querySelectorAll('button[name="script"]');
    var settings = thisDiv.querySelectorAll('button[name="settings"]');
    var usernameInput = thisDiv.querySelector('#username');
    var onchangeInputs = thisDiv.querySelectorAll('input[name="onchange"]');
    var checkboxInputs = thisDiv.querySelectorAll('input[type="checkbox"]');
    var noLimits = thisDiv.querySelectorAll('input[name="no-limit"]');
    var logoutBtns = document.getElementsByName('logout-btn');
    var viewStatsBtn = document.getElementsByName('btn-stat');
    var stopBtn = document.querySelector('button[name="stop-btn"]');

    noLimits.forEach(noLimit => {
        noLimit.addEventListener('click', function (event) {
            var target = event.target;
            var linkedElement = thisDiv.querySelector("#" + target.id.substring(1, target.id.length));

            if (linkedElement.getAttribute('disabled') || linkedElement.getAttribute('disabled') == '') {
                linkedElement.removeAttribute('disabled');
                linkedElement.style = "background-color: white";
            } else {
                linkedElement.setAttribute('disabled', '');
                linkedElement.style = "background-color: lightgrey";
            }
        });
    });

    chrome.storage.local.get("inputsValue", function(obj) {
        if (Object.keys(obj).length != 0) {
            let objectArray = Object.entries(obj);
            let inputs = thisDiv.querySelectorAll('input');
            let index = 0;

            inputs.forEach(input => {
                if (!input.getAttribute("class") || (!input.getAttribute("class").includes("ignore") && !input.getAttribute("class").includes("not-recover"))) {
                    if (input.getAttribute('type') == 'checkbox') {
                        input.checked = objectArray[0][1][index];
                        if (input.getAttribute('name') == 'smartUnfollow' && input.checked) {
                            let daysUnfollow = thisDiv.querySelectorAll('[name="daysUnfollow"]');

                            for (let i = 0; i < daysUnfollow.length; i++) {
                                daysUnfollow[i].style.display = "block";
                            }
                        }
                        if (input.getAttribute('name') == 'no-limit' && input.checked) {
                            var linkedElement = thisDiv.querySelector('[id="' + input.id.substring(1, input.id.length) + '"]');
                
                            linkedElement.setAttribute('disabled', '');
                            linkedElement.style = "background-color: lightgrey";
                        }
                    }
                    else {
                        input.value = objectArray[0][1][index];
                    }
                    index++;
                }
                else if (input.getAttribute("class") && input.getAttribute("class").includes("not-recover")) {
                    index++;
                }
            });
            document.getElementById("slider1Display").value = document.getElementById("slider1").value;
            document.getElementById("slider2Display").value = document.getElementById("slider2").value;
        }
    });

    usernameInput.addEventListener('input', function() {
        var length = usernameInput.value.length;
        let spans = thisDiv.querySelectorAll('span[name="user"]');

        thisDiv.querySelector('#username').style = "";
        spans[0].style.display = 'inline-block';
        spans[1].style = 'color: red; display: inline-block;';
        spans[2].style.display = 'none';
        if (length == 0) {
            usernameInput.value = "@";
        }
        else if (usernameInput.value[0] != "@") {
            usernameInput.value = "@" + usernameInput.value;
        }
        else if (usernameInput.value[length - 1] == " ") {
            usernameInput.value = usernameInput.value.substring(0, length - 1);
        }
    });

    onchangeInputs.forEach(input => {
        input.addEventListener('input', onchangeHandler_full);
        input.addEventListener('keypress', (event) => {
            event.preventDefault();
        });
    });
    
    btns.forEach(btn => {
        btn.addEventListener('click', clickHandler_full);
    });

    settings.forEach(setting => {
        setting.addEventListener('click', settingsHandler_full);
    });

    checkboxInputs.forEach(input => {
        input.addEventListener('click', checkboxHandler_full);
    });

    logoutBtns.forEach(logout => {
        logout.addEventListener('click', logoutHandler);
    });

    viewStatsBtn.forEach(viewStat => {
        viewStat.addEventListener('click', function() {
            var tab = window.open(baseUrl + "/stats/viewStats", "_blank", null);
        });
    });
    
    stopBtn.addEventListener('click', stopScript);
}