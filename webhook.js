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
const SECRET_CRYPTO = process.env.SECRET_CRYPTO;
const MARVEL_PRIVATE_KEY = process.env.MARVEL_PRIVATE_KEY;
const MARVEL_PUBLIC_KEY = process.env.MARVEL_PUBLIC_KEY;
// Set-up Node.js requirements for app
const express = require('express'); // https://expressjs.com
const bodyParser = require('body-parser'); // https://github.com/expressjs/body-parser
const request = require('request'); // https://github.com/request/request
const dialogFlow = require('apiai')(APIAI_TOKEN); // https://www.npmjs.com/package/apiai
const http = require('https'); // https://nodejs.org/api/https.html
const crypto = require('crypto'); // https://nodejs.org/api/crypto.html
const fs = require("fs"); // https://nodejs.org/api/fs.html
// Initialise CHASbot
const CHASbot = express();
CHASbot.use(bodyParser.json());
CHASbot.use(bodyParser.urlencoded({ extended: true }));
// Messenger templates can be found at:
// https://developers.facebook.com/docs/messenger-platform/send-messages/templates
// FB end-points
const FB_MESSENGER_ENDPOINT = 'https://graph.facebook.com/v2.6/me/messages';
const LONG_MSG_WAIT = 1500; // one second
var FB_WHO = 0;
// Free linkable image hosting at https://imgbox.com
const IMG_URL_PREFIX = "https://images.imgbox.com/";
const IMG_URL_SUFFIX = "_o.png";
const CHAS_THUMB = 'https://images.imgbox.com/99/1d/bFWYzY68_o.jpg';
const SOURCE_CALENDAR = "./calendar.txt"; // Same directory as source code
const SOURCE_BIOGRAPHIES = "./bios_private.txt"; // Same directory as source code
const ENCRYPTED_BIOGRAPHIES = "./bios_public.txt"; // Same directory as source code
var server_port = process.env.PORT || 9000; //8080;
var server_ip_address = '127.0.0.1'; // Only for testing via local NGROK.IO
// Triggers in lowercase - following phrases are handled in code
const CHAS_LOGO_TRIGGER_PHRASE = 'chas logo';
const CHASABET_TIRGGER_PHRASE1 = 'chas alphabet';
const CHASABET_TIRGGER_PHRASE2 = 'chas letter';
const MARVEL_TIRGGER_PHRASE = 'marvel codename';
const CHAS_EVENTS_TIRGGER_PHRASE = 'when is';
const CHAS_BIOS_TRIGGER_PHRASE = 'who is';
const RPSLS_TRIGGER_PHRASE = 'bazinga';
var SEARCH_METHODS = new Array ("search","google","wiki","beeb");
// For message handling
let messageData = '';
let messageText = '';
var analyse_text = '';
var position_in_analyse_text = -1;
var starting_point = 0;
var ending_point = 0;
var string_length = 0;
// Search engine
const SEARCH_BEEB = "https://www.bbc.co.uk/search?q=";
const URL_BEEB = "https://images.imgbox.com/59/f5/PFN3tfX5_o.png";
const SEARCH_GOOGLE = "https://www.google.com/search?q=";
const URL_GOOGLE = "https://images.imgbox.com/7f/57/CkDZNBfZ_o.png";
const SEARCH_WIKI = "https://en.wikipedia.org/w/index.php?search=";
const URL_WIKI = "https://images.imgbox.com/30/62/Vv6KJ9k9_o.png";
var SEARCH_METHOD = '';
var SEARCH_TERM = '';
var SEARCH_TRIGGER = 0;
// CHAS logo
var CHAS_LOGO_TRIGGER = 0;
// CHAS alphabet
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
// Keys above
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
// CHAS events
const REGEX_START = '(?=.*\\b'; // Regular expression bits
const REGEX_MIDDLE = '\\b)';
const REGEX_END = '.+';
const CHAS_EVENTS_BLOCK_SIZE = 4;
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
// CHAS biographies
const CHAS_BIOS_BLOCK_SIZE = 2;
var CHAS_BIOS_TRIGGER = 0;
var CHAS_BIOS = new Array();
var CHAS_BIOS_TOTAL = 0;
var CHAS_BIOS_INDEX = -1;
var CHAS_BIOS_NAME = '';
// Rock Paper Scissors Lizard Spock
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
"7c/cc/6aXrZ3OR","57/e7/gXFlvW70","49/29/I58HCq4Z","ea/83/4oIJFaQX","35/46/6jfnQOWP","51/27/Mgd2xmkH","5b/43/75oya7i9","65/e5/J9Pi4L30","6d/76/wmyBvmzC","1c/dd/A1qkLRfu",
"8d/24/mYcLupcw","36/71/2TxupBuJ","88/de/fyL64Fit","ad/1f/a8wUNfkw","56/dd/yE6mRKxp");
var RPSLS_IMG_URL = '';
var RPSLS_PICK_CHASBOT = '';
var RPSLS_PICK_PLAYER = '';
var RPSLS_INSTRUCT = 1;
var RPSLS_IN_PLAY = 0;
var RPSLS_SCORE_CHASBOT = 0;
var RPSLS_SCORE_PLAYER = 0;
var RPSLS_TRIGGER = 0;
var LLAP_TRIGGER = 0;
// Playing cards
var CARD_PICK = '';
var CARD_DECK  = new Array (
"♥A","♥2","♥3","♥4","♥5","♥6","♥7","♥8","♥9","♥10","♥J","♥Q","♥K",
"♠A","♠2","♠3","♠4","♠5","♠6","♠7","♠8","♠9","♠10","♠J","♠Q","♠K",
"♦A","♦2","♦3","♦4","♦5","♦6","♦7","♦8","♦9","♦10","♦J","♦Q","♦K",
"♣A","♣2","♣3","♣4","♣5","♣6","♣7","♣8","♣9","♣10","♣J","♣Q","♣K"
);
var CARD_PROMPTS = [
  "I've picked... ",
  "This time I've drawn... ",
  "I've selected... ",
  "You're card is... "
];
var CARD_PROMPT = 0;

