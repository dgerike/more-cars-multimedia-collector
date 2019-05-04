chrome.runtime.onMessage.addListener(
    function (request) {
        if (request.message === "add_media_item_request") {
            var title = document.querySelector(request.selectors.title).textContent;
            var summary = document.querySelector(request.selectors.summary).textContent;
            var author = document.querySelector(request.selectors.author).textContent;
            var theDate = document.querySelector(request.selectors.date).textContent;

            var unixTimestamp = Date.parse(theDate + ' GMT');
            var date = new Date(unixTimestamp);
            var formattedDate = date.toISOString().slice(0, 10);

            chrome.runtime.sendMessage({
                "message": "add_media_item_response",
                "title": title,
                "summary": summary,
                "author": author,
                "date": formattedDate
            });
        }
    }
);
