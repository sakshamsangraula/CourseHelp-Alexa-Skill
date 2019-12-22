// Lambda Function code for Alexa.
// Paste this into your index.js file. 

const Alexa = require("ask-sdk");
const https = require("https");



const invocationName = "course help";

// Session Attributes 
//   Alexa will track attributes for you, by default only during the lifespan of your session.
//   The history[] array will track previous request(s), used for contextual Help/Yes/No handling.
//   Set up DynamoDB persistence to have the skill save and reload these attributes between skill sessions.

function getMemoryAttributes() {   const memoryAttributes = {
       "history":[],


       "launchCount":0,
       "lastUseTimestamp":0,

       "lastSpeechOutput":{},
       // "nextIntent":[]

       // "favoriteColor":"",
       // "name":"",
       // "namePronounce":"",
       // "email":"",
       // "mobileNumber":"",
       // "city":"",
       // "state":"",
       // "postcode":"",
       // "birthday":"",
       // "bookmark":0,
       // "wishlist":[],
   };
   return memoryAttributes;
};

const maxHistorySize = 20; // remember only latest 20 intents 


// 1. Intent Handlers =============================================

const AMAZON_FallbackIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.FallbackIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let previousSpeech = getPreviousSpeechOutput(sessionAttributes);

        return responseBuilder
            .speak('Sorry I did not catch what you said, ' + stripSpeak(previousSpeech.outputSpeech))
            .reprompt(stripSpeak(previousSpeech.reprompt))
            .getResponse();
    },
};

const AMAZON_CancelIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.CancelIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();


        let say = 'Okay, talk to you later! ';

        return responseBuilder
            .speak(say)
            .withShouldEndSession(true)
            .getResponse();
    },
};

const AMAZON_HelpIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.HelpIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let history = sessionAttributes['history'];
        let intents = getCustomIntents();
        let sampleIntent = randomElement(intents);

        let say = 'You asked for help. '; 

        let previousIntent = getPreviousIntent(sessionAttributes);
        if (previousIntent && !handlerInput.requestEnvelope.session.new) {
             say += 'Your last intent was ' + previousIntent + '. ';
         }
        // say +=  'I understand  ' + intents.length + ' intents, '

        say += ' Here something you can ask me, ' + getSampleUtterance(sampleIntent);

        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const AMAZON_StopIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.StopIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();


        let say = 'Okay, talk to you later! ';

        return responseBuilder
            .speak(say)
            .withShouldEndSession(true)
            .getResponse();
    },
};

