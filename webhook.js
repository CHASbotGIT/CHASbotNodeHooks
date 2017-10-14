/* __ _  _   _   ___ _         _
 / __| || | /_\ / __| |__  ___| |_
| (__| __ |/ _ \\__ \ '_ \/ _ \  _|
 \___|_||_/_/ \_\___/_.__/\___/\__| CHAS (C) 2017 */

// Make sure everything is properly defined
'use strict';

// Pick up variables from the server implimentation || Remove API keys
// Source: https://github.com/CHASbotGIT/CHASbotNodeHooks
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const APIAI_TOKEN = process.env.APIAI_TOKEN;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
// Free linkable image hosting at https://imgbox.com
const IMG_URL_PREFIX = "https://images.imgbox.com/";
const IMG_URL_SUFFIX = "_o.png";
const CHAS_THUMB = 'https://images.imgbox.com/99/1d/bFWYzY68_o.jpg';
var server_port = process.env.PORT || 9000; //8080;
var server_ip_address = '127.0.0.1'; // Only for testing via local NGROK.IO
// For message handling
let messageData = '';
let messageText = '';
var analyse_text = '';
var position_in_analyse_text = -1;
var starting_point = 0;
var ending_point = 0;
var string_length = 0;
// CHAS alphabet
const CHASABET_TIRGGER_PHRASE1 = 'chas alphabet'; // Triggers in lower case
const CHASABET_TIRGGER_PHRASE2 = 'chas letter'; // Triggers in lower case
var CHASABET_TRIGGER = 0;
var CHASABET_LETTER = ''; // Result
var CHASABET_URL = ''; // Result
var CHASABET = new Array();
CHASABET [0] = new Array("b1/96/zO6mBcwI","a5/59/dH8YmE0D","28/ca/zIHlflOC"); // A
CHASABET [1] = new Array("a7/6b/ykRlRXQ4","35/79/3Fm87p1Z","69/18/7Jwe1SDT"); // B
CHASABET [2] = new Array("70/0e/A6ZJwetJ","33/25/aueWYGEx","d9/7e/LaVqtDUQ","85/b1/qh0uavuP"); // C
CHASABET [3] = new Array("4a/a3/NqUpBNz4","ef/4c/z5RNxmlD"); // D
CHASABET [4] = new Array("63/f7/XaiHgD71","ce/ac/9nCwH3g9","35/3d/TcTbkDhK"); // E
CHASABET [5] = new Array("87/c5/ap69ZMxm","ce/20/wUUatq8C"); // F
CHASABET [6] = new Array("49/5d/eC9uvi9B","ff/3b/pmvdcWts"); // G
CHASABET [7] = new Array("b5/90/PvvkWezf","f5/bf/UXiVHjNV","b6/e0/Tcqrhxhp","ac/2b/eZ5jnY3u","6f/19/EZadWwIQ"); // H
CHASABET [8] = new Array("8b/6a/7NVhU4DB","e4/de/dhkBg1G6","ff/35/GWYGOn6L"); // I
CHASABET [9] = new Array("50/96/RJQnEZTR","39/a9/rQJGozJp"); // J
CHASABET [10] = new Array("a2/d8/Js4Pp0yx","8a/48/3BMq2BbT"); // K
CHASABET [11] = new Array("47/a9/rEoruoPl","ce/8e/XQgh4mnL"); // L
CHASABET [12] = new Array("e4/d9/3aBWWbLv","9b/f7/YaUMcKiy","8a/24/EUOb4ml4"); // M
CHASABET [13] = new Array("a7/b6/I4LznlDF","c5/56/WnE5akMy"); // N
CHASABET [14] = new Array("15/78/HIa3Mfir","0f/72/VgMNNoMu"); // O
CHASABET [15] = new Array("ef/30/jcLeoia1","00/5c/EKuPupn8","83/0a/dxQuIG6C"); // P
CHASABET [16] = new Array("99/c2/eHly9qnq"); // Q
CHASABET [17] = new Array("ef/1c/CUsKXwFq","f8/96/qJJm4MIB"); // R
CHASABET [18] = new Array("0b/02/O7uHlTst","fd/fe/Tae390bV","95/97/GCCT6cS1","00/ed/yR9lW1az","3c/36/HzHUAz82"); // S
CHASABET [19] = new Array("a3/8d/r0xzFJPR","aa/a0/koSvqmVT"); // T
CHASABET [20] = new Array("2d/47/F50Ty0wO","d9/04/C1nlNJpU","08/e4/y1bij5xT","fb/a8/pTmffp5t"); // U
CHASABET [21] = new Array("d9/da/kzg0lQ8V","e1/79/F9f57NK1"); // V
CHASABET [22] = new Array("6e/ec/Hd1zypGj","95/0b/xyZtCqje","b0/f5/wBb2EsqF"); // W
CHASABET [23] = new Array("e9/0c/nB1EzCck","2e/60/2ETG0nZa"); // X
CHASABET [24] = new Array("2a/4a/9R5ZzF7V","d0/23/QDFnWi52"); // Y
CHASABET [25] = new Array("f6/89/4pwI187X","3c/4f/AguL64HL"); // Z
var CHASABET_INDEX = new Array(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);
// For Marvel API
const MARVEL_PRIVATE_KEY = process.env.MARVEL_PRIVATE_KEY;
const MARVEL_PUBLIC_KEY = process.env.MARVEL_PUBLIC_KEY;
const MARVEL_TIRGGER_PHRASE = 'marvel codename'; // Triggers in lower case
var MARVEL_TRIGGER = 0;
var HERO_WHO = ''; // Result
var HERO_DESCRIPTION = ''; // Result
var HERO_THUMB = ''; // Result
var HERO_URL = ''; // Result
var HERO_OOPS = [
  "⚠️ Alert: Hydra stole this result from the S.H.I.E.L.D. database...",
  "☠️ Warning: Hydra Infiltration. Result unavailable while under attack from enemy forces...",
  "👁️ Not even the eye of Uatu sees your request...",
  "💾 Program missing, exiting protocol...",
  "💣 Danger: Energy Overload..."
];
var HERO_OOPS_INDEX = 0;
var http = require('https');
var crypto = require('crypto');
// CHAS events
const REGEX_START = '(?=.*\\b'; // Regular expression bits
const REGEX_MIDDLE = '\\b)';
const REGEX_END = '.+';
const CHAS_EVENTS_BLOCK_SIZE = 4;
const CHAS_EVENTS_TIRGGER_PHRASE = 'when is'; // Triggers in lower case
var CHAS_EVENTS_TRIGGER = 0;
var CHAS_EVENTS_CALENDAR = new Array();
var CHAS_EVENTS_TOTAL = 0;
var CHAS_EVENTS_INDEX = -1;
var CHAS_EVENTS_NAME = ''; // Result
var CHAS_EVENTS_DETAILS = ''; // Result
var CHAS_EVENTS_INFORMATION = ''; // Result
var CHAS_EVENTS_OOPS = [
  "📆 Oops, that's not something I could find...",
  "📆 Mmmm, not an event that I recognise...",
  "📆 Not sure I'm able to help you with when that is..."
];
var CHAS_EVENTS_OOPS_INDEX = 0;
var fs = require("fs");
// Rock Paper Scissors Lizard Spock
const RPSLS_TRIGGER_PHRASE = 'bazinga'; // Triggers in lower case
const RPSLS_INTRO = "💡 First to five is the champion. Scissors cuts Paper, Paper covers Rock, Rock crushes Lizard, Lizard poisons Spock, Spock smashes Scissors, Scissors decapitates Lizard, Lizard eats Paper, Paper disproves Spock, Spock vaporizes Rock, and Rock crushes Scissors!";
const RPSLS_PROMPT = "Choose... Rock, Paper, Scissors, Lizard or Spock?";
var RPSLS_VALID = new Array ("rock","paper","scissors","lizard","spock");
var RPSLS_OUTCOMES = new Array ("cuts","covers","crushes","poisons","smashes","decapitates","eats","disproves","vaporizes","crushes");
var RPSLS_WIN = new Array ("scissorspaper","paperrock","rocklizard","lizardspock","spockscissors","scissorslizard","lizardpaper","paperspock","spockrock","rockscissors");
var RPSLS_LOSE = new Array ("paperscissors","rockpaper","lizardrock","spocklizard","scissorsspock","lizardscissors","paperlizard","spockpaper","rockspock","scissorsrock");
var RPSLS_DRAW = new Array ("rockrock","paperpaper","scissorsscissors","lizardlizard","spockspock");
var RPSLS_IMGS = new Array (
"8a/24/7grzIThv",
"60/ab/GGWv7VGf","5b/aa/gX9yjh8W","de/9a/ZW4Y0A3c","9b/b0/jozAYCPJ","fc/69/9RIO0UnP","ae/96/fImaS52o","e6/d8/NZf7rjvm","ce/75/2lShOY7A","1c/c0/v4T6eRgk","39/85/kCcL35Wx",
"65/e5/J9Pi4L30","57/e7/gXFlvW70","49/29/I58HCq4Z","ea/83/4oIJFaQX","35/46/6jfnQOWP","51/27/Mgd2xmkH","5b/43/75oya7i9","65/e5/J9Pi4L30","6d/76/wmyBvmzC","1c/dd/A1qkLRfu",
"8d/24/mYcLupcw","36/71/2TxupBuJ","88/de/fyL64Fit","ad/1f/a8wUNfkw","56/dd/yE6mRKxp");
var RPSLS_IMG_URL = '';
var RPSLS_PICK_CHASBOT = '';
var RPSLS_PICK_PLAYER = '';
var RPSLS_TRIGGER = 0;
var RPSLS_INSTRUCT = 1;
var RPSLS_IN_PLAY = 0;
var RPSLS_SCORE_CHASBOT = 0;
var RPSLS_SCORE_PLAYER = 0;
// Set-up remining pre-requisites for app
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const apiaiApp = require('apiai')(APIAI_TOKEN);
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Messenger templates can be found at:
// https://developers.facebook.com/docs/messenger-platform/send-messages/templates