// Encryption and decryption of biographies
var enCrypt = function(text_plain) {
  var algorithm = 'aes-256-ctr';
  var passkey = SECRET_CRYPTO;
  var cipher = crypto.createCipher(algorithm,passkey)
  var crypted = cipher.update(text_plain,'utf-8','hex')
  crypted += cipher.final('hex');
  return crypted;
}
var deCrypt = function(text_obscure) {
  var algorithm = 'aes-256-ctr';
  var passkey = SECRET_CRYPTO;
  var decipher = crypto.createDecipher(algorithm,passkey)
  var dec = decipher.update(text_obscure,'hex','utf-8')
  dec += decipher.final('utf-8');
  return dec;
}
function enCryptBios () {
  var text_block = fs.readFileSync(SOURCE_BIOGRAPHIES, "utf-8");
  var text_block_split = text_block.split("\n");
  var stream = fs.createWriteStream(ENCRYPTED_BIOGRAPHIES, "utf-8");
  stream.once('open', function(fd) {
    var stream_loop = 0;
    for (stream_loop = 0; stream_loop < text_block_split.length; stream_loop++) {
      //console.log("DEBUG [enCryptBios]> " + text_block_split[stream_loop]);
      if (stream_loop == text_block_split.length - 1 ) {
        stream.write(enCrypt(text_block_split[stream_loop])); // Last line
      } else {
        stream.write(enCrypt(text_block_split[stream_loop]) + '\n');
      }
    };
    stream.end();
  });
}

function deCryptBios () {
  var text_block = fs.readFileSync(ENCRYPTED_BIOGRAPHIES, "utf-8");
  var text_block_split_garbled = text_block.split("\n");
  CHAS_BIOS = new Array();
  var decrypt_loop = 0;
  for (decrypt_loop = 0; decrypt_loop < text_block_split_garbled.length; decrypt_loop++) {
    CHAS_BIOS[decrypt_loop] = deCrypt(text_block_split_garbled[decrypt_loop]);
  };
  var number_bios_entries = CHAS_BIOS.length;
  console.log("DEBUG [deCryptBios]> Bios entries: " + number_bios_entries);
  var remainder = number_bios_entries % CHAS_BIOS_BLOCK_SIZE;
  console.log("DEBUG [deCryptBios]> Bios remainder (looking for 0): " + remainder);
  CHAS_BIOS_TOTAL = number_bios_entries / CHAS_BIOS_BLOCK_SIZE;
  console.log("DEBUG [deCryptBios]> Events: " + CHAS_BIOS_TOTAL);
  if (( remainder != 0 )||( CHAS_BIOS_TOTAL == 0 )) {
    console.log("ERROR [deCryptBios]> Something funky going on with bios");
    return false;
  } else {
    return true;
  }
}

// Load in encrypted biography information
//enCryptBios(); // Run once to encrypt biography CHAS file
var CHAS_BIOS_VIABLE = deCryptBios(); // Normal runtime configuration

function loadCalendar() {
  // Load in calendar events
  var text_block = fs.readFileSync(SOURCE_CALENDAR, "utf-8");
  CHAS_EVENTS_CALENDAR = text_block.split("\n");
  // Catch if the calendar list is funky i.e. isn't in blocks of four or missing at least one set
  var number_calendar_entries = CHAS_EVENTS_CALENDAR.length;
  //console.log("DEBUG [loadCalendar]> Calendar entries: " + number_calendar_entries);
  var remainder = number_calendar_entries % CHAS_EVENTS_BLOCK_SIZE;
  //console.log("DEBUG [loadCalendar]> Calendar remainder (looking for 0): " + remainder);
  CHAS_EVENTS_TOTAL = number_calendar_entries / CHAS_EVENTS_BLOCK_SIZE;
  //console.log("DEBUG [loadCalendar]> Events: " + CHAS_EVENTS_TOTAL);
  if (( remainder != 0 )||( CHAS_EVENTS_TOTAL == 0 )) {
    console.log("ERROR [loadCalendar]> Something funky going on with calendar");
    return false;
  } else {
    return true;
  }
}
var CHAS_EVENTS_VIABLE = loadCalendar();

// ESTABLISH LISTENER
/* Only for TESTING via local NGROK.IO
const server = CHASbot.listen(server_port, server_ip_address, () => {
  console.log("INFO [NGROK.IO]> Listening on " + server_ip_address + ", port " + server_port );
  console.log("INFO [NGROK.IO]>>>>>>>>>>>>>>>>>>> STARTED <<<<<<<<<<<<<<<<<");
});*/
// Only for PRODUCTION hosting on HEROKU
const server = CHASbot.listen(server_port, () => {
 console.log("INFO [HEROKU]> Listening on ", + server_port);
 console.log("INFO [HEROKU]>>>>>>>>>>>>>>>>>> STARTED <<<<<<<<<<<<<<<<<<");
});

// Facebook/workplace validation
// Configure webhook in work chat integration - VERIFY_TOKEN matches code and app
// Copy page access token and hard code for testing or set as server variable
CHASbot.get('/webhook', (req, res) => {
  if (req.query['hub.mode'] && req.query['hub.verify_token'] === VERIFY_TOKEN) {
    res.status(200).send(req.query['hub.challenge']);
  } else {
    res.status(403).end();
  }
});

