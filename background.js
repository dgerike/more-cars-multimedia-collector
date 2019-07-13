'use strict';

var multimediaServices = [
    {
        "name": "flickr",
        "selector": "flickr.com",
        "url": "https://more-cars.net/image/create?image_platform=flickr&image_id=",
    }, {
        "name": "wikimedia",
        "selector": "wikimedia.org/wiki/File:",
        "url": "https://more-cars.net/image/create?image_platform=wikimedia&image_id=",
    }, {
        "name": "wikipedia",
        "selector": "wikipedia.org/wiki/File:",
        "url": "https://more-cars.net/image/create?image_platform=wikimedia&image_id=",
    }, {
        "name": "youtube",
        "selector": "youtube.com/watch?v=",
        "url": "https://more-cars.net/video/create?video_platform=youtube&video_id=",
    }
];

var articleServices = [{
    "name": "evo",
    "domain": "evo.co.uk",
    "selectors": {
        "title": "#page-title",
        "summary": "h2.short-teaser",
        "date": ".date-display-single",
        "author": "#block-system-main > div > div > div.content > div.field-group-format.group_meta.group-meta > span > span"
    }
}, {
    "name": "topgear",
    "domain": "topgear.com",
    "selectors": {
        "title": "h1",
        "summary": ".standfirst",
        "date": ".post-info__date",
        "author": ".post-info__author a"
    }
}];

chrome.runtime.onMessage.addListener(function (response, sender) {
    if (response.message === "add_media_item_response") {

        var url = sender.url;

        // remove potential hash within the url
        var hashLocation = url.indexOf('#');
        if (hashLocation > 0) {
            url = url.substr(0, hashLocation);
        }

        // build url for adding the article to the More Cars database
        var targetUrl = "https://more-cars.net/onlinearticle/create?" +
            "url=" + url + "&" +
            "name=" + response.title + "&" +
            "description=" + response.summary + "&" +
            "publish_date=" + response.date + "&" +
            "author=" + response.author;
    }

    chrome.tabs.create({url: targetUrl});
});

chrome.browserAction.onClicked.addListener(function () {
    chrome.tabs.getSelected(function (tab) {
        var currenUrl = tab.url;

        multimediaServices.forEach(function (service) {
            if (currenUrl.includes(service.selector)) {
                var targetUrl = service.url + tab.url;
                chrome.tabs.create({url: targetUrl});
            }
        });

        articleServices.forEach(function (service) {
            if (currenUrl.includes(service.domain)) {
                chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                    var activeTab = tabs[0];
                    chrome.tabs.sendMessage(activeTab.id, {
                        "message": "add_media_item_request",
                        "selectors": service.selectors
                    });
                });
            }
        });
    });
});