function CalendarLoad() {
  // Load in calendar events
  var text_block = fs.readFileSync("./calendar.txt", "utf-8");
  CHAS_EVENTS_CALENDAR = text_block.split("\n");
  // Catch if the calendar list is funky i.e. isn't in blocks of four or missing at least one set
  var number_calendar_entries = CHAS_EVENTS_CALENDAR.length;
  console.log('Calendar entries: ' + number_calendar_entries);
  var remainder = number_calendar_entries % CHAS_EVENTS_BLOCK_SIZE;
  console.log('Calendar remainder (looking for 0): ' + remainder);
  CHAS_EVENTS_TOTAL = number_calendar_entries / CHAS_EVENTS_BLOCK_SIZE;
  console.log('Events: ' + CHAS_EVENTS_TOTAL);
  if (( remainder != 0 )||( CHAS_EVENTS_TOTAL == 0 )) {
    console.log('*** WHOOPS *** Something funky going on with calendar');
    return false;
  } else {
    return true;
  }
}
var CHAS_EVENTS_VIABLE = CalendarLoad();

// ESTABLISH LISTENER
/* Only for TESTING via local NGROK.IO
const server = app.listen(server_port, server_ip_address, () => {
  console.log( "Listening on " + server_ip_address + ", port " + server_port );
});*/
// Only for PRODUCTION hosting on HEROKU
const server = app.listen(server_port, () => {
 console.log( "Listening on ", + server_port);
});

