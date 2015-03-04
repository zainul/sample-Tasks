var everlive = require("../lib/everlive");
var dialogs = require("ui/dialogs");
var buttonModule = require("ui/button");
var frameModule = require("ui/frame");
var view = require("ui/core/view");
var app = require("application");
var localSettings = require("local-settings");
var platformModule = require("platform");

app.onUncaughtError = function (error) {
    dialogs.alert("Uncaught error[" + JSON.stringify(error) + "]");    
}

onNavigatedTo = function (args) {
    if (platformModule.device.os == ANDROID_OS_NAME) {
        frameModule.topmost().android.actionBar.hide();
    }
}
exports.onNavigatedTo = onNavigatedTo;

var page;
function pageLoaded(args) {
    page = args.object;
    global.topMostFrame = frameModule.topmost();
    var authToken = localSettings.getString(TOKEN_DATA_KEY);
    if (authToken) {
        frameModule.topmost().navigate("app/views/main");
    }
}

exports.pageLoaded = pageLoaded;

function loginTap(args) {
    var usernameField = view.getViewById(page, "username");
    if (usernameField.text == "") {
        dialogs.alert("Please enter username.");
        return;
    }

    var passwordField = view.getViewById(page, "password");
    if (passwordField.text == "") {
        dialogs.alert("Please enter password.");
        return;
    }

    var el = new everlive(global.TELERIK_BAAS_KEY);
    var activityIndicator = view.getViewById(page, "activityIndicator");
    activityIndicator.busy = true;

    el.Users.login(usernameField.text, // username
        passwordField.text, // password
        function (data) 
        {
            activityIndicator.busy = false;
            saveToken(data.result.access_token);
            frameModule.topmost().navigate("app/views/main");
        },
        function (error) {
            activityIndicator.busy = false;
            dialogs.alert({
                    title: "Error logging you in!",
                    message : error.message,
                    okButtonText: "Close"
            });
        }
    );
}
exports.loginTap = loginTap;

function registerTap(args) {
    frameModule.topmost().navigate("app/views/editUser");
}
exports.registerTap = registerTap;

function saveToken(token) {
    localSettings.setString("authenticationToken", token);
}