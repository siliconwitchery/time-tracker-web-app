(function () {

    // Initialise firebase
    const config = {
        apiKey: "AIzaSyDSFkooFFKBC0iKzSd8cBfe3bv5jWUxZYc",
        authDomain: "time-sheet-5d26c.firebaseapp.com",
        databaseURL: "https://time-sheet-5d26c-default-rtdb.europe-west1.firebasedatabase.app",
        projectId: "time-sheet-5d26c",
        storageBucket: "time-sheet-5d26c.appspot.com",
        messagingSenderId: "606472083737",
        appId: "1:606472083737:web:6ff99f7fdbd83fb6edcd88"
    };

    firebase.initializeApp(config);


    // Login flag
    var loggedIn = false;


    // Get elements 
    const txtEmail = document.getElementById('txtEmail');
    const txtPassword = document.getElementById('txtPassword');
    const selProject = document.getElementById('selProject');
    const txtTime = document.getElementById('txtTime');
    const txtDate = document.getElementById('txtDate');
    const txtDesc = document.getElementById('txtDesc');
    const btnSubmit = document.getElementById('btnSubmit');


    // Submit button event listener
    btnSubmit.addEventListener('click', e => {
        
        if (loggedIn == false) {
            // Get email and password
            const email = txtEmail.value;
            const pass = txtPassword.value;

            // const promise = firebase.auth()
            //                 .signInWithEmailAndPassword(email, pass);
            // promise.catch(function (error) {
               
            // });

            // Sign in
            firebase.auth().signInWithEmailAndPassword(email, pass)
            .then(function(firebaseUser) {
                document.getElementById('btnSubmit').innerHTML = "Sure?";
                loggedIn = true;
                
            })
            .catch(function(error) {
                console.log(error.message);
                document.getElementById('btnSubmit').innerHTML = "Bad user/pass";
            });

        } else {
            
            // Format data to send
            console.log('Sending data');
            const user = txtEmail.value
                .substring(0, txtEmail.value.lastIndexOf("@"))
                .toLowerCase();
            const project = selProject.value;
            const date = txtDate.value;

            // Send data
            firebase.database().ref(user).child(project).child(date).set({
                time: txtTime.value,
                note: txtDesc.value
            });

            // Log out
            const promise = firebase.auth().signOut();
            promise.catch(e => console.log(e.message));
            loggedIn = false;
            document.getElementById('btnSubmit').innerHTML = "Done";
        }
    })


    // Realtime auth listener
    firebase.auth().onAuthStateChanged(firebaseUser => {

        if (firebaseUser) {
            console.log('Authenticated callback');

        } else {
            console.log('Not logged in callback');
        }
    })

}());