// Facebook/workplace validation
// Configure webhook in work chat integration - VERIFY_TOKEN matches code and app
// Copy page access token and hard code for testing or set as server variable
app.get('/webhook', (req, res) => {
  if (req.query['hub.mode'] && req.query['hub.verify_token'] === VERIFY_TOKEN) {
    res.status(200).send(req.query['hub.challenge']);
  } else {
    res.status(403).end();
  }
});

// Handling all messenges in and processing special cases
app.post('/webhook', (req, res) => {
  console.log(req.body);
  if (req.body.object === 'page') {
    req.body.entry.forEach((entry) => {
      entry.messaging.forEach((event) => {
        if (event.message && event.message.text) {
          // Clean input
          analyse_text = event.message.text;
          analyse_text = analyse_text.toLowerCase();
          // Check for custom triggers
          // Rock, Paper, Scissors, Lizard, Spock
          RPSLS_TRIGGER = 0;
          RPSLS_PICK_PLAYER = RPSLS_TRIGGER_PHRASE;
          if (RPSLS_IN_PLAY == 1) { // Only check if we are playing
            RPSLS_IN_PLAY = 0;
            var trigger_loop = 0;
            for (trigger_loop = 0; trigger_loop < RPSLS_VALID.length; trigger_loop++){
              position_in_analyse_text = analyse_text.search(RPSLS_VALID[trigger_loop]) + 1;
              if (position_in_analyse_text > 0) {
                RPSLS_PICK_PLAYER = RPSLS_VALID[trigger_loop];
                RPSLS_TRIGGER = 3; // Evaluate the choice
                RPSLS_IN_PLAY = 1; // Keep playing
                break;
              };
            };
          };

          position_in_analyse_text = analyse_text.search(RPSLS_TRIGGER_PHRASE) + 1;
          console.log('Bazinga search result: ' + position_in_analyse_text);
          if (position_in_analyse_text > 0) {
            if (RPSLS_INSTRUCT == 1) {
              RPSLS_TRIGGER = 1; // Provide intsructions + prompt
              RPSLS_INSTRUCT = 0; // Reset instructions
              RPSLS_IN_PLAY = 1;
            } else {
              RPSLS_TRIGGER = 2; // Prompt only
              RPSLS_IN_PLAY = 1;
            };
          };
          // Marvel
          MARVEL_TRIGGER = 0;
          position_in_analyse_text = analyse_text.search(MARVEL_TIRGGER_PHRASE) + 1;
          console.log('Marvel phrase search result: ' + position_in_analyse_text);
          if (position_in_analyse_text > 0) {
            starting_point = position_in_analyse_text + MARVEL_TIRGGER_PHRASE.length;
            ending_point = analyse_text.length;
            string_length = ending_point - starting_point;
            console.log ('Length is ' + string_length + ', starting @ ' + starting_point + ' and go to ' + ending_point);
            if (string_length > 0) {
              MARVEL_TRIGGER = 1;
              HERO_WHO = analyse_text.slice(starting_point,ending_point);
              HERO_WHO = toTitleCase(HERO_WHO);
            };
          };
          // CHAS alphabet
          CHASABET_TRIGGER = 0;
          position_in_analyse_text = analyse_text.search(CHASABET_TIRGGER_PHRASE1) + 1;
          if (position_in_analyse_text == 0) {
            position_in_analyse_text = analyse_text.search(CHASABET_TIRGGER_PHRASE2) + 1;
            CHASABET_TRIGGER = 2;
          }
          console.log('CHAS alphabet phrase search result: ' + position_in_analyse_text);
          if (position_in_analyse_text > 0) {
            if (CHASABET_TRIGGER == 0) {
              starting_point = position_in_analyse_text + CHASABET_TIRGGER_PHRASE1.length;
            } else {
              starting_point = position_in_analyse_text + CHASABET_TIRGGER_PHRASE2.length;
            }
            ending_point = analyse_text.length;
            string_length = ending_point - starting_point;
            console.log ('Length is ' + string_length + ', starting @ ' + starting_point + ' and go to ' + ending_point);
            if (string_length > 0) {
              // Strip string to first viable letter
              CHASABET_LETTER = analyse_text.slice(starting_point,ending_point);
              CHASABET_LETTER = firstAlpha(CHASABET_LETTER);
              if (CHASABET_LETTER != '') {
                CHASABET_TRIGGER = 1;
              };
            };
          };
          // CHAS Events
          CHAS_EVENTS_TRIGGER = 0;
          position_in_analyse_text = analyse_text.search(CHAS_EVENTS_TIRGGER_PHRASE) + 1;
          console.log('CHAS events phrase search result: ' + position_in_analyse_text);
          if (position_in_analyse_text > 0) {
            starting_point = position_in_analyse_text + CHAS_EVENTS_TIRGGER_PHRASE.length;
            ending_point = analyse_text.length;
            string_length = ending_point - starting_point;
            console.log ('Length is ' + string_length + ', starting @ ' + starting_point + ' and go to ' + ending_point);
            if (string_length > 0) {
              CHAS_EVENTS_TRIGGER = 1;
              CHAS_EVENTS_NAME = analyse_text.slice(starting_point,ending_point);
            };
          };
          // Pick a response route
          if (MARVEL_TRIGGER == 1){
            console.log('Marvel Character: ' + HERO_WHO);
            getMarvelChar(HERO_WHO,event);
          } else if (CHASABET_TRIGGER == 1) {
            console.log('CHAS alpahbet: ' + CHASABET_LETTER);
            getAlphabetCHAS(CHASABET_LETTER,event);
          } else if (CHAS_EVENTS_TRIGGER == 1) {
            console.log('CHAS event: ' + CHAS_EVENTS_NAME);
            getEventCHAS(CHAS_EVENTS_NAME,event);
          } else if (RPSLS_TRIGGER > 0) {
            console.log('RPSLSpock: ' + RPSLS_PICK_PLAYER);
            getRPSLS(event);
          } else {
            sendMessageViaAPIAI(event);
          }
        }
      });
    });
    res.status(200).end();
  }
});

