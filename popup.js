const multimediaServices = [
    {
        "name": "flickr",
        "type": "image",
        "url_pattern": "flickr.com/",
    }, {
        "name": "wikimedia",
        "type": "image",
        "url_pattern": "wikimedia.org/wiki/File:",
    }, {
        "name": "wikimedia",
        "type": "image",
        "url_pattern": "wikipedia.org/wiki/File:",
    }, {
        "name": "youtube",
        "type": "video",
        "url_pattern": "youtube.com/watch?v=",
    }, {
        "name": "evo",
        "type": "online article",
        "url_pattern": "evo.co.uk/",
        "selectors": {
            "title": "main h1",
            "summary": "main h2",
            "date": "main .polaris__post-meta--date span",
            "author": "main .polaris__post-meta--author a"
        }
    }, {
        "name": "topgear",
        "type": "online article",
        "url_pattern": "topgear.com/car-news",
        "selectors": {
            "title": "h1",
            "summary": ".standfirst",
            "date": ".post-info__date",
            "author": ".post-info__author a"
        }
    }, {
        "name": "road_and_track",
        "type": "online article",
        "url_pattern": "roadandtrack.com/",
        "selectors": {
            "title": "header h1",
            "summary": "header h1 + div p",
            "date": "header .content-info-date",
            "author": "header .byline-name"
        }
    }
];

window.onload = function () {
    chrome.tabs.query({
        active: true,
        lastFocusedWindow: true
    }, function (tabs) {
        const currentUrl = tabs[0].url;

        $('#noMediaElementFound').show();
        $('#mediaElementFound').hide();
        $('#addItem').hide();
        $('#errorMessage').hide();

        multimediaServices.forEach(function (service) {
            if (currentUrl.includes(service.url_pattern)) {
                $('#noMediaElementFound').hide();
                $('#mediaElementFound').show();
                $('#addItem').show();

                $('#mediaElementType').text(service.type);
                $('#mediaElementPlatform').text(service.name);

                if (service.name === 'youtube') {
                    const urlObj = new URL(currentUrl);
                    const videoId = urlObj.searchParams.get('v');

                    let renderedList = renderList([
                        ['Media Type', service.type],
                        ['Video Platform', service.name],
                        ['Video ID', videoId],
                    ]);
                    $('#mediaElementDetails').html(renderedList);
                } else if (service.name === 'flickr') {
                    const urlObj = new URL(currentUrl);
                    const urlPath = urlObj.pathname.split('/');
                    const imageId = urlPath[3];

                    let renderedList = renderList([
                        ['Media Type', service.type],
                        ['Image Platform', service.name],
                        ['Image ID', imageId],
                    ]);
                    $('#mediaElementDetails').html(renderedList);
                } else if (service.name === 'wikimedia') {
                    const urlObj = new URL(currentUrl);
                    const urlPath = urlObj.pathname.split('/');
                    const imageId = urlPath[2];

                    let renderedList = renderList([
                        ['Media Type', service.type],
                        ['Image Platform', service.name],
                        ['Image ID', imageId],
                    ]);
                    $('#mediaElementDetails').html(renderedList);
                } else if (service.type === 'online article') {
                    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                        const activeTab = tabs[0];
                        chrome.tabs.sendMessage(activeTab.id, {
                            "message": "collect-media-item-data_REQUEST",
                            "selectors": service.selectors
                        });
                    });

                    chrome.runtime.onMessage.addListener(function (response, sender) {
                        if (response.message === "collect-media-item-data_RESPONSE") {
                            let url = sender.url;

                            // remove potential hash within the url
                            const hashLocation = url.indexOf('#');
                            if (hashLocation > 0) {
                                url = url.substr(0, hashLocation);
                            }

                            let renderedList = renderList([
                                ['Media Type', service.type],
                                ['URL', url],
                                ['Title', response.title],
                                ['Excerpt', response.summary],
                                ['Publish Date', response.date],
                                ['Author', response.author],
                            ]);
                            $('#mediaElementDetails').html(renderedList);
                        }
                    });
                }
            }
        });
    });
};