// Handling all messenges in and processing special cases
CHASbot.post('/webhook', (req, res) => {
  if (req.body.object === 'page') {
    req.body.entry.forEach((entry) => {
      entry.messaging.forEach((event) => {
        //if (event.read && event.read.watermark) { //console.log("DEBUG [postWebhook]> Receipt: " + event.read.watermark) };
        if (event.message && event.message.text) {
          FB_WHO = event.sender.id;
          // Clean input
          analyse_text = event.message.text;
          analyse_text = analyse_text.toLowerCase();
          // Check for custom triggers
          // Search
          SEARCH_TRIGGER = 0;
          var rightmost_starting_point = -1;
          var trigger_loop = 0;
          for (trigger_loop = 0; trigger_loop < SEARCH_METHODS.length; trigger_loop++){
            position_in_analyse_text = analyse_text.lastIndexOf(SEARCH_METHODS[trigger_loop]) + 1;
            if (position_in_analyse_text > 0) {
              starting_point = position_in_analyse_text + SEARCH_METHODS[trigger_loop].length;
              if (starting_point > rightmost_starting_point) { // Find right-most search term
                rightmost_starting_point = starting_point;
                ending_point = analyse_text.length;
                string_length = ending_point - starting_point;
                SEARCH_METHOD = SEARCH_METHODS[trigger_loop];
                //console.log("DEBUG [postWebhook]> Length is " + string_length + ", starting @ " + starting_point + " and go to " + ending_point);
                //console.log("DEBUG [postWebhook]> Search method found: " + SEARCH_METHOD);
                if (string_length > 0) {
                  SEARCH_TRIGGER = 1;
                  SEARCH_TERM = analyse_text.slice(starting_point,ending_point);
                  //console.log("DEBUG [postWebhook]> Search term: " + SEARCH_TERM);
                };
              };
            };
          };
          // Rock, Paper, Scissors, Lizard, Spock
          RPSLS_TRIGGER = 0;
          RPSLS_PICK_PLAYER = RPSLS_TRIGGER_PHRASE;
          if (RPSLS_IN_PLAY == 1) { // Only check if we are playing
            RPSLS_IN_PLAY = 0;
            trigger_loop = 0;
            for (trigger_loop = 0; trigger_loop < RPSLS_VALID.length; trigger_loop++){
              position_in_analyse_text = analyse_text.search(RPSLS_VALID[trigger_loop]) + 1;
              if (position_in_analyse_text > 0) {
                RPSLS_PICK_PLAYER = RPSLS_VALID[trigger_loop];
                //console.log("DEBUG [postWebhook]> " + RPSLS_PICK_PLAYER + " search result: " + position_in_analyse_text);
                RPSLS_TRIGGER = 3; // Evaluate the choice
                RPSLS_IN_PLAY = 1; // Keep playing
                break;
              };
            };
          };
          position_in_analyse_text = analyse_text.search(RPSLS_TRIGGER_PHRASE) + 1;
          //console.log("DEBUG [postWebhook]> " + RPSLS_TRIGGER_PHRASE + " search result: " + position_in_analyse_text);
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
          position_in_analyse_text = analyse_text.lastIndexOf(MARVEL_TIRGGER_PHRASE) + 1;
          //console.log("DEBUG [postWebhook]> " + MARVEL_TIRGGER_PHRASE + " phrase search result: " + position_in_analyse_text);
          if (position_in_analyse_text > 0) {
            starting_point = position_in_analyse_text + MARVEL_TIRGGER_PHRASE.length;
            ending_point = analyse_text.length;
            string_length = ending_point - starting_point;
            //console.log("DEBUG [postWebhook]> Length is " + string_length + ", starting @ " + starting_point + " and go to " + ending_point);
            if (string_length > 0) {
              MARVEL_TRIGGER = 1;
              HERO_WHO = analyse_text.slice(starting_point,ending_point);
              HERO_WHO = toTitleCase(HERO_WHO);
            };
          };
          // CHAS alphabet
          CHASABET_TRIGGER = 0;
          position_in_analyse_text = analyse_text.lastIndexOf(CHASABET_TIRGGER_PHRASE1) + 1;
          if (position_in_analyse_text == 0) {
            position_in_analyse_text = analyse_text.lastIndexOf(CHASABET_TIRGGER_PHRASE2) + 1;
            CHASABET_TRIGGER = 2;
          }
          //console.log("DEBUG [postWebhook]> " + CHASABET_TIRGGER_PHRASE1 + " or " + CHASABET_TIRGGER_PHRASE2 + " phrase search result: " + position_in_analyse_text);
          if (position_in_analyse_text > 0) {
            if (CHASABET_TRIGGER == 0) {
              starting_point = position_in_analyse_text + CHASABET_TIRGGER_PHRASE1.length;
            } else {
              starting_point = position_in_analyse_text + CHASABET_TIRGGER_PHRASE2.length;
            }
            ending_point = analyse_text.length;
            string_length = ending_point - starting_point;
            //console.log("DEBUG [postWebhook]> Length is " + string_length + ", starting @ " + starting_point + " and go to " + ending_point);
            if (string_length > 0) {
              // Strip string to first viable letter
              CHASABET_LETTER = analyse_text.slice(starting_point,ending_point);
              CHASABET_LETTER = firstAlpha(CHASABET_LETTER);
              if (CHASABET_LETTER != '') {
                CHASABET_TRIGGER = 1;
              };
            };
          };
          // CHAS logo
          CHAS_LOGO_TRIGGER = 0;
          position_in_analyse_text = analyse_text.search(CHAS_LOGO_TRIGGER_PHRASE) + 1;
          //console.log("DEBUG [postWebhook]> " + CHAS_LOGO_TRIGGER_PHRASE + " search result: " + position_in_analyse_text);
          if (position_in_analyse_text > 0) { CHAS_LOGO_TRIGGER = 1 };
          // CHAS Events
          CHAS_EVENTS_TRIGGER = 0;
          position_in_analyse_text = analyse_text.lastIndexOf(CHAS_EVENTS_TIRGGER_PHRASE) + 1;
          //console.log("DEBUG [postWebhook]> " + CHAS_EVENTS_TIRGGER_PHRASE + " phrase search result: " + position_in_analyse_text);
          if (position_in_analyse_text > 0) {
            starting_point = position_in_analyse_text + CHAS_EVENTS_TIRGGER_PHRASE.length;
            ending_point = analyse_text.length;
            string_length = ending_point - starting_point;
            //console.log("DEBUG [postWebhook]> Length is " + string_length + ", starting @ " + starting_point + " and go to " + ending_point);
            if (string_length > 0) {
              CHAS_EVENTS_TRIGGER = 1;
              CHAS_EVENTS_NAME = analyse_text.slice(starting_point,ending_point);
            };
          };
          // CHAS Bios
          CHAS_BIOS_TRIGGER = 0;
          position_in_analyse_text = analyse_text.lastIndexOf(CHAS_BIOS_TRIGGER_PHRASE) + 1;
          //console.log("DEBUG [postWebhook]> " + CHAS_BIOS_TRIGGER_PHRASE + " phrase search result: " + position_in_analyse_text);
          if (position_in_analyse_text > 0) {
            starting_point = position_in_analyse_text + CHAS_BIOS_TRIGGER_PHRASE.length;
            ending_point = analyse_text.length;
            string_length = ending_point - starting_point;
            //console.log("DEBUG [postWebhook]> Length is " + string_length + ", starting @ " + starting_point + " and go to " + ending_point);
            if (string_length > 0) {
              CHAS_BIOS_TRIGGER = 1;
              CHAS_BIOS_NAME = analyse_text.slice(starting_point,ending_point);
            };
          };
          // Pick a response route
          if (MARVEL_TRIGGER == 1){
            //console.log("DEBUG [postWebhook]> Marvel Character: " + HERO_WHO);
            getMarvelChar(HERO_WHO,event);
          } else if (CHASABET_TRIGGER == 1) {
            //console.log("DEBUG [postWebhook]> CHAS alpahbet: " + CHASABET_LETTER);
            getAlphabetCHAS(CHASABET_LETTER,event);
          } else if (CHAS_EVENTS_TRIGGER == 1 && CHAS_EVENTS_VIABLE) {
            //console.log("DEBUG [postWebhook]> CHAS event: " + CHAS_EVENTS_NAME);
            getEventCHAS(CHAS_EVENTS_NAME,event);
          } else if (CHAS_BIOS_TRIGGER == 1 && CHAS_BIOS_VIABLE) {
            //console.log("DEBUG [postWebhook]> CHAS bios: " + CHAS_BIOS_NAME);
            getBiosCHAS(CHAS_BIOS_NAME,event);
          } else if (RPSLS_TRIGGER > 0) {
            //console.log("DEBUG [postWebhook]> RPSLSpock: " + RPSLS_PICK_PLAYER);
            getRPSLS(event);
          } else if (SEARCH_TRIGGER == 1) {
            //console.log("DEBUG [postWebhook]> Search: " + SEARCH_TERM);
            postSearch(event);
          } else if (CHAS_LOGO_TRIGGER == 1) {
            //console.log("DEBUG [postWebhook]> Logo");
            console.log("INFO [postWebhook]> Sender: " + FB_WHO);
            console.log("INFO [postWebhook]> Request: " + CHAS_LOGO_TRIGGER_PHRASE);
            console.log("INFO [postWebhook]> Action: postWebhook.postImage");
            console.log("INFO [postWebhook]> Response: IMG URL " + CHAS_THUMB);
            postImage(CHAS_THUMB,event)
          } else {
            //console.log("DEBUG [postWebhook]> No special cases, send via APIAI");
            sendMessageViaAPIAI(event);
          }
        }
      });
    });
    res.status(200).end();
  }
});