// Strng handling functions
function toTitleCase(str) {
  return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function firstAlpha(inputString) {
  for (var i = 0; i < inputString.length; i += 1) {
    if ((inputString.charAt(i) >= 'A' && inputString.charAt(i) <= 'Z') ||
        (inputString.charAt(i) >= 'a' && inputString.charAt(i) <= 'z')) {
        return inputString.charAt(i);
    }
  }
  return "";
}

// SENDING SECTION
// Send structured template
function sendTemplate(event) {
  // messageData set outside of function call
  let sender = event.sender.id;
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token: PAGE_ACCESS_TOKEN},
    method: 'POST',
    json: {
      recipient: {id: sender},
      message: messageData
    }
  }, function (error, response) {
    if (error) {
        console.log('Error sending template message: ', error);
    } else if (response.body.error) {
        console.log('Error: ', response.body.error);
    }
  });
}

function sendTextDirect(event) {
  // messageText set outside of function call
  let sender = event.sender.id;
  var messageChunk = '';
  var last_chunk = 0;
  var snipping_point = 0;
  // Chunk up messsages into blocks of 640, blocks must not be null length
  while (last_chunk == 0) {
    messageChunk = messageText;
    if (messageChunk.length > 640) {
      // Rough cut
      messageChunk = messageChunk.slice(0,639);
      // Trim back to last space
      snipping_point = messageChunk.lastIndexOf(' ');
      messageChunk = messageChunk.slice(0,snipping_point);
      console.log('CHUNK: ' + messageChunk);
      // Trim remaining
      messageText = '...' + messageText.slice(snipping_point + 1,messageText.length);
      console.log('CHANGE: ' + messageText);
    } else {
      last_chunk = 1;
      console.log('FINAL CHUNK: ' + messageChunk);
    }; // if
    // Send chunk
    request({
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: {access_token: PAGE_ACCESS_TOKEN},
      method: 'POST',
      json: {
        recipient: {id: sender},
        message: {text: messageChunk}
      }
    }, function (error, response) {
      if (error) {
          console.log('Error sending simple message: ', error);
      } else if (response.body.error) {
          console.log('Error: ', response.body.error);
      }
    }); // request
  }
  messageText = '';
}

