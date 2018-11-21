'use strict';

chrome.browserAction.onClicked.addListener(function () {
    chrome.tabs.getSelected(function (tab) {
        var currenUrl = tab.url;
        var targetUrl = "https://more-cars.net/video/create?video_platform=youtube&video_id=" + currenUrl;
        chrome.tabs.create({url: targetUrl});
    });
});
