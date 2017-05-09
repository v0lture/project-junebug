function userFromUID(uid, issueid = 0) {
    firebase.database().ref("/users/"+uid+"/").once("value").then((snapshot) => {
        console.log(snapshot.val());
        
        // no issueid
        if(issueid !== 0) {
            issues[issueid].display = snapshot.child('display').val();
            $("#issue-display-"+issueid).text(snapshot.child('display').val());
        }
    });
}