// Message request pinged off of API.AI for response
function sendMessageViaAPIAI(event) {
  let sender = event.sender.id;
  let text = event.message.text;
  let apiai = apiaiApp.textRequest(text, {
    sessionId: 'chasbot_sessionID' // Arbitrary id
  });
  apiai.on('response', (response) => {
    console.log(response);
    let aiText = response.result.fulfillment.speech;
    request({
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: {access_token: PAGE_ACCESS_TOKEN},
      method: 'POST',
      json: {
        recipient: {id: sender},
        message: {text: aiText}
      }
    }, (error, response) => {
      if (error) {
        console.log('Error sending via APIAI message: ', error);
      } else if (response.body.error) {
        console.log('Error: ', response.body.error);
      }
    });
  });
  apiai.on('error', (error) => {
    console.log(error);
  });
  apiai.end();
}

// Webhook for API.ai to get response from the 3rd party API
app.post('/ai', (req, res) => {
  console.log('*** Webhook for api.ai query ***');
  console.log(req.body.result);
  if (req.body.result.action === 'weather') {
    console.log('*** weather ***');
    // Set a default weather location
    var city = 'Edinburgh';
    if (typeof req.body.result.parameters['geo-city-gb'] != 'undefined') {
      city = req.body.result.parameters['geo-city-gb'];
      console.log('Location @ :' + city);
    };
    if (typeof req.body.result.parameters['hospice_places'] != 'undefined') {
      city = req.body.result.parameters['hospice_places'];
      console.log('Hospice @ :' + city);
    };
    let restUrl = 'http://api.openweathermap.org/data/2.5/weather?APPID='+WEATHER_API_KEY+'&q='+city;
    console.log('Weather URL: ' + restUrl);
    request.get(restUrl, (err, response, body) => {
      if (!err && response.statusCode == 200) {
        let json = JSON.parse(body);
        console.log(json);
        let tempF = ~~(json.main.temp * 9/5 - 459.67);
        let tempC = ~~(json.main.temp - 273.15);
        let msg = 'The current condition in ' + json.name + ' is ' + json.weather[0].description + ' and the temperature is ' + tempF + ' ℉ (' +tempC+ ' ℃).'
        return res.json({
          speech: msg,
          displayText: msg,
          source: 'weather'
        });
      } else {
        let errorMessage = "Oops, I wasn't able to look up that place name.";
        return res.status(400).json({
          status: {
            code: 400,
            errorType: errorMessage
          }
        });
      }
    })
  }
});

function PostImage(image_url,pass_on_event) {
  console.log(new Date() + 'PostMarvelResults');
  let image_template = {
    attachment: {
      type: "image",
      payload: {
        url: image_url,
        is_reusable: true
      } // payload
    } // attachment
  }; // template
  messageData = image_template; // Required within sendTemplate
  sendTemplate(pass_on_event);
}

function PostMarvelResults(pass_on_event,result_or_not) {
  console.log(new Date() + 'PostMarvelResults');
  if (result_or_not == 1) {
    let marvel_template = {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [
            {
            title: HERO_WHO,
            image_url: HERO_THUMB,
            default_action: {
              type: "web_url",
              url: HERO_URL,
              messenger_extensions: false,
              webview_height_ratio: "tall"
              } // default_action
            } // elements
          ] // elements
        } // payload
      } // attachment
    }; // template
    messageText = HERO_DESCRIPTION; // Required within sendTextDirect
    sendTextDirect(pass_on_event);
    messageData = marvel_template; // Required within sendTemplate
    sendTemplate(pass_on_event);
  } else {
    messageText = HERO_OOPS[HERO_OOPS_INDEX] + ' try something instead of ' + HERO_WHO + '?'; // Required within sendTextDirect
    HERO_OOPS_INDEX = HERO_OOPS_INDEX + 1;
    if (HERO_OOPS_INDEX == HERO_OOPS.length) { HERO_OOPS_INDEX = 0 };
    sendTextDirect(pass_on_event);
  };
}