// Strng handling functions
function toTitleCase(inputString) {
  return inputString.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}
function firstAlpha(inputString) {
  for (var i = 0; i < inputString.length; i += 1) {
    if ((inputString.charAt(i) >= 'A' && inputString.charAt(i) <= 'Z') ||
        (inputString.charAt(i) >= 'a' && inputString.charAt(i) <= 'z')) {
        return inputString.charAt(i);
    }
  }
  return '';
}
function trimTo(trim_length,inputString) {
  if (inputString.length > trim_length) { inputString = inputString.slice(0,trim_length-1) + "🤐" };
  return inputString;
}

// SENDING SECTION
// Send structured template
function sendTemplate(event) {
  // messageData set outside of function call
  let sender = event.sender.id;
  request({
    uri: FB_MESSENGER_ENDPOINT,
    qs: {access_token: PAGE_ACCESS_TOKEN},
    method: 'POST',
    json: {
      recipient: {id: sender},
      message: messageData
    }
  }, function (error, response) {
    if (error) {
        console.log("ERROR [sendTemplate]> Error sending template message: ", error);
    } else if (response.body.error) {
        console.log("ERROR [sendTemplate]> Undefined: ", response.body.error);
    }
  });
}

function sendTextDirect(event) {
  // messageText set outside of function call
  let sender = event.sender.id;
  request({
    uri: FB_MESSENGER_ENDPOINT,
    qs: {access_token: PAGE_ACCESS_TOKEN},
    method: 'POST',
    json: {
      recipient: {id: sender},
      message: {text: trimTo(640,messageText)}
    }
  }, function (error, response) {
    if (error) {
      console.log("ERROR [sendTextDirect]> Error sending simple message: ", error);
    } else if (response.body.error) {
      console.log("ERROR [sendTextDirect]> Undefined: ", response.body.error);
    }
  }); // request
}

