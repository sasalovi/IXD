var artyom = new Artyom();
var sessionStarted = new Boolean(true);
var airport = new String();
var personCount = new Int16Array();
var dayOfDeparture = new Int16Array();
var monthOfDeparture = new String();
var timeOfDeparture = new String();
var additionalLuggage = new Boolean(false); //Check if false is working
var paymentMethod = new String();

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
        }, 250);
    }
    startContinuousArtyom();
});


function StartVUI() {
    if (sessionStarted) {
        IntroPrompt();
        sessionStarted = false; //Make sure that the session cant be restartet several times in a row
    }
}


function IntroPrompt() {
    artyom.newPrompt({
        question: "Hello Markus. This is a reminder to book a flight for your business meeting on "+dayOfMeeting+" November in Barcelona. Do you want to book now?",
        options: ["Yes", "Yes please", "No I already booked one", "no", "no please remind me tomorrow"],
        beforePrompt: () => {
            console.log("Before ask");      
        },
        onStartPrompt: () => {
            console.log("The prompt is being executed");
        },
        onEndPrompt: () => {
            console.log("The prompt has been executed succesfully");
            document.getElementById("answerTextbox").textContent = "'Yes' / 'Yes please' / 'No, I already booked one' / 'No' / 'No please remind me tomorrow'";
        },
        onMatch: (i) => {
            var action;

            if (i == 0 || i == 1) { //Answer Yes OR Yes please
                action = () => {
                    
                    BookingAirport();
                }
            }

            if (i == 2) { //Answer: No, I already booked one
                action = () => {
                    DepartureReminder1();
                }
            }

            if (i == 3) { //Answer: No
                action = () => {
                    RemindMeTomorrow();
                }
            }

            if (i == 4) {
                action = () => {
                   ReminderSetTomorrow();
                }
            }
            return action;
        }
    })
}

function DepartureReminder1() {
    artyom.newPrompt({
        question: "OK, do you want me to set a departure reminder?",
        smart: false,
        options: ["Yes", "Sure", "Yes sure", "No", "No thanks"],
        beforePrompt: () => {
            console.log("Before ask");
        },
        onStartPrompt: () => {
            console.log("The prompt is being executed");
        },
        onEndPrompt: () => {
            console.log("The prompt has been executed succesfully");
            document.getElementById("answerTextbox").textContent = "'Yes' / 'Sure' / 'Yes sure' / 'No' / 'No thanks'";
        },
        onMatch: (i, wildcard) => {
            var action;

            if (i == 0 || i == 1 || i == 2) {
                action = () => {
                    DepartureReminderAirport();
                }
            }

            if (i == 3 || i == 4) {
                action = () => {
                    artyom.say("Okay.")
                    artyom.fatality();
                }
            }
            return action;
        }
    })
}

function DepartureReminderAirport() {
    artyom.newPrompt({
        question: "OK. From which airport do you take off?", //Text angepasst
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
            document.getElementById("answerTextbox").textContent = "'From ...'";
        },
        onMatch: (i, wildcard) => {
            var action;

            if (i == 0) {
                action = () => {
                    airport = wildcard;
                    DepartureReminderDate();
                }
            }

            return action;
        }
    })
}

function DepartureReminderDate() {
    artyom.newPrompt({
        question: "Got it. Now, could you please tell me the date of your departure?", //Text angepasst
        smart: true,
        options: ["on *", "on the *", "the *"],
        beforePrompt: () => {
            console.log("Before ask");
        },
        onStartPrompt: () => {
            console.log("The prompt is being executed");
        },
        onEndPrompt: () => {
            console.log("The prompt has been executed succesfully");
            document.getElementById("answerTextbox").textContent = "'On ...' / 'On the ...' / 'The ...'";
        },
        onMatch: (i, wildcard) => {
            var action;

            if (i == 0 || i == 1 || i == 2) {
                action = () => {
                    monthOfDeparture = CheckForMonth(wildcard);

                    if (monthOfDeparture != null) {
                        console.log(monthOfDeparture);
                        var regex = /\d+/g;
                        var matches = wildcard.match(regex);
                        dayOfDeparture = parseInt(matches);
                        console.log(dayOfDeparture);
                        DepartureReminderTime();
                    } else {
                        artyom.say("Sorry, I didnt quite catch that.")
                        DepartureReminderDate(); //Repeat this segment because the date was missing in the input
                    }
                }
            }

            return action;
        }
    })
}