const AMAZON_NavigateHomeIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.NavigateHomeIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from AMAZON.NavigateHomeIntent. ';


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const GetPreRequisites_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'GetPreRequisites' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = '';

        let slotStatus = '';
        let resolvedSlot;

        let slotValues = getSlotValues(request.intent.slots); 
        // getSlotValues returns .heardAs, .resolved, and .isValidated for each slot, according to request slot status codes ER_SUCCESS_MATCH, ER_SUCCESS_NO_MATCH, or traditional simple request slot without resolutions

        // console.log('***** slotValues: ' +  JSON.stringify(slotValues, null, 2));
        //   SLOT: class 
        if (slotValues.class.heardAs && slotValues.class.heardAs !== '') {
            slotStatus += ' slot class was heard as ' + slotValues.class.heardAs + '. ';
        } else {
            slotStatus += 'slot class is empty. ';
        }
        if (slotValues.class.ERstatus === 'ER_SUCCESS_MATCH') {
            slotStatus += 'a valid ';
            if(slotValues.class.resolved !== slotValues.class.heardAs) {
                slotStatus += 'synonym for ' + slotValues.class.resolved + '. '; 
                } else {
                slotStatus += 'match. '
            } // else {
                //
        }
        if (slotValues.class.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += 'which did not match any slot value. ';
            console.log('***** consider adding "' + slotValues.class.heardAs + '" to the custom slot type used by slot class! '); 
        }

        if( (slotValues.class.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.class.heardAs) ) {
           // slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('GetPreRequisites','class'), 'or');
        }

        say += slotStatus;
        if(slotValues && slotValues.class){
            var c = slotValues.class.heardAs;
            if(c === `cs 1200` || c === `cs 1136`|| c === `1336`|| c === `math 2417`|| c === `math 2413`|| c === `ecs 1100`|| c === `univ 1010`){
                say = `${c} doesn't have a prerequisite!`;
            }
        } else{
            say = `Sorry, I didn't understand. Please try again`;
        }


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const GetBestProfessor_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'GetBestProfessor' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = '';

        let slotStatus = '';
        let resolvedSlot;

        let slotValues = getSlotValues(request.intent.slots); 
        // getSlotValues returns .heardAs, .resolved, and .isValidated for each slot, according to request slot status codes ER_SUCCESS_MATCH, ER_SUCCESS_NO_MATCH, or traditional simple request slot without resolutions

        // console.log('***** slotValues: ' +  JSON.stringify(slotValues, null, 2));
        //   SLOT: course 
        if (slotValues.course.heardAs && slotValues.course.heardAs !== '') {
            slotStatus += ' slot course was heard as ' + slotValues.course.heardAs + '. ';
        } else {
            slotStatus += 'slot course is empty. ';
        }
        if (slotValues.course.ERstatus === 'ER_SUCCESS_MATCH') {
            slotStatus += 'a valid ';
            if(slotValues.course.resolved !== slotValues.course.heardAs) {
                slotStatus += 'synonym for ' + slotValues.course.resolved + '. '; 
                } else {
                slotStatus += 'match. '
            } // else {
                //
        }
        if (slotValues.course.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += 'which did not match any slot value. ';
            console.log('***** consider adding "' + slotValues.course.heardAs + '" to the custom slot type used by slot course! '); 
        }

        if( (slotValues.course.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.course.heardAs) ) {
           // slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('GetBestProfessor','course'), 'or');
        }

       say += slotStatus;
        
        // Using selection logic to provide feedback about specific professors. 
        if(slotValues.course.heardAs === `cs 3305`){
            say = `Timothy Farage is the best professor for cs 3305 with 65% of students receiving a grade more than or equal to A minus`;
        }
         if(slotValues.course.heardAs === 'cs 3377'){
            say = 'Bhanu Kapoor is the best professor for cs 3377 with 69% of students receiving a grade more than or equal to A minus';
        } 
        if(slotValues.course.heardAs === `cs 3345`){
            say = 'Anjum Chida is the best professor for cs 3345 with 78% of students receiving a grade more than or equal to A minus';
        } 
        if(slotValues.course.heardAs === `cs 3341`){
            say = 'William Semper is the best professor for cs 3341 with 62% of students receiving a grade more than or equal to A minus';
        }
        if(slotValues.course.heardAs === `cs 2336`){
            say = 'Mehra Borazjany is the best professor for cs 2336 with 76% of students receiving a grade more than or equal to A minus';
        }
        if(slotValues.course.heardAs === `cs 2337`){
            say = 'Don Vogel is the best professor for cs 2337 with more than 3.5 rating in rate my professor website';
        }
        if(slotValues.course.heardAs === `cs 2305`){
            say = 'James Wilson is the best professor for cs 2305 with 58% of students receiving a grade more than or equal to A minus';
        }
         if(slotValues.course.heardAs === `cs 3340`){
            say = 'Karen Mazidi is the best professor for cs 3340 with 61% of students receiving a grade more than or equal to A minus';
        }
         if(slotValues.course.heardAs === `cs 4341`){
            say = 'Eric Becker is the best professor for cs 4341 with 68% of students receiving a grade more than or equasl to A minus';
        }
         if(slotValues.course.heardAs === `cs 4337`){
            say = 'Timothy McMahan is the best professor for cs 4347 with 70% of students receiving a grade more than or equal to A minus';
        }
         if(slotValues.course.heardAs === `cs 3354`){
            say = 'Klyne Smith is the best professor for cs 3354 with 83% of students receiving a grade more than or equal to A minus';
        }
         if(slotValues.course.heardAs === `ecs 3390`){
            say = 'Ryan Christopher is the best professor for ecs 3390 with 94% of students receiving a grade more than or equal to A minus';
        }
         if(slotValues.course.heardAs === `cs 4349`){
            say = 'James Wilson is the best professor for cs 4349 with 51% of students receiving a grade more than or equal to A minus';
        }
         if(slotValues.course.heardAs === `cs 3162`){
            say = 'Klyne Smith is the best professor for cs 3162 with 90% of students receiving a grade more than or equal to A minus';
        }
         if(slotValues.course.heardAs === `ecs 2361`){
            say = 'Douglas Dow is the best professor for cs 2361 with 80% of students receiving a grade more than or equal to A minus';
        }
         if(slotValues.course.heardAs === `cs 4384`){
            say = 'Charles Shields is the best professor for cs 4384 with 40% of students receiving a grade more than or equal to A minus';
        }
         if(slotValues.course.heardAs === `cs 4347`){
            say = 'Eric Becker is the best professor for cs 4347 with 58% of students receiving a grade more than or equal to A minus';
        }
         if(slotValues.course.heardAs === `cs 4485`){
            say = 'Miguel Razo is the best professor for cs 4485 with 92% of students receiving a grade more than or equal to A minus';
        }
 

        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const GetRequiredCourses_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'GetRequiredCourses' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = '';

        let slotStatus = '';
        let resolvedSlot;

        let slotValues = getSlotValues(request.intent.slots); 
        // getSlotValues returns .heardAs, .resolved, and .isValidated for each slot, according to request slot status codes ER_SUCCESS_MATCH, ER_SUCCESS_NO_MATCH, or traditional simple request slot without resolutions

        // console.log('***** slotValues: ' +  JSON.stringify(slotValues, null, 2));
        //   SLOT: requiredClass 
        if (slotValues.requiredClass.heardAs && slotValues.requiredClass.heardAs !== '') {
            slotStatus += ' The class ' + slotValues.requiredClass.heardAs + '. ';
        } else {
            slotStatus += 'slot requiredClass is empty. ';
        }
        if (slotValues.requiredClass.ERstatus === 'ER_SUCCESS_MATCH') {
            slotStatus += 'does not ';
            if(slotValues.requiredClass.resolved !== slotValues.requiredClass.heardAs) {
                slotStatus += 'have a  ' + 'prerequisite. '; 
                } else {
                slotStatus += 'prerequisite! '
            } // else {
                //
        }
        if (slotValues.requiredClass.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += 'does not have a prerequisite! ';
            console.log('***** consider adding "' + slotValues.requiredClass.heardAs + '" to the custom slot type used by slot requiredClass! '); 
        }

        if( (slotValues.requiredClass.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.requiredClass.heardAs) ) {
           // slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('GetRequiredCourses','requiredClass'), 'or');
        }

        say += slotStatus;
        
        
        
        
        if(slotValues && slotValues.requiredClass){
            if(slotValues.requiredClass.heardAs === `cs 3305`){
                say = `The prerequisite of CS 3305 is either CS 2305, MATH 2414, or MATH 2419!`;
            }
            if(slotValues.requiredClass.heardAs === `cs 3377`){
                say = `The prerequisites of CS 3377 are either CS 2336 with a C or better.`;
            }
            if(slotValues.requiredClass.heardAs === `cs 3345`){
                say = `The prerequisite of CS 3345 are either CS 2305, or CS 2336 with a C or better. Corequisites are CS 3341.`
            }
            if(slotValues.requiredClass.heardAs === `cs 3341`){
                  say = `The prerequisite of CS 3341 are either MATH 1326, MATH 2414, MATH 2419, and CS 2305 with a C or better.`
              }
            if(slotValues.requiredClass.heardAs === `cs 2336`){
                    say = `The prerequisite of CS 2336 are CE 1337, CS 1337, or TE 1337, with a C or better`;
                }
            if(slotValues.requiredClass.heardAs === `cs 2337`){
                  say = `The prerequisite of CS 2337 are an AP score of 4 or more on the APCSA exam. Corequisites are CS 2305.`
              }
            if(slotValues.requiredClass.heardAs === `cs 2305`){
                 say = `The prerequisite of CS 2305 is MATH 2312 with a C or better, or ALEKS score of 80% or higher. CS 2305 is a corequisite with CS 2337`;
              }
             if(slotValues.requiredClass.heardAs === `cs 3340`){
                 say = `The prerequisites of CS 3340 are CS 1337, or CE with a grade of C or better, and CS 2305 ,
                 or CE 2305 with a grade of C or better. Credit cannot be receieved for both courses.`;
             }
             if(slotValues.requiredClass.heardAs === `cs 4341`){
                 say = `The prerequisite of CS 4341 are either CE 2310 or CS 3340 and PHY2326. Corequisites are CS 4141, and credit cannot be
                 receieved for both courses (CS 4341 and ENGR 3341)`;
             }
             if(slotValues.requiredClass.heardAs === `cs 4337`){
                 say = `The prerequisite of CS 4337 are CS 2336 or CS 3333 and CS 2305 and CS 3340 or CS 4304`;
             }
             if(slotValues.requiredClass.heardAs === `cs 3354`){
                 say = `The prerequisite of CS 3354 are CS 2336 with a C or better, and CS 2305 with a C or better. 
                 Corequisite is ECS 3390`;
             }
             if(slotValues.requiredClass.heardAs === `ecs 3390`){
                 say = `The prerequisite of ECS 3390 are RHET 1302 and junior standing`;
             }
             if(slotValues.requiredClass.heardAs === `cs 4349`){
                 say = `The prerequisite of CS 4349 are CS 3305 with a C or better and CS 3345`;
             }
             if(slotValues.requiredClass.heardAs === `cs 3162`){
                 say = `The prerequisites or corequisites of CS 3162 are CS 3345, CS 3354, and ECS 2361`;
             }
             if(slotValues.requiredClass.heardAs === `ecs 2361`){
                 say = `The prerequisite of ECS 2361 is completion of an 030 core course`;
             }
             if(slotValues.requiredClass.heardAs === `cs 4384`){
                 say = `The prerequisite of CS 4384 is CS 3305 with a C or better`;
             }
             if(slotValues.requiredClass.heardAs === `cs 4347`){
                 say = `The prerequisite of CS 4347 is either CS 3345, or SE 3345, or TE 3345`;
             }
             if(slotValues.requiredClass.heardAs === `cs 4485`){
                 say = `The prerequisite of CS 4485 is CS 3345 and CS 3354 and atleast three CS 4300 classes`;
             }
             
        
        } else{
            say = `Sorry, I didn't get that. Please try again`;
        }


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const LaunchRequest_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'LaunchRequest';
    },
    handle(handlerInput) { 
        const responseBuilder = handlerInput.responseBuilder;

        let say = ' Hello ' + '  and welcome to  ' + invocationName + ' !'+ 
        'Here  you  can  find  the  prerequisites  and  corequisites  for  your  CS  classes!'+ 
        'You  can  also  ask  us  about  the  best  professors  for  your  classes.   ' +
        'To  find  classes  that  do  not  have  prerequisites,     ask  in  the  format,       Prereqs  for  (input  the  class  name).          ' + 
        ' To  find  what  prerequisites  and  corequisites ,      your  required  classes  have ,          ask  in  the  format  ' +
        '  test  ( input  the  name  of  the  class . ).' + ' If  you  want  to  find  the  best  professor  ask  in  the  format       ' +
        '   ( input  class  name) professor, and if you need help then just say help and I will provide you the format again to ask the above questions.';

        let skillTitle = capitalize(invocationName);


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .withStandardCard('Welcome!', 
              'Hello!\nThis is a card for your skill, ' + skillTitle,
               welcomeCardImg.smallImageUrl, welcomeCardImg.largeImageUrl)
            .getResponse();
    },
};

