(function () {

    // First we get the viewport height and we multiple it by 1% to get a value for a vh unit
    let vh = window.innerHeight * 0.01;
    // Then we set the value in the --vh custom property to the root of the document
    document.documentElement.style.setProperty('--vh', `${vh}px`);


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
    var selStaff = document.getElementById('selStaff');
    var txtTime = document.getElementById('txtTime');
    var txtDate = document.getElementById('txtDate');
    const txtDesc = document.getElementById('txtDesc');
    const btnSubmit = document.getElementById('btnSubmit');
    const btnReport = document.getElementById('btnReport');
    const tblReport = document.getElementById('tblReport');
    const divInterface = document.getElementById('divInterface');
    const divReport = document.getElementById('divReport');

    // Set default time
    document.getElementById('txtTime').value = "01:00";


    // Set default date
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
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

                    // Get staff list
                    var staffRef = firebase.database().ref('active-staff/');
                    staffRef.once("value", function (snapshot) {
                        snapshot.forEach(function (child) {

                            // Update selection menu
                            var newOption = document.createElement("option");
                            newOption.value = child.key.toString();
                            newOption.text = child.key.toString();
                            selStaff.add(newOption);

                            // Preselect the logged in user
                            if (txtEmail.value == child.val()) {
                                selStaff.value = child.key;
                            }
                        });
                    });

                    // Mark as logged in, then next click will submit the form
                    loggedIn = true;
                    document.getElementById('btnSubmit').innerHTML = "Submit?";

                    // Enable the report button
                    document.getElementById('btnReport').disabled = false;
                })

                // Otherwise
                .catch(function (error) {
                    console.error(error.message);
                    document.getElementById('btnSubmit')
                        .innerHTML = "Bad user/password";
                });

        } else /* Once logged in, and user clicks again */ {

            // Send data
            firebase.database().ref(selStaff.value)
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

                    // Clear dropdown lists
                    for (i = selProject.options.length - 1; i >= 0; i--) {
                        selProject.options[i] = null;
                    }

                    for (i = selStaff.options.length - 1; i >= 0; i--) {
                        selStaff.options[i] = null;
                    }

                    // Disable the report button
                    document.getElementById('btnReport').disabled = true;
                })

                // Otherwise
                .catch(function (error) {

                    // Or some logout error
                    console.error(error.message);
                    document.getElementById('btnSubmit')
                        .innerHTML = "Logout error";
                });
        }
    });


    // Report button event listener
    btnReport.addEventListener('click', e => {

        // Hide interface and show the report table
        divInterface.style.display = 'none';
        divReport.style.display = 'block';

        // For all staff
        var staffRef = firebase.database().ref('active-staff/');
        staffRef.once("value", function (staffSnapshot) {
            staffSnapshot.forEach(function (staff) {

                // For all projects
                var projRef = firebase.database().ref('active-projects/');
                projRef.once("value", function (projectSnapshot) {
                    projectSnapshot.forEach(function (project) {

                        // Variable to sum hours on this project
                        let totalMins = 0;

                        // For all dates
                        var dateRef = firebase.database()
                            .ref(staff.key + '/' + project.key);
                        dateRef.once("value", function (dateSnapshot) {
                            dateSnapshot.forEach(function (date) {

                                // Show only for the selected month
                                if (date.key.substr(0, 7) ==
                                    txtDate.value.substr(0, 7)) {

                                    // Populate table data
                                    tblReport.innerHTML +=
                                        `<tr>
                                            <td>${staff.key}</td>
                                            <td>${project.key}</td>
                                            <td>${date.val()['time']}</td>
                                            <td>${date.key}</td>
                                            <td>${date.val()['note']}</td>
                                         </tr>`;

                                    // Keep a running total of mins
                                    var t = date.val()['time'].split(':');
                                    totalMins += +t[0] * 60 + +t[1];
                                }
                            });

                            // Write total time
                            if (totalMins > 0) {

                                // Convert mins to HH:mm
                                function z(n) {
                                    return (n < 10 ? '0' : '') + n;
                                }
                                var h = (totalMins / 60 | 0);
                                var m = totalMins % 60;

                                tblReport.innerHTML +=
                                    `<tr>
                                        <td></td>
                                        <td></td>
                                        <td class="tb">${z(h) + ':' + z(m)}</td>
                                     </tr>`;
                            }
                        });
                    });
                });
            });
        });
    })

}());