function DepartureReminderTime() {
    artyom.newPrompt({
        question: "Alright. Now please tell me the time of your departure.", //Text angepasst
        smart: true,
        options: ["*", "at *"],
        beforePrompt: () => {
            console.log("Before ask");
        },
        onStartPrompt: () => {
            console.log("The prompt is being executed");
        },
        onEndPrompt: () => {
            console.log("The prompt has been executed succesfully");
            document.getElementById("answerTextbox").textContent = "'...' / 'At ...'";
        },
        onMatch: (i, wildcard) => {
            var action;

            if (i == 0 || i == 1) {
                action = () => {
                        var regex = /\d+/g;
                        var matches = wildcard.match(regex);
                        timeOfDeparture = parseInt(matches);
                        console.log(timeOfDeparture);

                        artyom.say("Thanks. I created a notification for the "+ dayOfDeparture+monthOfDeparture+" at "+timeOfDeparture);

                        RemindMeOneDayAhead();
                }
            }

            return action;
        }
    })
}

function RemindMeOneDayAhead() {
    artyom.newPrompt({
        question: "Do you want me to set a reminder one day ahead??",
        smart: false,
        options: ["Yes", "Sure", "Yes sure", "No", "No thanks"],
        beforePrompt: () => {
            console.log("Before ask");
        },
        onStartPrompt: () => {
            console.log("The prompt is being executed");
        },
        onEndPrompt: () => {
            console.log("The prompt has been executed succesfully");
            document.getElementById("answerTextbox").textContent = "'Yes' / 'Sure' / 'Yes sure' / 'No' / 'No thanks'";
        },
        onMatch: (i, wildcard) => {
            var action;

            if (i == 0 || i == 1 || i == 2) {
                action = () => {
                    artyom.say("OK, I just set a reminder for you.")
                }
            }

            if (i == 3 || i == 4) {
                action = () => {
                    artyom.say("Okay.")
                    artyom.fatality();
                }
            }
            return action;
        }
    })
}



function RemindMeTomorrow() {
    artyom.newPrompt({
        question: "Do you want me to set a reminder for tomorrow?", //Text angepasst
        smart: false,
        options: ["Yes", "Sure", "Yes sure", "No", "No thanks"],
        beforePrompt: () => {
            console.log("Before ask");
        },
        onStartPrompt: () => {
            console.log("The prompt is being executed");
        },
        onEndPrompt: () => {
            console.log("The prompt has been executed succesfully");
            document.getElementById("answerTextbox").textContent = "'Yes' / 'Sure' / 'Yes sure' / 'No' / 'No thanks'";
        },
        onMatch: (i, wildcard) => {
            var action;

            if (i == 0 || i == 1 || i == 2) {
                action = () => {
                    ReminderSetTomorrow();
                }
            }

            if (i == 3 || i == 4) {
                action = () => {
                    artyom.say("Okay.")
                    artyom.fatality();
                }
            }
            return action;
        }
    })
}

function ReminderSetTomorrow(){
    artyom.say("OK. I am going to remind you tomorrow at the same time.");
    artyom.fatality();
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
            document.getElementById("answerTextbox").textContent = "'From ...";
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
            document.getElementById("answerTextbox").textContent = "'Yes' / 'Sure' / 'Yes sure' / 'No' / 'No thanks'";
        },
        onMatch: (i) => {
            var action;


            if (i == 0 || i == 1) {
                action = () => {
                    personCount = 1;
                    console.log(personCount);
                    artyom.say("Okay.");
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
            document.getElementById("answerTextbox").textContent = "'... people' / '...' / '... persons' / 'I would like to add ... persons'";
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
        question: "When would you like to go?", 
        smart: true,
        options: ["* day before my meeting" , "* days before my meeting", "on *", "on the *"],
        beforePrompt: () => {
            console.log("Before ask");
        },
        onStartPrompt: () => {
            console.log("The prompt is being executed");
        },
        onEndPrompt: () => {
            console.log("The prompt has been executed succesfully");
            document.getElementById("answerTextbox").textContent = "'... day before my meeting' / '... days before my meeting' / 'On ...' / 'On the ...'";
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

            if (i == 2 || i == 3) {
                action = () => {                   
                    monthOfDeparture = CheckForMonth(wildcard);

                    if (monthOfDeparture != null) {
                        console.log(monthOfDeparture);
                        var regex = /\d+/g;
                        var matches = wildcard.match(regex);
                        dayOfDeparture = parseInt(matches);
                        console.log(dayOfDeparture);
                        ChooseDepartureTime();
                    } else {
                        BookingDate(); //Repeat this segment because the date was missing in the input
                    }
                }
            }
            return action;
        }
    })
}