const SessionEndedHandler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
        return handlerInput.responseBuilder.getResponse();
    }
};

const ErrorHandler =  {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const request = handlerInput.requestEnvelope.request;

        console.log(`Error handled: ${error.message}`);
        // console.log(`Original Request was: ${JSON.stringify(request, null, 2)}`);

        return handlerInput.responseBuilder
            .speak(`Sorry, your skill got this error.  ${error.message} `)
            .reprompt(`Sorry, your skill got this error.  ${error.message} `)
            .getResponse();
    }
};


// 2. Constants ===========================================================================

    // Here you can define static data, to be used elsewhere in your code.  For example: 
    //    const myString = "Hello World";
    //    const myArray  = [ "orange", "grape", "strawberry" ];
    //    const myObject = { "city": "Boston",  "state":"Massachusetts" };

const APP_ID = undefined;  // TODO replace with your Skill ID (OPTIONAL).

// 3.  Helper Functions ===================================================================

function capitalize(myString) {

     return myString.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); }) ;
}

 
function randomElement(myArray) { 
    return(myArray[Math.floor(Math.random() * myArray.length)]); 
} 
 
function stripSpeak(str) { 
    return(str.replace('<speak>', '').replace('</speak>', '')); 
} 
 
 
 
 
function getSlotValues(filledSlots) { 
    const slotValues = {}; 
 
    Object.keys(filledSlots).forEach((item) => { 
        const name  = filledSlots[item].name; 
 
        if (filledSlots[item] && 
            filledSlots[item].resolutions && 
            filledSlots[item].resolutions.resolutionsPerAuthority[0] && 
            filledSlots[item].resolutions.resolutionsPerAuthority[0].status && 
            filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) { 
            switch (filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) { 
                case 'ER_SUCCESS_MATCH': 
                    slotValues[name] = { 
                        heardAs: filledSlots[item].value, 
                        resolved: filledSlots[item].resolutions.resolutionsPerAuthority[0].values[0].value.name, 
                        ERstatus: 'ER_SUCCESS_MATCH' 
                    }; 
                    break; 
                case 'ER_SUCCESS_NO_MATCH': 
                    slotValues[name] = { 
                        heardAs: filledSlots[item].value, 
                        resolved: '', 
                        ERstatus: 'ER_SUCCESS_NO_MATCH' 
                    }; 
                    break; 
                default: 
                    break; 
            } 
        } else { 
            slotValues[name] = { 
                heardAs: filledSlots[item].value || '', // may be null 
                resolved: '', 
                ERstatus: '' 
            }; 
        } 
    }, this); 
 
    return slotValues; 
} 
 
