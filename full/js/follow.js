if (typeof once === "undefined") {
    var once = true;

	// GET OPTIONS FROM CHROME LOCAL STORAGE
    chrome.storage.local.get("inputsValue", function(obj) {
        limit = parseInt(obj.inputsValue[0], 10);
        followBeforeSleepMin = parseInt(obj.inputsValue[1], 10);
        followBeforeSleepMax = parseInt(obj.inputsValue[2], 10);
        sleepTimeMin = minToSec(parseInt(obj.inputsValue[3]), 10);
        sleepTimeMax = minToSec(parseInt(obj.inputsValue[4]), 10);
        likeAndRetweetCount = (obj.inputsValue[6]) ? 0 : parseInt(obj.inputsValue[5], 10);
        myName = obj.inputsValue[7];

        sessionFollow = Math.round(getRandom(followBeforeSleepMax, followBeforeSleepMin));
        chrome.storage.local.get("userId", function(obj) {
            userId = parseInt(obj.userId, 10);
            doAsync();
        });
    });
}