function CheckForMonth(_month) {
var foundMonth = new String();
    if (_month.includes("january")) {
        foundMonth = "january";
    } else if (_month.includes("february")) {
        foundMonth = "february";
    } else if (_month.includes("march")) {
        foundMonth = "march";
    } else if (_month.includes("april")) {
        foundMonth = "april";
    } else if (_month.includes("may")) {
        foundMonth = "may";
    } else if (_month.includes("june")) {
        foundMonth = "june";
    } else if (_month.includes("july")) {
        foundMonth = "july";
    } else if (_month.includes("august")) {
        foundMonth = "august";
    } else if (_month.includes("september")) {
        foundMonth = "september";
    } else if (_month.includes("october")) {
        foundMonth = "october";
    } else if (_month.includes("november")) {
        foundMonth = "November";
    } else if (_month.includes("december")) {
        foundMonth = "december";
    } else {
        return null;
    }

    return foundMonth;
}


function ChooseDepartureTime() {

    artyom.newPrompt({
        question: "For" + monthOfDeparture + dayOfDeparture + ", would you like to book the 11 AM, 2 PM, or 6 PM flight from" + airport + "to Barcelona?",
        smart: false,
        options: ["11am", "2pm", "6pm", "could you please repeat that", "please repeat"],
        beforePrompt: () => {
            console.log("Before ask");
        },
        onStartPrompt: () => {
            console.log("The prompt is being executed");
        },
        onEndPrompt: () => {
            console.log("The prompt has been executed succesfully");
            document.getElementById("answerTextbox").textContent = "'11am' / '2pm' / '6pm' / 'Could you please repeat that?' / 'Please repeat'";
        },
        onMatch: (i) => {
            var action;


            if (i == 0) {
                action = () => {
                    timeOfDeparture = "11am";
                    artyom.say("Sure, this Economy Class flight at "+timeOfDeparture+" would cost 200 Euro.");
                    FurtherInquiries();
                }
            }

            if (i == 1) {
                action = () => {
                    timeOfDeparture = "2pm";
                    artyom.say("Sure, this Economy Class flight at "+timeOfDeparture+" would cost 200 Euro.");
                    FurtherInquiries();
                }
            }

            if (i == 2) {
                action = () => {
                    timeOfDeparture = "6pm";
                    artyom.say("Sure, this Economy Class flight at "+timeOfDeparture+" would cost 200 Euro.");
                    FurtherInquiries();  
                }
            }

            if (i == 3 || i == 4) {
                action = () => {
                    ChooseDepartureTime(); //Repeat
                }
            }
            return action;
        }
    })
}

function FurtherInquiries() {

    artyom.newPrompt({
        question: "Do you have any other inquiries?",
        smart: false,
        options: ["No","How much luggage can I take with me", "what about luggage", "can I take luggage with me"],
        beforePrompt: () => {
            console.log("Before ask");
        },
        onStartPrompt: () => {
            console.log("The prompt is being executed");
        },
        onEndPrompt: () => {
            console.log("The prompt has been executed succesfully");
            document.getElementById("answerTextbox").textContent = "'No' / 'How much luggage can I take with me?' / 'What about luggage?' / 'Can I take luggage with me?'";
        },
        onMatch: (i) => {
            var action;


            if (i == 0) {
                action = () => {
                    SummarizeOrder();                 
                }
            }

            if (i == 1 || i == 2 || i == 3) {
                action = () => {
                    ChooseLuggage();
                    
                }
            }
            return action;
        }
    })
}

function ChooseLuggage() {

    artyom.newPrompt({
        question: "Only cabin luggage. Do you want me to register another bag for additional 30 Euro?",
        smart: false,
        options: ["No", "No thanks","Yes", "Yes please", "yes I would like that"],
        beforePrompt: () => {
            console.log("Before ask");
        },
        onStartPrompt: () => {
            console.log("The prompt is being executed");
        },
        onEndPrompt: () => {
            console.log("The prompt has been executed succesfully");
            document.getElementById("answerTextbox").textContent = "'Yes' / 'Yes I would like that' / 'Yes please' / 'No' / 'No thanks'";
        },
        onMatch: (i) => {
            var action;


            if (i == 0 || i == 1) {
                action = () => {
                    artyom.say("Okay.");
                    FurtherInquiries();                 
                }
            }

            if (i == 2 || i == 3 || i == 4) {
                action = () => {
                additionalLuggage = true;
                artyom.say("Got it. I added the additional bag to the cart.");
                FurtherInquiries();
                    
                }
            }
            return action;
        }
    })
}