function getExampleSlotValues(intentName, slotName) { 
 
    let examples = []; 
    let slotType = ''; 
    let slotValuesFull = []; 
 
    let intents = model.interactionModel.languageModel.intents; 
    for (let i = 0; i < intents.length; i++) { 
        if (intents[i].name == intentName) { 
            let slots = intents[i].slots; 
            for (let j = 0; j < slots.length; j++) { 
                if (slots[j].name === slotName) { 
                    slotType = slots[j].type; 
 
                } 
            } 
        } 
 
    } 
    let types = model.interactionModel.languageModel.types; 
    for (let i = 0; i < types.length; i++) { 
        if (types[i].name === slotType) { 
            slotValuesFull = types[i].values; 
        } 
    } 
 
    slotValuesFull = shuffleArray(slotValuesFull); 
 
    examples.push(slotValuesFull[0].name.value); 
    examples.push(slotValuesFull[1].name.value); 
    if (slotValuesFull.length > 2) { 
        examples.push(slotValuesFull[2].name.value); 
    } 
 
 
    return examples; 
} 
 
function sayArray(myData, penultimateWord = 'and') { 
    let result = ''; 
 
    myData.forEach(function(element, index, arr) { 
  
        if (index === 0) { 
            result = element; 
        } else if (index === myData.length - 1) { 
            result += ` ${penultimateWord} ${element}`; 
        } else { 
            result += `, ${element}`; 
        } 
    }); 
    return result; 
} 
function supportsDisplay(handlerInput) // returns true if the skill is running on a device with a display (Echo Show, Echo Spot, etc.) 
{                                      //  Enable your skill for display as shown here: https://alexa.design/enabledisplay 
    const hasDisplay = 
        handlerInput.requestEnvelope.context && 
        handlerInput.requestEnvelope.context.System && 
        handlerInput.requestEnvelope.context.System.device && 
        handlerInput.requestEnvelope.context.System.device.supportedInterfaces && 
        handlerInput.requestEnvelope.context.System.device.supportedInterfaces.Display; 
 
    return hasDisplay; 
} 
 
 
const welcomeCardImg = { 
    smallImageUrl: "https://s3.amazonaws.com/skill-images-789/cards/card_plane720_480.png", 
    largeImageUrl: "https://s3.amazonaws.com/skill-images-789/cards/card_plane1200_800.png" 
 
 
}; 
 
