const TWITCH_URL_REGEX = /^(https?:\/\/)?(www\.)?twitch\.tv\//g;
const REMOVE_EXAMPLE_REGEX = /&?example=true&?/g;
const REMOVE_CHANNEL_REGEX = /channel=\w+&/g;

$(function() {
    const form = $("form#generator");
    const channelInput = $("#channel");

    const resultUrl = $("#url");

    const frame = $("iframe");

    function updateUrl() {
        const queryString = form.serialize()
            .replaceAll(REMOVE_CHANNEL_REGEX, "");

        const queryStringNoExample = queryString.replaceAll(REMOVE_EXAMPLE_REGEX, "");

        resultUrl.val(`${BASE_URI}overlay/${channelInput.val()}?${queryStringNoExample}`);

        frame.attr("src", `${BASE_URI}overlay/${channelInput.val()}?${queryString}`);
    }

    channelInput.on("keyup", function(e) {
        channelInput.val(channelInput.val().replaceAll(TWITCH_URL_REGEX, '').trim());
    });

    form.find("input, select").on("change", updateUrl);

    let attemptCopy = true;
    $("#copy").on("click", function() {
        if (!attemptCopy) return;
        if (navigator?.clipboard) {
            navigator.clipboard
                .writeText(resultUrl.val())
                .then(function() {
                    alert("Copied result URL to clipboard!");
                }, function(e) {
                    console.error(e);
                    attemptCopy = false;
                    alert("Failed to copy to clipboard!");
                });
        } else {
            resultUrl.select();
            document.execCommand('copy');
        }
    });

    updateUrl();
});