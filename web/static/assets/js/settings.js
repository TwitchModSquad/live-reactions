$(function() {
    const form = $("form#generator");

    const resultUrl = $("#url");

    const frame = $("iframe");

    const title = $("#title");
    const font = $("#font");

    const alerts = $("#alerts");
    const deleteAlerts = $("#delete-alerts");

    let currentAlert = null;

    function updateUrl() {
        frame.attr("src", `${BASE_URI}overlay?example&title=${encodeURIComponent(title.val())}&font=${encodeURIComponent(font.val())}`);
    }

    title.on("change", updateUrl);
    font.on("change", updateUrl);

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

    $("#delete-reactions").on("click", function() {
        const confirmed = confirm("Are you sure you want to delete all reaction logs?\nThis can't be undone!");
        if (confirmed) {
            $.ajax("/api/reactionlogs/all", {
                method: "DELETE",
                success: function() {
                    const { close } = showAlert(deleteAlerts, "success", "Successfully deleted all reaction logs!");
                    $("#reactions").text("0");
                    $("#top-reactions").text("");
                    $("#no-logs").slideDown(250);
                    setInterval(function() {
                        close();
                    }, 2500);
                },
                error: function(xhr, status) {
                    const { close } = showAlert(deleteAlerts, "danger", "Failed to delete all reaction logs!");
                    setInterval(function() {
                        close();
                    }, 2500);
                },
            });
        }
    });

    form.on("submit", function(e) {
        const array = form.serializeArray();
        const object = {};
        array.forEach(val => {
            object[val.name] = val.value;
        });
        delete object.token;
        $.ajax("/api/settings", {
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify(object),
            success: function(data) {
                if (currentAlert) {
                    currentAlert.close();
                }
                if (data.ok) {
                    currentAlert = showAlert(alerts, "success", "Successfully updated settings!");
                } else {
                    currentAlert = showAlert(alerts, "danger", data.error, "An error occurred!");
                }
            },
            error: function(xhr, status, error) {
                if (currentAlert) {
                    currentAlert.close();
                }
                currentAlert = showAlert(alerts, "danger", "An unexpected error occurred!");
                console.log(status);
            }
        });

        e.preventDefault();
        return false;
    });

    updateUrl();
});