function PostResultsEventsCHAS(pass_on_event,result_or_not) {
  console.log(new Date() + 'PostResultsEventsCHAS');
  if (result_or_not == 1) {
    CHAS_EVENTS_NAME = CHAS_EVENTS_CALENDAR[CHAS_EVENTS_INDEX + 1];
    CHAS_EVENTS_DETAILS = CHAS_EVENTS_CALENDAR[CHAS_EVENTS_INDEX + 2];
    CHAS_EVENTS_INFORMATION = CHAS_EVENTS_CALENDAR[CHAS_EVENTS_INDEX + 3];
    let events_template = {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [
            {
            title: CHAS_EVENTS_NAME,
            image_url: CHAS_THUMB,
            default_action: {
              type: "web_url",
              url: CHAS_EVENTS_INFORMATION,
              messenger_extensions: false,
              webview_height_ratio: "tall"
              } // default_action
            } // elements
          ] // elements
        } // payload
      } // attachment
    }; // template
    messageText = CHAS_EVENTS_DETAILS; // Required within sendTextDirect
    sendTextDirect(pass_on_event);
    messageData = events_template; // Required within sendTemplate
    sendTemplate(pass_on_event);
  } else {
    messageText = CHAS_EVENTS_OOPS[CHAS_EVENTS_OOPS_INDEX] + ' try something instead of ' + toTitleCase(CHAS_EVENTS_NAME) + '?'; // Required within sendTextDirect
    CHAS_EVENTS_OOPS_INDEX = CHAS_EVENTS_OOPS_INDEX + 1;
    if (CHAS_EVENTS_OOPS_INDEX == CHAS_EVENTS_OOPS.length) { CHAS_EVENTS_OOPS_INDEX = 0 };
    sendTextDirect(pass_on_event);
  };
}

// Fetch back special queries
function getAlphabetCHAS(LetterTile,pass_in_event) {
  console.log('*** CHAS alphabet look-up ***');
  var target_letter_code = LetterTile.charCodeAt(0) - 97;
  var target_version = CHASABET_INDEX[target_letter_code];
  CHASABET_URL = IMG_URL_PREFIX + CHASABET[target_letter_code][target_version] + IMG_URL_SUFFIX;
  console.log('IMAGE @ ' + CHASABET_URL);
  CHASABET_INDEX[target_letter_code] = target_version + 1;
  if (CHASABET_INDEX[target_letter_code] == CHASABET[target_letter_code].length) {
    CHASABET_INDEX[target_letter_code] = 0;
  };
  PostImage(CHASABET_URL,pass_in_event);
}

function getMarvelChar(MarvelWho,pass_in_event) {
  console.log('*** Codename MARVEL API ***');
  // String together a URL using the provided keys and search parameters
  HERO_DESCRIPTION = '';
  var url = "https://gateway.marvel.com/v1/public/characters?nameStartsWith=" + MarvelWho + "&apikey=" + MARVEL_PUBLIC_KEY;
  var ts = new Date().getTime();
  var hash = crypto.createHash('md5').update(ts + MARVEL_PRIVATE_KEY + MARVEL_PUBLIC_KEY).digest('hex');
  url += "&ts=" + ts + "&hash=" + hash;
  console.log(new Date() + ' ' + url);
  // Call on the URL to get a response
  http.get(url, function(res) {
    var body = "";
    // Data comes through in chunks
    res.on('data', function (chunk) {
        body += chunk;
    });
    // When all the data is back, go on to query the full response
    res.on('end', function() {
        var characterData = JSON.parse(body);
        console.log(new Date() + ' ' + characterData.code);
        if (characterData.code === 200) { // Successful response from Marvel
          if (characterData['data'].count > 0) { // Multiple viable characters found
            HERO_DESCRIPTION += "More than one result, so just showing the first. ";
          };
          if (characterData['data'].count == 0) { // A successful response doesn't mean there was a match
            console.log("Valid URL but no results for " + toTitleCase(HERO_WHO));
            PostMarvelResults(pass_in_event,0);
            return;
          } else if (characterData['data'].results[0].description !== '') { // Assess the first result back
            HERO_DESCRIPTION += characterData.data.results[0].description;
            console.log(HERO_DESCRIPTION);
            HERO_THUMB = characterData.data.results[0].thumbnail.path + '/standard_xlarge.jpg';
            console.log(HERO_THUMB);
            HERO_URL = characterData.data.results[0].urls[0].url;
            console.log(HERO_URL);
            PostMarvelResults(pass_in_event,1);
            return;
          } else { // Assess the first result back when there isn't a description provided by Marvel
            HERO_DESCRIPTION += "Find out more at Marvel.";
            console.log(HERO_DESCRIPTION);
            HERO_THUMB = characterData.data.results[0].thumbnail.path + '/standard_xlarge.jpg';
            console.log(HERO_THUMB);
            HERO_URL = characterData.data.results[0].urls[0].url;
            console.log(HERO_URL);
            PostMarvelResults(pass_in_event,1);
            return;
          }
        } else if (characterData.code === "RequestThrottled") {
            console.log(new Date() + "RequestThrottled Error");
            PostMarvelResults(pass_in_event,0);
            return;
        } else {
            console.log(new Date() + ' Error: ' + JSON.stringify(result));
            PostMarvelResults(pass_in_event,0);
            return;
        }
    });
  });
}

