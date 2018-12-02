'use strict';

var availableServices = [
    {
        "name": "flickr",
        "selector": "flickr.com",
        "url": "https://more-cars.net/image/create?image_platform=flickr&image_id=",
    }, {
        "name": "wikimedia",
        "selector": "wikimedia.org/wiki/File:",
        "url": "https://more-cars.net/image/create?image_platform=wikimedia&image_id=",
    }, {
        "name": "wikimedia",
        "selector": "wikipedia.org/wiki/File:",
        "url": "https://more-cars.net/image/create?image_platform=wikimedia&image_id=",
    }, {
        "name": "youtube",
        "selector": "youtube.com/watch?v=",
        "url": "https://more-cars.net/video/create?video_platform=youtube&video_id=",
    }
];

chrome.browserAction.onClicked.addListener(function () {
    chrome.tabs.getSelected(function (tab) {
        var currenUrl = tab.url;
        availableServices.forEach(function (service) {
            if (currenUrl.includes(service.selector)) {
                var targetUrl = service.url + tab.url;
                chrome.tabs.create({url: targetUrl});
            }
        })
    });
});
