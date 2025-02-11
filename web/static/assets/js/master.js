/**
 * Show an alert
 * @param parentElement
 * @param theme {"success"|"danger"|"info"}
 * @param text {string}
 * @param header {string}
 */
function showAlert(parentElement, theme, text, header = null) {
    const alert = $('<div class="alert alert-clickable" style="display: none;"></div>');
    alert.addClass("alert-" + theme);
    if (header) {
        const headerEle = $("<strong></strong>");
        headerEle.text(header);
        alert.append(headerEle);
    }
    const textEle = $("<span></span>");
    textEle.text(text);
    alert.append(textEle);
    function close() {
        alert.slideUp(250);
        setTimeout(function() {
            alert.remove();
        }, 250);
    }
    alert.on("click", close);
    parentElement.append(alert);
    alert.slideDown(250);

    return { alert, close };
}