function getEventCHAS(EventName,pass_in_event) {
  console.log('*** CHAS event look-up ***');
  CHAS_EVENTS_INDEX = -1;
  CHAS_EVENTS_NAME = EventName;
  // Take the input provded by the user...
  // ...convert to lowercase
  EventName = EventName.toLowerCase();
  // 10k special case
  EventName = EventName.replace(/10k/g, 'tenk');
  // Strip out anything that isn't an alpha or a space
  EventName = EventName.replace(/[^A-Za-z\s]/g, '');
  // Remove small words, 'the','in','at' and 'on'
  EventName = EventName.replace(/ the /g, ' ');
  EventName = EventName.replace(/ in /g, ' ');
  EventName = EventName.replace(/ at /g, ' ');
  EventName = EventName.replace(/ on /g, ' ');
  var compare_to_string = EventName;
  // Remove spaces just to check the final length of the alpha content
  EventName = EventName.replace(/\s/g, '');
  var stripped_sentence_length = EventName.length;
  console.log('Cleaned message is: ' + compare_to_string);
  console.log('Length: ' + stripped_sentence_length);
  var error_caught = false; // Gets changed to true, if things go iffy before the end
  if ( stripped_sentence_length == 0 ) {
    console.log('*** WHOOPS *** There is nothing left to compare');
    error_caught = true;
  }
  // Variables
  var stripped_message_count = 0;
  var regex_builder = '';
  var next_stripped_word = '';
  var found_event = false;
  var zero_is_a_match = -1;
  var event_loop = 0;
  var keyword_loop = 0;
  // Here we go looping through each set of keywords
  console.log('CHAS_EVENTS_TOTAL: ' + CHAS_EVENTS_TOTAL);
  for (event_loop = 0; event_loop < CHAS_EVENTS_TOTAL; event_loop++){
    // Break up the keywords into an array of individual words
    var sentence_split = CHAS_EVENTS_CALENDAR[event_loop * CHAS_EVENTS_BLOCK_SIZE].split(' ');
    var sentence_length = sentence_split.length;
    console.log('Number of words: ' + sentence_length);
    // If there are no keywords at all, the skip the rest of this iteration
    if (sentence_length == 0) {continue};
    // Reset variables for the inner loop
    stripped_message_count = 0;
    regex_builder = '';
    for (keyword_loop = 0; keyword_loop < sentence_length; keyword_loop++) {
      // Make lowercase
      next_stripped_word = sentence_split[keyword_loop].toLowerCase();
      // 10k special case
      next_stripped_word = next_stripped_word.replace(/10k/g, 'tenk');
      // Strip out all but letters from each keyword and skip small words
      next_stripped_word = next_stripped_word.replace(/[^A-Za-z]/g, '');
      if (!(( next_stripped_word == 'the' ) || ( next_stripped_word == 'in' ) ||
            ( next_stripped_word == 'at' ) || ( next_stripped_word == 'on' ))) {
        regex_builder = regex_builder + REGEX_START + next_stripped_word + REGEX_MIDDLE;
        console.log('Next word: ' + next_stripped_word);
        stripped_message_count = stripped_message_count + 1;
      }
    }
    // Nothing left to compare because search terms have all been stripped out
    if (stripped_message_count == 0) {continue};
    // Complete the search terms regular expression
    regex_builder = regex_builder + REGEX_END;
    console.log('Stripped number of words: ' + stripped_message_count);
    console.log('Regex search: ' + regex_builder);
    zero_is_a_match = compare_to_string.search(regex_builder);
    console.log('Match Check: ' + zero_is_a_match);
    // If there is a match then a value of 0 is returned
    if (zero_is_a_match == 0){
      console.log('We have a match: ' + (event_loop * CHAS_EVENTS_BLOCK_SIZE));
      // Sets the index value for the name/keywords for the event
      CHAS_EVENTS_INDEX = event_loop * CHAS_EVENTS_BLOCK_SIZE;
      found_event = true;
      break;
    }
  }
  // If there is not an event found then things have gone funky
  if (!found_event) {
    console.log('*** WHOOPS *** No matching event found');
    error_caught = true;
  }
  if (error_caught) {
    PostResultsEventsCHAS(pass_in_event,0);
  } else {
    PostResultsEventsCHAS(pass_in_event,1);
  }
}