let accessTokenInput = document.getElementById('accessTokenInput');
chrome.storage.local.get(['accessToken'], function (storage) {
    accessTokenInput.value = storage.accessToken;
});

let saveAccessTokenBtn = document.getElementById('saveAccessToken');
saveAccessTokenBtn.onclick = function () {
    let newAccessToken = document.getElementById('accessTokenInput').value;

    chrome.storage.local.set({'accessToken': newAccessToken}, function () {
    });
};

let addItemBtn = document.getElementById('addItem');
addItemBtn.onclick = function () {
    chrome.tabs.query({
        active: true,
        lastFocusedWindow: true
    }, function (tabs) {
        const currentUrl = tabs[0].url;

        multimediaServices.forEach(function (service) {
            if (currentUrl.includes(service.url_pattern)) {
                if (service.name === 'youtube') {
                    const urlObj = new URL(currentUrl);
                    const videoId = urlObj.searchParams.get('v');

                    addYoutubeVideo(videoId);
                } else if (service.name === 'flickr') {
                    const urlObj = new URL(currentUrl);
                    const urlPath = urlObj.pathname.split('/');
                    const imageId = urlPath[3];

                    addFlickrImage(imageId);
                } else if (service.name === 'wikimedia') {
                    const urlObj = new URL(currentUrl);
                    const urlPath = urlObj.pathname.split('/');
                    const imageId = urlPath[2];

                    addWikimediaImage(imageId);
                } else if (service.type === 'online article') {
                    addOnlineArticle(service);
                }
            }
        });
    });
};

function addYoutubeVideo(videoId) {
    if (!videoId) {
        $('#errorMessage').html('Video ID could not be determined').show();
        return;
    }

    postMediaElementToMoreCars('videos', {
        video_platform: 'youtube',
        video_platform_id: videoId
    });
}

function addFlickrImage(imageId) {
    if (!imageId) {
        $('#errorMessage').html('Image ID could not be determined').show();
        return;
    }

    postMediaElementToMoreCars('images', {
        image_platform: 'flickr',
        image_platform_id: imageId
    });
}

function addWikimediaImage(imageId) {
    if (!imageId) {
        $('#errorMessage').html('Image ID could not be determined').show();
        return;
    }

    postMediaElementToMoreCars('images', {
        image_platform: 'wikimedia',
        image_platform_id: imageId
    });
}

function addOnlineArticle(service) {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        const activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {
            "message": "collect-media-item-data_REQUEST",
            "selectors": service.selectors
        });
    });

    chrome.runtime.onMessage.addListener(function (response, sender) {
        chrome.storage.local.get(['accessToken'], function () {
            if (response.message === "collect-media-item-data_RESPONSE") {
                let url = sender.url;

                // remove potential hash within the url
                const hashLocation = url.indexOf('#');
                if (hashLocation > 0) {
                    url = url.substr(0, hashLocation);
                }

                postMediaElementToMoreCars('online-articles', {
                    url: url,
                    name: response.title,
                    description: response.summary,
                    publish_date: response.date,
                    author: response.author,
                });
            }
        });
    });
}

function renderList(items) {
    let html = '';

    items.forEach(item => {
        html +=
            '<li class="list-group-item">' +
            '<b>' + item[0] + '</b><br>' +
            '<small>' + item[1] + '</small>' +
            '</li>';
    });

    return html;
}

function postMediaElementToMoreCars(endpoint, payload) {
    chrome.storage.local.get(['accessToken'], function (storage) {
        $.ajax({
            type: 'POST',
            url: 'https://more-cars.net/api/v1/' + endpoint,
            headers: {
                'access-token': storage.accessToken
            },
            data: payload
        }).done(function (response) {
            chrome.tabs.create({url: response.links.self});
        }).fail(function (response) {
            $('#errorMessage').html(response.responseJSON.errors[0].detail).show();
        });
    });
}