const DisplayImg1 = { 
    title: 'Jet Plane', 
    url: 'https://s3.amazonaws.com/skill-images-789/display/plane340_340.png' 
}; 
const DisplayImg2 = { 
    title: 'Starry Sky', 
    url: 'https://s3.amazonaws.com/skill-images-789/display/background1024_600.png' 
 
}; 
 
function getCustomIntents() { 
    const modelIntents = model.interactionModel.languageModel.intents; 
 
    let customIntents = []; 
 
 
    for (let i = 0; i < modelIntents.length; i++) { 
 
        if(modelIntents[i].name.substring(0,7) != "AMAZON." && modelIntents[i].name !== "LaunchRequest" ) { 
            customIntents.push(modelIntents[i]); 
        } 
    } 
    return customIntents; 
} 
 
function getSampleUtterance(intent) { 
 
    return randomElement(intent.samples); 
 
} 
 
function getPreviousIntent(attrs) { 
 
    if (attrs.history && attrs.history.length > 1) { 
        return attrs.history[attrs.history.length - 2].IntentRequest; 
 
    } else { 
        return false; 
    } 
 
} 
 
function getPreviousSpeechOutput(attrs) { 
 
    if (attrs.lastSpeechOutput && attrs.history.length > 1) { 
        return attrs.lastSpeechOutput; 
 
    } else { 
        return false; 
    } 
 
} 
 
