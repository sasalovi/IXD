var artyom = new Artyom();
var sessionStarted = new Boolean(true);
var airport = new String();
var personCount = new Int16Array();
var dayOfDeparture = new Int16Array();
var monthOfDeparture = new String();
var timeOfDeparture = new String();
var additionalLuggage = new Boolean(false); //Check if false is working

var dayOfMeeting = new Int16Array();
var monthOfMeeting = new String();


window.addEventListener("load", function () {
    dayOfMeeting = 22;
    monthOfMeeting = "November";

    function startContinuousArtyom() {
        artyom.fatality();
        setTimeout(function () {
            artyom.initialize({
                lang: "en-US",
                continuous: true,
                listen: true,
                interimResults: true,
                debug: true
            }).then(function () {
                console.log("Ready!");
            });
        }, 5000);
    }
    startContinuousArtyom();
});

window.addEventListener("click", function () {
    console.log(sessionStarted);
    if (sessionStarted) {
        console.log("Entered");
        IntroPrompt();
        sessionStarted = false;
    }
});


function IntroPrompt() {
    artyom.newPrompt({
        question: "Hello Markus. This is a reminder to book a flight for your business meeting on 22nd November in Barcelona. Do you want to book now?",
        options: ["Yes", "Yes please", "No I already booked one", "no", "no please remind me tomorrow"],
        beforePrompt: () => {
            console.log("Before ask");
        },
        onStartPrompt: () => {
            console.log("The prompt is being executed");
        },
        onEndPrompt: () => {
            console.log("The prompt has been executed succesfully");
        },
        onMatch: (i) => { // i returns the index of the given options
            var action;

            if (i == 0 || i == 1) {
                action = () => {
                    //artyom.say("");
                    BookingAirport();
                }
            }

            if (i == 2) {
                action = () => {
                    artyom.say("OK, do you want me to set a departure reminder?");
                }
            }

            if (i == 3) {
                action = () => {
                    artyom.say("Do you want me to set a reminder?");
                    //Funktion: NoStep2();
                }
            }

            if (i == 4) {
                action = () => {
                    artyom.say("OK. I am going to remind you tomorrow at the same time.");
                    artyom.fatality();
                }
            }

            // A function needs to be returned in onMatch event
            // in order to accomplish what you want to execute
            return action;
        }
    })
}

function BookingAirport() {
    artyom.newPrompt({
        question: "OK. First of all, from which airport do you want to take off?",
        smart: true,
        options: ["From *"],
        beforePrompt: () => {
            console.log("Before ask");
        },
        onStartPrompt: () => {
            console.log("The prompt is being executed");
        },
        onEndPrompt: () => {
            console.log("The prompt has been executed succesfully");
        },
        onMatch: (i, wildcard) => {
            var action;
            airport = wildcard;
            console.log(airport);
            if (i == 0) {
                action = () => {
                    artyom.say("Great, your departure is from" + wildcard + ".");
                    BookingPersonCount();
                }
            }
            return action;
        }
    })
}

function BookingPersonCount() {
    artyom.newPrompt({
        question: "Would you like to add another person to your flight?", //Alternative zu meinem Konzept
        smart: false,
        options: ["No", "No thanks", "Yes", "Sure", "Yes sure"],
        beforePrompt: () => {
            console.log("Before ask");
        },
        onStartPrompt: () => {
            console.log("The prompt is being executed");
        },
        onEndPrompt: () => {
            console.log("The prompt has been executed succesfully");
        },
        onMatch: (i) => {
            var action;


            if (i == 0 || i == 1) {
                action = () => {
                    personCount = 1;
                    console.log(personCount);
                    BookingDate();
                }
            }

            if (i == 2 || i == 3 || i == 4) {
                action = () => {
                    //artyom.say("Okay, I added" + wildcard + "persons.");
                    AddPersons();
                }
            }
            return action;
        }
    })
}

function AddPersons() { 
    artyom.newPrompt({
        question: "How many persons would you like to add?", //Alternative zu meinem Konzept
        smart: true,
        options: ["* people", "*", "* persons", "I would like to add * persons"],
        beforePrompt: () => {
            console.log("Before ask");
        },
        onStartPrompt: () => {
            console.log("The prompt is being executed");
        },
        onEndPrompt: () => {
            console.log("The prompt has been executed succesfully");
        },
        onMatch: (i, wildcard) => {
            var action;
            personCount = parseInt(wildcard);
            console.log(personCount);

            if (i == 0 || i == 1 || i == 2 || i == 3) {
                action = () => {
                    artyom.say("Alright, I will continue to book a flight for "+ personCount+" persons.");
                    BookingDate();
                }
            }

            return action;
        }
    })
}



function BookingDate() { 
    artyom.newPrompt({
        question: "OK, when would you like to go?", 
        smart: true,
        options: ["* day before my meeting" , "* days before my meeting", "on the *"],
        beforePrompt: () => {
            console.log("Before ask");
        },
        onStartPrompt: () => {
            console.log("The prompt is being executed");
        },
        onEndPrompt: () => {
            console.log("The prompt has been executed succesfully");
        },
        onMatch: (i, wildcard) => {
            var action;
            

            if (i == 0 || i == 1) {
                action = () => {
                dayOfDeparture = dayOfMeeting - parseInt(wildcard);
                monthOfDeparture = monthOfMeeting;
                console.log(dayOfDeparture);
                    ChooseDepartureTime();
                }
            }

            if (i == 2) {
                action = () => {
                    //artyom.say("Okay, I added" + wildcard + "persons.");
                    BookingPersonCount(); //NOT FINISHED!!!
                }
            }
            return action;
        }
    })
}

function ChooseDepartureTime() { 
console.log(monthOfDeparture);
console.log(dayOfDeparture);
    artyom.newPrompt({
        question: "For" + monthOfDeparture + dayOfDeparture + ", would you like to book the 11 AM, 2 PM, or 6 PM flight from" + airport + "to Barcelona?",
        smart: true,
        options: ["* people", "I am * alone"],
        beforePrompt: () => {
            console.log("Before ask");
        },
        onStartPrompt: () => {
            console.log("The prompt is being executed");
        },
        onEndPrompt: () => {
            console.log("The prompt has been executed succesfully");
        },
        onMatch: (i, wildcard) => {
            var action;
            personCount = parseInt(wildcard);
            console.log(personCount);

            if (i == 0) {
                action = () => {
                    artyom.say("Okay, I will continue to book a flight for * persons.");
                }
            }

            if (i == 1) {
                action = () => {
                    //artyom.say("Okay, I added" + wildcard + "persons.");
                    BookingPersonCount();
                }
            }
            return action;
        }
    })
}