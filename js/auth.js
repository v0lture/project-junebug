/*global firebase:true projects:true states:true severity:true issues:true userDialog Materialize pagination moment:true */
/*eslint no-undef: "error"*/

// user ui dialogs
function flushUI(togglestate = false, toggleerror = false, e = false) {
    $(".login-box > .content").show();
    $(".login-box > .loading").hide();
    $(".login-err-wrap").hide();

    if(togglestate){
        $(".login-box > .loading").show();
        $(".login-box > .content").hide();
    } 

    if(toggleerror) {
        $(".login-err-wrap").show();
        $("#reg-err").text(e.message);
        $("#login-err").text(e.message);
    }
}

function userDialog(view = ""){  
    $(".login-box").hide();
    $(".login-box > .loading").hide();
    flushUI();

    if(view === "login" || view === "register" || view === "user" || view === "forgotpass"){
        $("#"+view+"-box").show();
    }
}

// email verification
function verifyEmail(){
    userDialog("user");
    flushUI(true);

    firebase.auth().currentUser.sendEmailVerification().then(() => {
        flushUI();
        Materialize.toast("Verification email sent, check your inbox.", 5000);
    }, (e) => {
        flushUI(false, true, e);
    });
}

function login(){
    var email = $("#login-email").val();
    var pass = $("#login-password").val();
    flushUI(true);

    firebase.auth().signInWithEmailAndPassword(email, pass).then(() => {
        userDialog("user");
    }).catch((e) => {
        flushUI(false, true, e);       
    });
}

function register() {
    var email = $("#reg-email").val();
    var pass = {1: $("#reg-password").val(), 2: $("#reg-conf-password").val()};

    if(pass[1] === pass[2]) {
        flushUI(true);

        // register
        firebase.auth().createUserWithEmailAndPassword(email, pass[1]).then(() => {
            userDialog("user");
            flushUI();
            verifyEmail();
        }).catch((e) => {
            flushUI(false, true, e);
        });
    } else {
        flushUI(true, true, {"message": "Your password does not match."});
    }
}

function logOut(){
    userDialog("login");
    flushUI(true);
    firebase.auth().signOut().then(function() {
        flushUI();
        userDialog();
        Materialize.toast("Logged out", 1000);
    }).catch(function(error) {
        flushUI(false, true, error);
    });
}

function recoverPass(){
    var email = $("#forgotpass-email").val();
    flushUI(true);

    firebase.auth().sendPasswordResetEmail(email).then(() => {
        flushUI();
        userDialog();
        Materialize.toast("Password recovery email sent.", 5000);
    }, (e) => {
        flushUI(false, false, e);
    });
}

function updateProfile(){
    var display = $("#profile-display").val();

    flushUI(true);
    firebase.auth().currentUser.updateProfile({displayName: display}).then(() => {
        flushUI();
        Materialize.toast("Profile updated successfully", 1500);
    }, (e) => {
        flushUI(false, true, e);
    });
}

firebase.auth().onAuthStateChanged((user) => {
    if(user){
        $("#auth-state").attr("onclick", "userDialog('user')").text("Hi "+user.email+".");
        $("#profile-email").val(user.email);
        $("#profile-display").val(user.displayName);

        $("#new-issue-user").html("Submitting this issue as <b>"+user.displayName+"</b> <small>"+user.email+"</small>. <a href='#' class='accent-text' onclick='userDialog(\"user\")'>Manage your profile</a>");

        if(user.emailVerified){
            $("#profile-email-verified").html("<i class='material-icons left accent-text'>done</i> Email is verified.");
        } else {
            $("#profile-email-verified").html("<i class='material-icons left accent-text'>warning</i> Email is <b>not</b> verified. <a onclick='verifyEmail()' class='accent-text'>Resend verification email.</a>");
        }
    } else {
        $("#auth-state").attr("onclick", "userDialog('login')").text("Not logged in.");
        $("#new-issue-user").html("Not logged in. <a href='#' onclick='userDialog(\"login\")' class='accent-text'>Log in</a>");
    }
});