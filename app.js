(function () {

    // Initialize firebase
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


    // Get elements 
    const txtEmail = document.getElementById('txtEmail');
    const txtPassword = document.getElementById('txtPassword');
    var selProject = document.getElementById('selProject');
    var txtTime = document.getElementById('txtTime');
    var txtDate = document.getElementById('txtDate');
    const txtDesc = document.getElementById('txtDesc');
    const btnSubmit = document.getElementById('btnSubmit');
    const btnReport = document.getElementById('btnReport');


    // Set default time
    document.getElementById('txtTime').value = "01:00";


    // Set default date
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    document.getElementById('txtDate').value = yyyy + '-' + mm + '-' + dd;


    // Variable to check state
    var loggedIn = false;


    // Submit button event listener
    btnSubmit.addEventListener('click', e => {

        // If not logged in, log in and get the list of projects
        if (loggedIn == false) {

            // Sign in
            firebase.auth()
                .signInWithEmailAndPassword(txtEmail.value, txtPassword.value)

                // If successful
                .then(function (firebaseUser) {

                    // Get project list
                    var projRef = firebase.database().ref('active-projects/');
                    projRef.once("value", function (snapshot) {
                        snapshot.forEach(function (child) {

                            // Update selection menu
                            var newOption = document.createElement("option");
                            newOption.value = child.key.toString();
                            newOption.text = child.key.toString();
                            selProject.add(newOption);
                        });
                    });

                    // Mark as logged in, then next click will submit the form
                    loggedIn = true;
                    document.getElementById('btnSubmit').innerHTML = "Submit?";
                })

                // Otherwise
                .catch(function (error) {
                    console.error(error.message);
                    document.getElementById('btnSubmit')
                        .innerHTML = "Bad user/password";
                });

        } else /* Once logged in, and user clicks again */ {

            // Format user name for database entry
            const user = txtEmail.value
                .substring(0, txtEmail.value.lastIndexOf("@"))
                .toLowerCase();

            // Send data
            firebase.database().ref(user)
                .child(selProject.value)
                .child(txtDate.value)
                .set({
                    time: txtTime.value,
                    note: txtDesc.value
                });

            // Log out
            firebase.auth().signOut()

                // If okay
                .then(function () {

                    // Clear flag
                    loggedIn = false;
                    document.getElementById('btnSubmit')
                        .innerHTML = "Done. Logged out";

                    // Clear dropdown list
                    var length = selProject.options.length;
                    for (i = length - 1; i >= 0; i--) {
                        selProject.options[i] = null;
                    }
                })

                // Otherwise
                .catch(function (error) {

                    // Or some logout error
                    console.error(error.message);
                    document.getElementById('btnSubmit')
                        .innerHTML = "Logout error";
                });
        }
    })
}());