chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.directive === undefined) {
        return;
    }

    // CHECK FOR WICH UNFOLLOW JS TO START
    if (request.directive.includes("unfollow")) {
        chrome.tabs.executeScript(null, {
            file: "global/unfollow.js",
            allFrames: false
        });

        if (request.directive == "unfollow_full") {
            chrome.tabs.executeScript(null, {
                file: "full/js/unfollow.js",
                allFrames: false
            });
            sendResponse({});
            return;
        }

        chrome.tabs.executeScript(null, {
            file: "lite/js/unfollow.js",
            allFrames: false
        });
        sendResponse({});
        return;
    }

    // CHECK FOR WICH FOLLOW JS TO START
    if (request.directive.includes("follow")) {
        chrome.tabs.executeScript(null, {
            file: "global/follow.js",
            allFrames: false
        });

        if (request.directive == "follow_full") {
            chrome.tabs.executeScript(null, {
                file: "full/js/follow.js",
                allFrames: false
            });
            sendResponse({});
            return;
        }

        chrome.tabs.executeScript(null, {
            file: "lite/js/follow.js",
            allFrames: false
        });
        sendResponse({});
        return;
    }

    if (request.directive == "get_stats") {
        chrome.tabs.executeScript(null, {
            file: "stats.js",
            allFrames: false
        });
        sendResponse({});
    }
});

chrome.runtime.onConnect.addListener(function(externalPort) {
    chrome.tabs.executeScript(null, {
        file: "rules.js",
        allFrames: false
    });
});