function timeDelta(t1, t2) { 
 
    const dt1 = new Date(t1); 
    const dt2 = new Date(t2); 
    const timeSpanMS = dt2.getTime() - dt1.getTime(); 
    const span = { 
        "timeSpanMIN": Math.floor(timeSpanMS / (1000 * 60 )), 
        "timeSpanHR": Math.floor(timeSpanMS / (1000 * 60 * 60)), 
        "timeSpanDAY": Math.floor(timeSpanMS / (1000 * 60 * 60 * 24)), 
        "timeSpanDesc" : "" 
    }; 
 
 
    if (span.timeSpanHR < 2) { 
        span.timeSpanDesc = span.timeSpanMIN + " minutes"; 
    } else if (span.timeSpanDAY < 2) { 
        span.timeSpanDesc = span.timeSpanHR + " hours"; 
    } else { 
        span.timeSpanDesc = span.timeSpanDAY + " days"; 
    } 
 
 
    return span; 
 
} 
 
 
const InitMemoryAttributesInterceptor = { 
    process(handlerInput) { 
        let sessionAttributes = {}; 
        if(handlerInput.requestEnvelope.session['new']) { 
 
            sessionAttributes = handlerInput.attributesManager.getSessionAttributes(); 
 
            let memoryAttributes = getMemoryAttributes(); 
 
            if(Object.keys(sessionAttributes).length === 0) { 
 
                Object.keys(memoryAttributes).forEach(function(key) {  // initialize all attributes from global list 
 
                    sessionAttributes[key] = memoryAttributes[key]; 
 
                }); 
 
            } 
            handlerInput.attributesManager.setSessionAttributes(sessionAttributes); 
 
 
        } 
    } 
}; 
 