// Message request pinged off of API.AI for response
function sendMessageViaAPIAI(event) {
  let sender = event.sender.id;
  let text = event.message.text;
  let apiai = dialogFlow.textRequest(text, {
    sessionId: 'chasbot_sessionID' // Arbitrary id
  });
  apiai.on('response', (response) => {
    let aiText = response.result.fulfillment.speech;
    console.log("INFO [sendMessageViaAPIAI]> Sender: " + FB_WHO);
    console.log("INFO [sendMessageViaAPIAI]> Request: " + response.result.resolvedQuery);
    if (response.result.action == '') {
      console.log("INFO [sendMessageViaAPIAI]> Action: " + response.result.metadata.intentName);
    } else {
      console.log("INFO [sendMessageViaAPIAI]> Action: " + response.result.action);
    }
    console.log("INFO [sendMessageViaAPIAI]> Response: " + aiText);
    request({
      uri: FB_MESSENGER_ENDPOINT,
      qs: {access_token: PAGE_ACCESS_TOKEN},
      method: 'POST',
      json: {
        recipient: {id: sender},
        message: {text: trimTo(640,aiText)}
      }
    }, (error, response) => {
      if (error) {
        console.log("ERROR [sendMessageViaAPIAI]> Error sending via APIAI message: ", error);
      } else if (response.body.error) {
        console.log("ERROR [sendMessageViaAPIAI]> Undefined: ", response.body.error);
      }
    });
  });
  apiai.on('error', (error) => {
    console.log("ERROR [sendMessageViaAPIAI]> Undefined: " + error);
  });
  apiai.end();
}

