let ws;

let liveReactionTimeout = null;

function startWebsocket() {
    ws = new WebSocket(WS_URI);

    ws.onopen = function() {
        console.log("Sending authorization");
        ws.send(JSON.stringify({type: "authorize", token: TOKEN_ID}));
    };

    ws.onmessage = function(event) {
        try {
            const data = JSON.parse(event.data);

            if (!data.type) {
                return;
            }

            if (data.type === "authorize") {
                if (!data.ok) {
                    $("body").append('<div class="error"></div>').text(data.error);
                }
            } else if (data.type === "update-settings") {
                $(".title").text(data.settings.title);
                const body = $("body");
                body.removeAttr("class");
                body.addClass("font-" + data.settings.font);
            } else if (data.type === "live-reaction") {
                $(".emote-info img").attr("src", data.emoteImageUrl);
                $(".emote-info .streak span").text(data.count);

                const liveReaction = $("#live-reaction");

                if (liveReactionTimeout) {
                    clearTimeout(liveReactionTimeout);
                    liveReaction.addClass("bounce");
                    setTimeout(function() {
                        liveReaction.removeClass("bounce");
                    }, 100);
                } else {
                    liveReaction.addClass("scale out");
                    setTimeout(function() {
                        liveReaction.show();
                        liveReaction.removeClass("scale out");
                    }, 10);
                }

                liveReactionTimeout = setTimeout(function() {
                    liveReaction.addClass("scale out");
                    liveReactionTimeout = null;
                    setTimeout(function() {
                        liveReaction.hide();
                    }, 200);
                }, 3500);
            }
        } catch(e) {
            console.error(e);
        }
    }

    ws.onerror = console.error;

    ws.onclose = function() {
        setTimeout(startWebsocket, 1000);
    };
}

$(function () {
    if (!$("body").hasClass("example")) {
        startWebsocket();
    }
});
