var clearMatch = new RegExp("clear [0 - 9] + [m | h | d | M | y]")

function resetDefaultSuggestion() {
    chrome.omnibox.setDefaultSuggestion({
        description: 'Search in chrome history for <match> %s </match>'
    });
}
resetDefaultSuggestion();

function navigate(url) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.update(tabs[0].id, { url: url });
    });
}


function escapeXML(str) {
    return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&apos;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

chrome.omnibox.onInputChanged.addListener(function (text, suggest) {
    if (/^clear [0-9]+[m|h|d|M|y]$/.test(text)) {
        chrome.omnibox.setDefaultSuggestion({
            description: 'Delete history using command <match> %s </match>'
        });
    }

    chrome.history.search({ text: text, maxResults: 10, startTime: 0 }, (results) => {
        var s = [];
        for (var i = 0; i < results.length; i++) {
            s.push({
                'content': results[i].url,
                'description': escapeXML(results[i].title) + "<dim> - </dim><url>" + escapeXML(results[i].url) + "</url>"
            });
        }
        suggest(s);
    })

    // navigate("https://api.drupal.org/api/drupal/7/search/" + text);
});

chrome.omnibox.onInputEntered.addListener(function (text) {

    // clear command matching
    if (/^clear [0-9]+[m|h|d|M|y]$/.test(text)) {

        // extracting time period

        var command = text.split(" ")[1];
        var times = parseInt(command);
        var unit = command.charAt(command.length - 1)
        var d = new Date();
        var endTime = d.getTime()
        var startTime;
        switch (unit) {
            case "m":
                startTime = d.setMinutes(d.getMinutes() - times)
                break;
            case "h":
                startTime = d.setHours(d.getHours() - times)
                break;
            case "d":
                startTime = d.setDate(d.getDate() - times)
                break;
            case "M":
                startTime = d.setMonth(d.getMonth() - times)
                break;
            case "y":
                startTime = d.setFullYear(d.getFullYear() - times)
        }
        chrome.history.deleteRange({ startTime: startTime, endTime: endTime }, () => { console.log("history deleted") })
    }
    else {
        navigate(text)
    }
});