// Webhook for API.ai to get response from the 3rd party API
CHASbot.post('/heroku', (req, res) => {
  //console.log("DEBUG [postAI]> " + req.body.result);
  if (req.body.result.action === 'weather') {
    // Set a default weather location
    var city = 'Edinburgh';
    if (typeof req.body.result.parameters['geo-city-gb'] != 'undefined') {
      city = req.body.result.parameters['geo-city-gb'];
      //console.log("DEBUG [postAI]> Location @ :" + city);
    };
    if (typeof req.body.result.parameters['hospice_places'] != 'undefined') {
      city = req.body.result.parameters['hospice_places'];
      //console.log("DEBUG [postAI]> Hospice @ :" + city);
    };
    let restUrl = 'http://api.openweathermap.org/data/2.5/weather?APPID='+WEATHER_API_KEY+'&q='+city;
    //console.log("DEBUG [postAI]> Weather URL: " + restUrl);
    request.get(restUrl, (err, response, body) => {
      if (!err && response.statusCode == 200) {
        let json = JSON.parse(body);
        //console.log("DEBUG [postAI]> " + json);
        let tempF = ~~(json.main.temp * 9/5 - 459.67);
        let tempC = ~~(json.main.temp - 273.15);
        let msg = 'The current condition in ' + json.name + ' is ' + json.weather[0].description + ' and the temperature is ' + tempF + ' ℉ (' +tempC+ ' ℃).'
        return res.json({
          speech: msg,
          displayText: trimTo(640,msg),
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
  } else if (req.body.result.action === 'cards'){
    CARD_PICK = CARD_DECK[Math.floor(Math.random()*CARD_DECK.length)];
    let msg = CARD_PROMPTS[CARD_PROMPT] + CARD_PICK;
    CARD_PROMPT = CARD_PROMPT + 1;
    if (CARD_PROMPT == CARD_PROMPTS.length) { CARD_PROMPT = 0 };
    return res.json({
      speech: msg,
      displayText: trimTo(640,msg),
      source: 'cards'
    });
  }
});

function postImage(image_url,pass_on_event) {
  //console.log("DEBUG [postImage]> Input: " + image_url);
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

function postMarvelResults(pass_on_event,result_or_not) {
  //console.log("DEBUG [postMarvelResults]> Pass or Fail: " + result_or_not);
  console.log("INFO [postMarvelResults]> Sender: " + FB_WHO);
  console.log("INFO [postMarvelResults]> Request: " + MARVEL_TIRGGER_PHRASE + " " + HERO_WHO);
  console.log("INFO [postMarvelResults]> Action: getMarvelChar.postMarvelResults");
  if (result_or_not == 1) {
    console.log("INFO [postMarvelResults]> Reponse: Successful");
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
    console.log("INFO [postMarvelResults]> Reponse: Unuccessful");
    messageText = HERO_OOPS[HERO_OOPS_INDEX] + ' try something instead of ' + HERO_WHO + '?'; // Required within sendTextDirect
    HERO_OOPS_INDEX = HERO_OOPS_INDEX + 1;
    if (HERO_OOPS_INDEX == HERO_OOPS.length) { HERO_OOPS_INDEX = 0 };
    sendTextDirect(pass_on_event);
  };
}

function postResultsEventsCHAS(pass_on_event,result_or_not) {
  //console.log("DEBUG [postResultsEventsCHAS]> Pass or Fail: " + result_or_not);
  console.log("INFO [postResultsEventsCHAS]> Sender: " + FB_WHO);
  console.log("INFO [postResultsEventsCHAS]> Request: " + CHAS_EVENTS_TIRGGER_PHRASE + " " + CHAS_EVENTS_NAME);
  console.log("INFO [postResultsEventsCHAS]> Action: getEventCHAS.postResultsEventsCHAS");
  if (result_or_not == 1) {
    console.log("INFO [postResultsEventsCHAS]> Reponse: Successful");
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
    console.log("INFO [postResultsEventsCHAS]> Reponse: Unsuccessful");
    messageText = CHAS_EVENTS_OOPS[CHAS_EVENTS_OOPS_INDEX] + ' try something instead of ' + toTitleCase(CHAS_EVENTS_NAME) + '?'; // Required within sendTextDirect
    CHAS_EVENTS_OOPS_INDEX = CHAS_EVENTS_OOPS_INDEX + 1;
    if (CHAS_EVENTS_OOPS_INDEX == CHAS_EVENTS_OOPS.length) { CHAS_EVENTS_OOPS_INDEX = 0 };
    sendTextDirect(pass_on_event);
  };
}

function postResultsBiosCHAS(pass_on_event,result_or_not) {
  //console.log("DEBUG [postResultsBiosCHAS]> Input: " + pass_on_event);
  console.log("INFO [postResultsBiosCHAS]> Sender: " + FB_WHO);
  console.log("INFO [postResultsBiosCHAS]> Request: " + CHAS_BIOS_TRIGGER_PHRASE + " " + CHAS_BIOS_NAME);
  console.log("INFO [postResultsBiosCHAS]> Action: getBiosCHAS.postResultsBiosCHAS");
  if (result_or_not == 1) {
    //console.log("DEBUG [postResultsBiosCHAS]> Index: " + CHAS_BIOS_INDEX);
    console.log("INFO [postResultsBiosCHAS]> Reponse: Successful");
    messageText = CHAS_BIOS[CHAS_BIOS_INDEX + 1];
    //console.log("DEBUG [postResultsBiosCHAS]> Result: " + CHAS_BIOS[CHAS_BIOS_INDEX + 1]);
    sendTextDirect(pass_on_event);
  } else {
    console.log("INFO [postResultsBiosCHAS]> Reponse: Unsuccessful");
    sendMessageViaAPIAI(pass_on_event);
  };
}

function postSearch(pass_on_event) {
  //console.log("DEBUG [postSearch]> Input: " + pass_on_event);
  console.log("INFO [postSearch]> Sender: " + FB_WHO);
  console.log("INFO [postSearch]> Request: " + SEARCH_METHOD + ' ' + SEARCH_TERM);
  console.log("INFO [postSearch]> Action: postSearch.sendTemplate");
  var search_title = '';
  var search_image_url = '';
  var search_url = '';
  if (SEARCH_METHOD == "google") {
    search_title = 'Search Google';
    search_image_url = URL_GOOGLE;
    search_url = SEARCH_GOOGLE + SEARCH_TERM;
  } else if (SEARCH_METHOD == "wiki") {
    search_title = 'Search Wikipedia';
    search_image_url = URL_WIKI;
    search_url = SEARCH_WIKI + SEARCH_TERM;
  } else if (SEARCH_METHOD == "beeb") {
    search_title = 'Search BBC';
    search_image_url = URL_BEEB;
    search_url = SEARCH_BEEB + SEARCH_TERM;
  }
  let search_template = {
    attachment: {
      type: "template",
      payload: {
        template_type: "generic",
        elements: [
          {
          title: search_title,
          image_url: search_image_url,
          default_action: {
            type: "web_url",
            url: search_url,
            messenger_extensions: false,
            webview_height_ratio: "tall"
            } // default_action
          } // elements
        ] // elements
      } // payload
    } // attachment
  }; // template
  let carousel_template = {
    attachment: {
      type: "template",
      payload: {
        template_type: "generic",
        elements: [{
          title: "Search Google",
          image_url: URL_GOOGLE,
          default_action: {
            type: "web_url",
            url: SEARCH_GOOGLE + SEARCH_TERM,
            messenger_extensions: false,
            webview_height_ratio: "tall"
          }
        },{
          title: "Search Wikipedia",
          image_url: URL_WIKI,
          default_action: {
            type: "web_url",
            url: SEARCH_WIKI + SEARCH_TERM,
            messenger_extensions: false,
            webview_height_ratio: "tall"
          }
        },{
          title: "Search BBC",
          image_url: URL_BEEB,
          default_action: {
            type: "web_url",
            url: SEARCH_BEEB + SEARCH_TERM,
            messenger_extensions: false,
            webview_height_ratio: "tall"
          }
        }]
      }
    }
  };
  if (SEARCH_METHOD == "search") {
    console.log("INFO [postSearch]> Reponse: Search Carousel");
    messageData = carousel_template;
    sendTemplate(pass_on_event);
  } else {
    console.log("INFO [postSearch]> Reponse: Simple Search");
    messageData = search_template;
    sendTemplate(pass_on_event);
  }
}

// Fetch back special queries
function getAlphabetCHAS(LetterTile,pass_in_event) {
  //console.log("DEBUG [getAlphabetCHAS]> Input: " + LetterTile);
  console.log("INFO [getAlphabetCHAS]> Sender: " + FB_WHO);
  console.log("INFO [getAlphabetCHAS]> Request: " + CHASABET_TIRGGER_PHRASE1 + " or " + CHASABET_TIRGGER_PHRASE2 + " " + LetterTile);
  console.log("INFO [getAlphabetCHAS]> Action: getAlphabetCHAS.postImage");
  var target_letter_code = LetterTile.charCodeAt(0) - 97;
  var target_version = CHASABET_INDEX[target_letter_code];
  CHASABET_URL = IMG_URL_PREFIX + CHASABET[target_letter_code][target_version] + IMG_URL_SUFFIX;
  console.log("INFO [getAlphabetCHAS]> Reponse: IMG URL " + CHASABET_URL);
  //console.log("DEBUG [getAlphabetCHAS]> IMAGE URL: " + CHASABET_URL);
  CHASABET_INDEX[target_letter_code] = target_version + 1;
  if (CHASABET_INDEX[target_letter_code] == CHASABET[target_letter_code].length) {
    CHASABET_INDEX[target_letter_code] = 0;
  };
  postImage(CHASABET_URL,pass_in_event);
}

function getMarvelChar(MarvelWho,pass_in_event) {
  //console.log("DEBUG [getMarvelChar]> Input: " + MarvelWho);
  // String together a URL using the provided keys and search parameters
  HERO_DESCRIPTION = '';
  var url = "https://gateway.marvel.com/v1/public/characters?nameStartsWith=" + MarvelWho + "&apikey=" + MARVEL_PUBLIC_KEY;
  var ts = new Date().getTime();
  var hash = crypto.createHash('md5').update(ts + MARVEL_PRIVATE_KEY + MARVEL_PUBLIC_KEY).digest('hex');
  url += "&ts=" + ts + "&hash=" + hash;
  //console.log("DEBUG [getMarvelChar]> Lookup: " + url);
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
        //console.log("DEBUG [getMarvelChar]> Character Code: " + characterData.code);
        if (characterData.code === 200) { // Successful response from Marvel
          if (characterData['data'].count > 0) { // Multiple viable characters found
            HERO_DESCRIPTION += "More than one result, so just showing the first. ";
          };
          if (characterData['data'].count == 0) { // A successful response doesn't mean there was a match
            //console.log("DEBUG [getMarvelChar]> Valid URL but no results for " + toTitleCase(HERO_WHO));
            postMarvelResults(pass_in_event,0);
            return;
          } else if (characterData['data'].results[0].description !== '') { // Assess the first result back
            HERO_DESCRIPTION += characterData.data.results[0].description;
            //console.log("DEBUG [getMarvelChar]> Description: " + HERO_DESCRIPTION);
            HERO_THUMB = characterData.data.results[0].thumbnail.path + '/standard_xlarge.jpg';
            //console.log("DEBUG [getMarvelChar]> Thumbnail: " + HERO_THUMB);
            HERO_URL = characterData.data.results[0].urls[0].url;
            //console.log("DEBUG [getMarvelChar]> Hero URL: " + HERO_URL);
            postMarvelResults(pass_in_event,1);
            return;
          } else { // Assess the first result back when there isn't a description provided by Marvel
            HERO_DESCRIPTION += "Find out more at Marvel.";
            //console.log("DEBUG [getMarvelChar]> Description: " + HERO_DESCRIPTION);
            HERO_THUMB = characterData.data.results[0].thumbnail.path + '/standard_xlarge.jpg';
            //console.log("DEBUG [getMarvelChar]> Thumbnail: " + HERO_THUMB);
            HERO_URL = characterData.data.results[0].urls[0].url;
            //console.log("DEBUG [getMarvelChar]> Hero URL: " + HERO_URL);
            postMarvelResults(pass_in_event,1);
            return;
          }
        } else if (characterData.code === "RequestThrottled") {
            console.log("ERROR [getMarvelChar]> RequestThrottled Error");
            postMarvelResults(pass_in_event,0);
            return;
        } else {
            console.log("ERROR [getMarvelChar]> Error: " + JSON.stringify(result));
            postMarvelResults(pass_in_event,0);
            return;
        }
    });
  });
}

function getEventCHAS(EventName,pass_in_event) {
  //console.log("DEBUG [getEventCHAS]> Input: " + EventName);
  CHAS_EVENTS_INDEX = -1;
  CHAS_EVENTS_NAME = EventName;
  // Take the input provded by the user...
  // ...convert to lowercase
  EventName = EventName.toLowerCase();
  // 5k special case
  EventName = EventName.replace(/5k/g, 'fivek');
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
  //console.log("DEBUG [getEventCHAS]> Cleaned message is: " + compare_to_string);
  //console.log("DEBUG [getEventCHAS]> Length: " + stripped_sentence_length);
  var error_caught = false; // Gets changed to true, if things go iffy before the end
  if ( stripped_sentence_length == 0 ) {
    //console.log("DEBUG [getEventCHAS]> There is nothing left to compare");
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
  //console.log("DEBUG [getEventCHAS]> Total events: " + CHAS_EVENTS_TOTAL);
  for (event_loop = 0; event_loop < CHAS_EVENTS_TOTAL; event_loop++){
    // Break up the keywords into an array of individual words
    var sentence_split = CHAS_EVENTS_CALENDAR[event_loop * CHAS_EVENTS_BLOCK_SIZE].split(' ');
    var sentence_length = sentence_split.length;
    //console.log("DEBUG [getEventCHAS]> Number of words: " + sentence_length);
    // If there are no keywords at all, the skip the rest of this iteration
    if (sentence_length == 0) {continue};
    // Reset variables for the inner loop
    stripped_message_count = 0;
    regex_builder = '';
    for (keyword_loop = 0; keyword_loop < sentence_length; keyword_loop++) {
      // Make lowercase
      next_stripped_word = sentence_split[keyword_loop].toLowerCase();
      // 5k special case
      next_stripped_word = next_stripped_word.replace(/5k/g, 'fivek');
      // 10k special case
      next_stripped_word = next_stripped_word.replace(/10k/g, 'tenk');
      // Strip out all but letters from each keyword and skip small words
      next_stripped_word = next_stripped_word.replace(/[^A-Za-z]/g, '');
      if (!(( next_stripped_word == 'the' ) || ( next_stripped_word == 'in' ) ||
            ( next_stripped_word == 'at' ) || ( next_stripped_word == 'on' ))) {
        regex_builder = regex_builder + REGEX_START + next_stripped_word + REGEX_MIDDLE;
        //console.log("DEBUG [getEventCHAS]> Next word: " + next_stripped_word);
        stripped_message_count = stripped_message_count + 1;
      }
    }
    // Nothing left to compare because search terms have all been stripped out
    if (stripped_message_count == 0) {continue};
    // Complete the search terms regular expression
    regex_builder = regex_builder + REGEX_END;
    //console.log("DEBUG [getEventCHAS]> Stripped number of words: " + stripped_message_count);
    //console.log("DEBUG [getEventCHAS]> Regex search: " + regex_builder);
    zero_is_a_match = compare_to_string.search(regex_builder);
    //console.log("DEBUG [getEventCHAS]> Match Check: " + zero_is_a_match);
    // If there is a match then a value of 0 is returned
    if (zero_is_a_match == 0){
      //console.log("DEBUG [getEventCHAS]> Matched: " + (event_loop * CHAS_EVENTS_BLOCK_SIZE));
      // Sets the index value for the name/keywords for the event
      CHAS_EVENTS_INDEX = event_loop * CHAS_EVENTS_BLOCK_SIZE;
      found_event = true;
      break;
    }
  }
  // If there is not an event found then things have gone funky
  if (!found_event) {
    //console.log("DEBUG [getEventCHAS]> No matching event found");
    error_caught = true;
  }
  if (error_caught) {
    postResultsEventsCHAS(pass_in_event,0);
  } else {
    postResultsEventsCHAS(pass_in_event,1);
  }
}

function getBiosCHAS(PersonName,pass_in_event) {
  //console.log("DEBUG [getBiosCHAS]> Input: " + PersonName);
  CHAS_BIOS_INDEX = -1;
  CHAS_BIOS_NAME = PersonName;
  // Take the input provded by the user...
  // ...convert to lowercase
  PersonName = PersonName.toLowerCase();
  var compare_to_string = PersonName;
  // Remove spaces just to check the final length of the alpha content
  PersonName = PersonName.replace(/\s/g, '');
  var stripped_sentence_length = PersonName.length;
  //console.log("DEBUG [getBiosCHAS]> Cleaned message is: " + compare_to_string);
  //console.log("DEBUG [getBiosCHAS]> Length: " + stripped_sentence_length);
  var error_caught = false; // Gets changed to true, if things go iffy before the end
  if ( stripped_sentence_length == 0 ) {
    //console.log("DEBUG [getBiosCHAS]> There is nothing left to compare");
    error_caught = true;
  }
  // Variables
  var stripped_message_count = 0;
  var regex_builder = '';
  var next_stripped_word = '';
  var found_bio = false;
  var zero_is_a_match = -1;
  var event_loop = 0;
  var keyword_loop = 0;
  // Here we go looping through each set of keywords
  //console.log("DEBUG [getBiosCHAS]> Total: " + CHAS_BIOS_TOTAL);
  for (event_loop = 0; event_loop < CHAS_BIOS_TOTAL; event_loop++){
    // Break up the keywords into an array of individual words
    var sentence_split = CHAS_BIOS[event_loop * CHAS_BIOS_BLOCK_SIZE].split(' ');
    var sentence_length = sentence_split.length;
    //console.log("DEBUG [getBiosCHAS]> Number of words: " + sentence_length);
    // If there are no keywords at all, the skip the rest of this iteration
    if (sentence_length == 0) {continue};
    // Reset variables for the inner loop
    stripped_message_count = 0;
    regex_builder = '';
    for (keyword_loop = 0; keyword_loop < sentence_length; keyword_loop++) {
      // Make lowercase
      next_stripped_word = sentence_split[keyword_loop].toLowerCase();
      // Strip out all but letters from each keyword and skip small words
      next_stripped_word = next_stripped_word.replace(/[^A-Za-z]/g, '');
      regex_builder = regex_builder + REGEX_START + next_stripped_word + REGEX_MIDDLE;
      //console.log("DEBUG [getBiosCHAS]> Next word: " + next_stripped_word);
      stripped_message_count = stripped_message_count + 1;
    }
    // Nothing left to compare because search terms have all been stripped out
    if (stripped_message_count == 0) {continue};
    // Complete the search terms regular expression
    regex_builder = regex_builder + REGEX_END;
    //console.log("DEBUG [getBiosCHAS]> Stripped number of words: " + stripped_message_count);
    //console.log("DEBUG [getBiosCHAS]> Regex search: " + regex_builder);
    zero_is_a_match = compare_to_string.search(regex_builder);
    //console.log("DEBUG [getBiosCHAS]> Match Check: " + zero_is_a_match);
    // If there is a match then a value of 0 is returned
    if (zero_is_a_match == 0){
      //console.log("DEBUG [getBiosCHAS]> Matched: " + (event_loop * CHAS_BIOS_BLOCK_SIZE));
      // Sets the index value for the name/keywords for the event
      CHAS_BIOS_INDEX = event_loop * CHAS_BIOS_BLOCK_SIZE;
      found_bio = true;
      break;
    }
  }
  // If there is not a name found then things have gone funky
  if (!found_bio) {
    //console.log("DEBUG [getBiosCHAS]> No matching name found");
    error_caught = true;
  }
  if (error_caught) {
    postResultsBiosCHAS(pass_in_event,0);
  } else {
    postResultsBiosCHAS(pass_in_event,1);
  }
}

function getRPSLS(pass_in_event) {
  //console.log("DEBUG [getRPSLS]> Round");
  if (RPSLS_TRIGGER == 1) { // Provide some instructions + prompt
    postImage(IMG_URL_PREFIX + RPSLS_IMGS[0] + IMG_URL_SUFFIX,pass_in_event);
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
    //console.log("DEBUG [getRPSLS]> PLAYERvBOT: " + PLAYERvBOT);
    // Check WIN
    var find_index = 0;
    for (find_index = 0; find_index < RPSLS_WIN.length; find_index++) {
      //console.log("DEBUG [getRPSLS]> Win check: " + RPSLS_WIN[find_index]);
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
      find_index = 0;
      for (find_index = 0; find_index < RPSLS_LOSE.length; find_index++) {
        //console.log("DEBUG [getRPSLS]> Lose check: " + RPSLS_LOSE[find_index]);
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
      find_index = 0;
      for (find_index = 0; find_index < RPSLS_DRAW.length; find_index++) {
        //console.log("DEBUG [getRPSLS]> Draw check: " + RPSLS_DRAW[find_index]);
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
    postImage(RPSLS_IMG_URL,pass_in_event);
    sendTextDirect(pass_in_event);
  };
}