function SummarizeOrder() {
    var dynamicLuggageTextSegment;

    if (luggage === true) {
         dynamicLuggageTextSegment = "with one additional bag of luggage.";
    } else {
        dynamicLuggageTextSegment = ".";
    }

    artyom.say("Finally summarized, you have selected a Economy Class flight from "+airport+" for the "+dayOfDeparture + monthOfDeparture +" at "+timeOfDeparture+dynamicLuggageTextSegment);
    ConfirmOrder();
}

function ConfirmOrder() {

    artyom.newPrompt({
        question: "Do you confirm this order?",
        smart: false,
        options: ["No", "No i dont","Yes", "Yes please", "Sure", "could you please repeat that", "please repeat"],
        beforePrompt: () => {
            console.log("Before ask");
        },
        onStartPrompt: () => {
            console.log("The prompt is being executed");
        },
        onEndPrompt: () => {
            console.log("The prompt has been executed succesfully");
            document.getElementById("answerTextbox").textContent = "'Yes' / 'Yes please' / 'Sure' / 'No' / 'No I dont' / 'Could you please repeat that?' / 'Please repeat'";
        },
        onMatch: (i) => {
            var action;


            if (i == 0 || i == 1) {
                action = () => {
                    FurtherInquiries();                 
                }
            }

            if (i == 2 || i == 3 || i == 4) {
                action = () => {
                ChoosePaymentMethod(); //Noch einbauen
                    
                }
            }

            if (i == 5 || i == 6) {
                action = () => {
                SummarizeOrder();
                    
                }
            }
            return action;
        }
    })
}

function ChoosePaymentMethod() {

    artyom.newPrompt({
        question: "To conclude, do you want to pay the 230 Euro with PayPal or MasterCard?",
        smart: false,
        options: ["With MasterCard", "MasterCard", "With PayPal", "PayPal", "could you please repeat that", "please repeat"],
        beforePrompt: () => {
            console.log("Before ask");
        },
        onStartPrompt: () => {
            console.log("The prompt is being executed");
        },
        onEndPrompt: () => {
            console.log("The prompt has been executed succesfully");
            document.getElementById("answerTextbox").textContent = "'With MasterCard' / 'MasterCard' / 'With PayPal' / 'PayPal' / 'Could you please repeat that?' / 'Please repeat'";
        },
        onMatch: (i) => {
            var action;


            if (i == 0 || i == 1) {
                action = () => {
                    paymentMethod = "MasterCard";
                    ChooseReminder();                 
                }
            }

            if (i == 2 || i == 3) {
                action = () => {
                    paymentMethod = "PayPal";
                    ChooseReminder(); //Noch einbauen     
                }
            }

            if (i == 4 || i == 5) {
                action = () => {
                    ChoosePaymentMethod();    
                }
            }
            return action;
        }
    })
}

function ChooseReminder() {

    artyom.newPrompt({
        question: "Sure. This flight was successfully booked. Do you want me to set a reminder one day ahead?",
        smart: false,
        options: ["No", "No thanks","Yes", "Yes please", "Sure"],
        beforePrompt: () => {
            console.log("Before ask");
        },
        onStartPrompt: () => {
            console.log("The prompt is being executed");
        },
        onEndPrompt: () => {
            console.log("The prompt has been executed succesfully");
            document.getElementById("answerTextbox").textContent = "'Yes' / 'Sure' / 'Yes please' / 'No' / 'No thanks'";
        },
        onMatch: (i) => {
            var action;


            if (i == 0 || i == 1) {
                action = () => {
                    artyom.say("Alright, have a good journey!");               
                }
            }

            if (i == 2 || i == 3 || i == 4) {
                action = () => {
                    artyom.say("Alright, I have set a reminder for "+ dayOfDeparture-1 + monthOfDeparture+ "2020. Have a good journey!"); //ANgepasst im Vergleich zum Konzept 
                }
            }

            return action;
        }
    })
}