const RequestHistoryInterceptor = { 
    process(handlerInput) { 
 
        const thisRequest = handlerInput.requestEnvelope.request; 
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes(); 
 
        let history = sessionAttributes['history'] || []; 
 
        let IntentRequest = {}; 
        if (thisRequest.type === 'IntentRequest' ) { 
 
            let slots = []; 
 
            IntentRequest = { 
                'IntentRequest' : thisRequest.intent.name 
            }; 
 
            if (thisRequest.intent.slots) { 
 
                for (let slot in thisRequest.intent.slots) { 
                    let slotObj = {}; 
                    slotObj[slot] = thisRequest.intent.slots[slot].value; 
                    slots.push(slotObj); 
                } 
 
                IntentRequest = { 
                    'IntentRequest' : thisRequest.intent.name, 
                    'slots' : slots 
                }; 
 
            } 
 
        } else { 
            IntentRequest = {'IntentRequest' : thisRequest.type}; 
        } 
        if(history.length > maxHistorySize - 1) { 
            history.shift(); 
        } 
        history.push(IntentRequest); 
 
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes); 
 
    } 
 
}; 
 
 
 
 
const RequestPersistenceInterceptor = { 
    process(handlerInput) { 
 
        if(handlerInput.requestEnvelope.session['new']) { 
 
            return new Promise((resolve, reject) => { 
 
                handlerInput.attributesManager.getPersistentAttributes() 
 
                    .then((sessionAttributes) => { 
                        sessionAttributes = sessionAttributes || {}; 
 
 
                        sessionAttributes['launchCount'] += 1; 
 
                        handlerInput.attributesManager.setSessionAttributes(sessionAttributes); 
 
                        handlerInput.attributesManager.savePersistentAttributes() 
                            .then(() => { 
                                resolve(); 
                            }) 
                            .catch((err) => { 
                                reject(err); 
                            }); 
                    }); 
 
            }); 
 
        } // end session['new'] 
    } 
}; 
 
 
const ResponseRecordSpeechOutputInterceptor = { 
    process(handlerInput, responseOutput) { 
 
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes(); 
        let lastSpeechOutput = { 
            "outputSpeech":responseOutput.outputSpeech.ssml, 
            "reprompt":responseOutput.reprompt.outputSpeech.ssml 
        }; 
 
        sessionAttributes['lastSpeechOutput'] = lastSpeechOutput; 
 
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes); 
 
    } 
}; 
 
const ResponsePersistenceInterceptor = { 
    process(handlerInput, responseOutput) { 
 
        const ses = (typeof responseOutput.shouldEndSession == "undefined" ? true : responseOutput.shouldEndSession); 
 
        if(ses || handlerInput.requestEnvelope.request.type == 'SessionEndedRequest') { // skill was stopped or timed out 
 
            let sessionAttributes = handlerInput.attributesManager.getSessionAttributes(); 
 
            sessionAttributes['lastUseTimestamp'] = new Date(handlerInput.requestEnvelope.request.timestamp).getTime(); 
 
            handlerInput.attributesManager.setPersistentAttributes(sessionAttributes); 
 
            return new Promise((resolve, reject) => { 
                handlerInput.attributesManager.savePersistentAttributes() 
                    .then(() => { 
                        resolve(); 
                    }) 
                    .catch((err) => { 
                        reject(err); 
                    }); 
 
            }); 
 
        } 
 
    } 
}; 
 
 
function shuffleArray(array) {  // Fisher Yates shuffle! 
 
    let currentIndex = array.length, temporaryValue, randomIndex; 
 
    while (0 !== currentIndex) { 
 
        randomIndex = Math.floor(Math.random() * currentIndex); 
        currentIndex -= 1; 
 
        temporaryValue = array[currentIndex]; 
        array[currentIndex] = array[randomIndex]; 
        array[randomIndex] = temporaryValue; 
    } 
 
    return array; 
} 
// 4. Exports handler function and setup ===================================================
const skillBuilder = Alexa.SkillBuilders.standard();
exports.handler = skillBuilder
    .addRequestHandlers(
        AMAZON_FallbackIntent_Handler, 
        AMAZON_CancelIntent_Handler, 
        AMAZON_HelpIntent_Handler, 
        AMAZON_StopIntent_Handler, 
        AMAZON_NavigateHomeIntent_Handler, 
        GetPreRequisites_Handler, 
        GetBestProfessor_Handler, 
        GetRequiredCourses_Handler, 
        LaunchRequest_Handler, 
        SessionEndedHandler
    )
    .addErrorHandlers(ErrorHandler)
    .addRequestInterceptors(InitMemoryAttributesInterceptor)
    .addRequestInterceptors(RequestHistoryInterceptor)

   // .addResponseInterceptors(ResponseRecordSpeechOutputInterceptor)

 // .addRequestInterceptors(RequestPersistenceInterceptor)
 // .addResponseInterceptors(ResponsePersistenceInterceptor)

 // .withTableName("askMemorySkillTable")
 // .withAutoCreateTable(true)

    .lambda();


