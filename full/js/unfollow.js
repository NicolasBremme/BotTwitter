if (typeof once === "undefined") {
	
	var once = true;

	chrome.storage.local.get('inputsValue', function(storage) {

        MAXIMUM_UNFOLLOW_ACTIONS_TOTAL = parseInt(storage.inputsValue[8], 10);

		if (storage.inputsValue[10] == true){
			MAXIMUM_UNFOLLOW_ACTIONS_PER_CYCLE = null;
		} else {
			MAXIMUM_UNFOLLOW_ACTIONS_PER_CYCLE = parseInt(storage.inputsValue[9], 10);
		}

		sleepTimeMin = minToSec(parseInt(storage.inputsValue[11]), 10);
        sleepTimeMax = minToSec(parseInt(storage.inputsValue[12]), 10);

		UNFOLLOW_FOLLOWERS = storage.inputsValue[13];

		if (storage.inputsValue[14] == true){
			SMART_UNFOLLOW = true;
			DAYS_BEFORE_UNFOLLOW = parseInt(storage.inputsValue[15], 10);
		}

        chrome.storage.local.get('userId', function(storage) {
            USER_ID = parseInt(storage.userId, 10);
            doAsync();
        });
    });
}