function getRPSLS(pass_in_event) {
  console.log('*** Rock Paper Scissors Lizard Spock ***');
  if (RPSLS_TRIGGER == 1) { // Provide some instructions + prompt
    PostImage(IMG_URL_PREFIX + RPSLS_IMGS[0] + IMG_URL_SUFFIX,pass_in_event);
    messageText = RPSLS_INTRO; // Required within sendTextDirect
    sendTextDirect(pass_in_event);
    messageText = RPSLS_PROMPT; // Required within sendTextDirect
    sendTextDirect(pass_in_event);
  } else if (RPSLS_TRIGGER == 2) { // Just prompt
    messageText = RPSLS_PROMPT; // Required within sendTextDirect
    sendTextDirect(pass_in_event);
  } else { // Compare results and show outcome
    RPSLS_PICK_CHASBOT = RPSLS_VALID[Math.floor(Math.random()*RPSLS_VALID.length)];
    var PLAYERvBOT = RPSLS_PICK_PLAYER + RPSLS_PICK_CHASBOT;
    messageText = '';
    console.log('PLAYERvBOT: ' + PLAYERvBOT);
    // Check WIN
    var find_index = 0;
    for (find_index = 0; find_index < RPSLS_WIN.length; find_index++) {
      //console.log('Win check: ' + RPSLS_WIN[find_index]);
      if (PLAYERvBOT == RPSLS_WIN[find_index]) {
        RPSLS_IMG_URL = IMG_URL_PREFIX + RPSLS_IMGS[1 + find_index] + IMG_URL_SUFFIX;
        messageText = "You win. Your " + toTitleCase(RPSLS_PICK_PLAYER) + " ";
        messageText = messageText + RPSLS_OUTCOMES[find_index] + " my ";
        messageText = messageText + toTitleCase(RPSLS_PICK_CHASBOT) + ". ";
        RPSLS_SCORE_PLAYER++;
        break;
      };
    };
    // Check LOSE
    if (messageText == '') {
      var find_index = 0;
      for (find_index = 0; find_index < RPSLS_LOSE.length; find_index++) {
        //console.log('Lose check: ' + RPSLS_LOSE[find_index]);
        if (PLAYERvBOT == RPSLS_LOSE[find_index]) {
          RPSLS_IMG_URL = IMG_URL_PREFIX + RPSLS_IMGS[11 + find_index] + IMG_URL_SUFFIX;
          messageText = "I win. My " + toTitleCase(RPSLS_PICK_CHASBOT) + " ";
          messageText = messageText + RPSLS_OUTCOMES[find_index] + " your ";
          messageText = messageText + toTitleCase(RPSLS_PICK_PLAYER) + ". ";
          RPSLS_SCORE_CHASBOT++;
          break;
        };
      };
    };
    // Check DRAW
    if (messageText == '') {
      var find_index = 0;
      for (find_index = 0; find_index < RPSLS_DRAW.length; find_index++) {
        //console.log('Draw check: ' + RPSLS_DRAW[find_index]);
        if (PLAYERvBOT == RPSLS_DRAW[find_index]) {
          RPSLS_IMG_URL = IMG_URL_PREFIX + RPSLS_IMGS[21 + find_index] + IMG_URL_SUFFIX;
          messageText = "It's a draw. ";
          break;
        };
      };
    };
    // Script message
    if (RPSLS_SCORE_CHASBOT == 5) {
      messageText = messageText + "😁 Soz, I'm the Champion! (Score: CHASbot " + RPSLS_SCORE_CHASBOT ;
      messageText = messageText + ", you " + RPSLS_SCORE_PLAYER + ").";
      RPSLS_SCORE_CHASBOT = 0;
      RPSLS_SCORE_PLAYER = 0;
      RPSLS_INSTRUCT = 1;
    } else if (RPSLS_SCORE_PLAYER == 5) {
      messageText = messageText + "😡 Whoop, your're the Champion! (Score: CHASbot " + RPSLS_SCORE_CHASBOT ;
      messageText = messageText + ", you " + RPSLS_SCORE_PLAYER + ").";
      RPSLS_SCORE_CHASBOT = 0;
      RPSLS_SCORE_PLAYER = 0;
      RPSLS_INSTRUCT = 1;
    } else if (RPSLS_SCORE_CHASBOT > RPSLS_SCORE_PLAYER) {
      messageText = messageText + "😉 I'm ahead for now but you could turn it around! (Score: CHASbot " + RPSLS_SCORE_CHASBOT ;
      messageText = messageText + ", you " + RPSLS_SCORE_PLAYER + ").";
    } else if (RPSLS_SCORE_PLAYER > RPSLS_SCORE_CHASBOT) {
      messageText = messageText + "😏 You're leading the way, for now! (Score: CHASbot " + RPSLS_SCORE_CHASBOT ;
      messageText = messageText + ", you " + RPSLS_SCORE_PLAYER + ").";
    } else {
      messageText = messageText + "🙂 Level pegging. (Score: CHASbot " + RPSLS_SCORE_CHASBOT ;
      messageText = messageText + ", you " + RPSLS_SCORE_PLAYER + ").";
    };
    PostImage(RPSLS_IMG_URL,pass_in_event);
    sendTextDirect(pass_in_event);
  };
}