// End of Skill code -------------------------------------------------------------
// Static Language Model for reference

const model = {
  "interactionModel": {
    "languageModel": {
      "invocationName": "course help",
      "intents": [
        {
          "name": "AMAZON.FallbackIntent",
          "samples": []
        },
        {
          "name": "AMAZON.CancelIntent",
          "samples": []
        },
        {
          "name": "AMAZON.HelpIntent",
          "samples": []
        },
        {
          "name": "AMAZON.StopIntent",
          "samples": []
        },
        {
          "name": "AMAZON.NavigateHomeIntent",
          "samples": []
        },
        {
          "name": "GetPreRequisites",
          "slots": [
            {
              "name": "class",
              "type": "PreRequisites"
            }
          ],
          "samples": [
            "Prereqs for {class}"
          ]
        },
        {
           "name": "GetBestProfessor",
                    "slots": [
                        {
                            "name": "course",
                            "type": "BestProfessors"
                        }
                    ],
                    "samples": [
                        "who is the best professor for {course}"
                    ]
        },
        {
          "name": "GetRequiredCourses",
          "slots": [
            {
              "name": "requiredClass",
              "type": "listClass"
            }
          ],
          "samples": [
            "test  {requiredClass}"
          ]
        },
        {
          "name": "LaunchRequest"
        }
      ],
      "types": [
        {
          "name": "PreRequisites",
          "values": [
            {
              "name": {
                "value": "CS 1136"
              }
            },
            {
              "name": {
                "value": "CS 1336"
              }
            },
            {
              "name": {
                "value": "MATH 2417"
              }
            },
            {
              "name": {
                "value": "CS 1200"
              }
            },
            {
              "name": {
                "value": "MATH 2413"
              }
            },
            {
              "name": {
                "value": "ECS 1100"
              }
            },
            {
              "name": {
                "value": "UNIV 1010"
              }
            }
          ]
        },
        {
          "name": "ProfessorRating",
          "values": [
            {
              "name": {
                "value": "K Smith"
              }
            },
            {
              "name": {
                "value": " I Page"
              }
            },
            {
              "name": {
                "value": "W Chin"
              }
            },
            {
              "name": {
                "value": "E Salazar"
              }
            },
            {
              "name": {
                "value": "J Cole"
              }
            },
            {
              "name": {
                "value": "T McMahan"
              }
            },
            {
              "name": {
                "value": "G Arnold"
              }
            },
            {
              "name": {
                "value": "M Christiansen"
              }
            }
          ]
        },
        {
          "name": "listClass",
          "values": [
            {
              "name": {
                "value": "CS 3377"
              }
            },
            {
              "name": {
                "value": "CS 3345"
              }
            },
            {
              "name": {
                "value": "CS 3341"
              }
            },
            {
              "name": {
                "value": "CS 3305"
              }
            },
            {
              "name": {
                "value": "CS 2336"
              }
            },
            {
              "name": {
                "value": "CS 2337"
              }
            },
            {
              "name": {
                "value": "CS 2305"
              }
            }
          ]
        }
      ]
    }
  }
};
