chrome.runtime.onMessage.addListener(
    function (request) {
        if (request.message === "collect-media-item-data_REQUEST") {
            let title = document.querySelector(request.selectors.title).textContent;
            let summary = document.querySelector(request.selectors.summary);
            if (summary) {
                summary = summary.textContent;
            }
            let author = document.querySelector(request.selectors.author);
            if (author) {
                author = author.textContent;
            }

            let theDate = null;
            if (request.selectors.date_property) {
                theDate = document.querySelector(request.selectors.date).getAttribute(request.selectors.date_property);
            } else {
                theDate = document.querySelector(request.selectors.date);
                theDate = theDate.textContent;
            }
            let formattedDate = null;
            if (theDate) {
                let unixTimestamp = Date.parse(theDate + ' GMT');
                let date = new Date(unixTimestamp);
                formattedDate = date.toISOString().slice(0, 10);
            }

            chrome.runtime.sendMessage({
                "message": "collect-media-item-data_RESPONSE",
                "title": title,
                "summary": summary,
                "author": author,
                "date": formattedDate
            });
        }
    }
);
