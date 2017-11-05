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
const GROUP_LINKS_ROOT = process.env.GROUP_LINKS_ROOT;
// Set-up dependecies for app
const express = require('express'); // https://expressjs.com
const bodyParser = require('body-parser'); // https://github.com/expressjs/body-parser
const request = require('request'); // https://github.com/request/request
const dialogFlow = require('apiai')(APIAI_TOKEN); // https://www.npmjs.com/package/apiai
// Node.js libraries used
const http = require('https'); // https://nodejs.org/api/https.html
const crypto = require('crypto'); // https://nodejs.org/api/crypto.html
const fs = require("fs"); // https://nodejs.org/api/fs.html
// Initialise CHASbot
const CHASbot = express();
CHASbot.use(bodyParser.json());
CHASbot.use(bodyParser.urlencoded({ extended: true }));
// Messenger templates can be found at:
// https://developers.facebook.com/docs/messenger-platform/send-messages/templates
// End-points
const FB_MESSENGER_ENDPOINT = "https://graph.facebook.com/v2.6/me/messages";
const WEATHER_API_URL = "http://api.openweathermap.org/data/2.5/weather?APPID=";
const MARVEL_API_URL = "https://gateway.marvel.com/v1/public/characters?nameStartsWith="
const GROUP_DOCS = "https://work-" + GROUP_LINKS_ROOT + ".facebook.com/groups/1707079182933694";
const GROUP_DOCS_TXT = "For an answer to this and other similar questions, visit and join the group that stores the library of all relevant CHAS forms, documents and policies.";
const CHAS_RETAIL = "https://www.chas.org.uk/contact_chas#retail";
const CHAS_RETAIL_TXT = "🎄 Christmas cards and more are available now from our shops or by mail order.";
// Free secure linkable image hosting at https://imgbox.com
const IMG_URL_PREFIX = "https://images.imgbox.com/";
const IMG_URL_PREFIX2 = "https://images2.imgbox.com/";
const IMG_URL_SUFFIX = "_o.png";
const CHAS_THUMB = 'https://images.imgbox.com/99/1d/bFWYzY68_o.jpg';
const SOURCE_SURVEY = "./survey.txt"; // Same directory as source code
const SOURCE_CALENDAR = "./calendar.txt"; // Same directory as source code
const SOURCE_BIOGRAPHIES = "./bios_private.txt"; // Same directory as source code // "./fundraising_private.txt" "./ids_private.txt"
const ENCRYPTED_BIOGRAPHIES = "./bios_public.txt"; // Same directory as source code //
const ENCRYPTED_FR_CARD = "./fundraising_public.txt";
const ENCRYPTED_IDS = "./ids_public.txt";
var server_port = process.env.PORT || 9000; //8080;
var server_ip_address = '127.0.0.1'; // Only for testing via local NGROK.IO
// Triggers in lowercase - following phrases are handled in code
const CHASBOT_SURVEY_TRIGGER_PHRASE = 'survey';
const CHASBOT_HELP_TRIGGER_PHRASE = 'help';
const CHASBOT_FEELING_LUCKY_TRIGGER_PHRASE = 'feeling lucky';
const CHAS_LOGO_TRIGGER_PHRASE = 'chas logo';
const CHASABET_TIRGGER_PHRASE1 = 'chas alphabet';
const CHASABET_TIRGGER_PHRASE2 = 'chas letter';
const MARVEL_TIRGGER_PHRASE = 'marvel codename';
const CHAS_EVENTS_TIRGGER_PHRASE = 'when is';
const CHAS_BIOS_TRIGGER_PHRASE = 'who is';
const RPSLS_TRIGGER_PHRASE = 'bazinga';
const HANGMAN_TRIGGER_PHRASE = 'hangman';
const STOP_PHRASE = 'stop';
var SEARCH_METHODS = new Array ("search","google","wiki","beeb");
// DialogFlow fulfillment
const DIALOGFLOW_ACTION_SLIM_SHADY = 'slim_shady';
const DIALOGFLOW_ACTION_FUNDRAISING = 'fundraising';
const DIALOGFLOW_ACTION_PICKCARD = 'cards';
const DIALOGFLOW_ACTION_WEATHER = 'weather';
const DIALOGFLOW_ACTION_GROUP_DOCS = 'group_docs';
const DIALOGFLOW_ACTION_XMAS = 'xmas';
var DIALOGFLOW_ACTION_TEMPLATE = false;
// For message handling
let messageData = '';
let messageText = '';
let messageTextExtra = '';
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
var SEARCH_TRIGGER = false;
// CHASbot help
var CHASBOT_HELP_PROMPTS = [
  ["ad/e9/ivBhjDXd","When is the Devil Dash","Who is Morven MacLean","Where can I get collecting cans","How do I claim expenses","How do I get Christmas cards","CHAS alphabet C"],
  ["7a/45/0uhs3nQx","Weather at Rachel House","Weather in Aberdeen","Search CHAS","Google FB Workplace","Wiki Santa Claus","Beeb Blue Planet"],
  ["9a/f7/yRfMnV7i","Bazinga","Hangman","Pick a card","Toss a coin","Roll a dice","Magic 8"],
  ["0a/fe/WxsCGnFs","What’s a scrub","Is winter coming","My milkshake","Witness me","Is this the real life","I want the truth"],
  ["de/ff/4ZtuUqYX","Marvel codename Hulk","Execute Order 66","Beam me up","Open pod bay doors","Roll for initiative","Talk like Yoda"]
]; // images2 source
var HELP_SEND = false;
var CHASBOT_HELP_TRIGGER = false;
var CHASBOT_HELP_INDEX = 0;
// CHAS events
const REGEX_START = '(?=.*\\b'; // Regular expression bits
const REGEX_MIDDLE = '\\b)';
const REGEX_END = '.+';
const CHAS_EVENTS_BLOCK_SIZE = 4;
var CHAS_EVENTS_TRIGGER = false;
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
var CHAS_BIOS_VIABLE = false;
var CHAS_BIOS_TRIGGER = false;
var CHAS_BIOS = new Array();
var CHAS_BIOS_TOTAL = 0;
var CHAS_BIOS_INDEX = -1;
var CHAS_BIOS_NAME = '';
var CHAS_FR_CARD = "Contact your local Fundraising Team:" + "\n";
// Slim Shady
const TIME_TO_WAIT = 7200000; // 2 hours = 1000 * 60 * 120
const IDS_BLOCK_SIZE = 2;
var IDS_VIABLE = false;
var IDS_TOTAL = 0;
var IDS_LIST = new Array();
var FB_WHO_ID = 0;
var FB_WHO = '';
var FB_WHO_ESTABLSIHED = false;
var LAST_TIMESTAMP = null;
var TIME_OF_DAY = [
  [22,"Getting late"],[19,"Good evening"],[18,"Time for tea"],[13,"Afternoon"],[12,"Lunch time"],
  [11,"Time for Elevenses"],[8,"Morning"],[7,"Breakfast time"],[6,"Another day another dollar"],
  [5,"Whoa, you're an early bird"],[4,"You're up early (or very late)"],[3,"Yawn, worst time to be awake"],
  [2,"You're up late"],[1,"Zzzzz, sorry"],[0,"It's the witching hour"]
];
var RANDOMISED_COMPLIMENT = [
  "Looking good.","You're more fun than bubblewrap.","I bet you do crossword puzzles in ink.",
  "You're like a breath of fresh air.","You're like sunshine on a rainy day.","On a scale from 1 to 10, you're an 11.",
  "Your smile is contagious.","You know how to find that silver lining.","You're inspiring.","I like your style.",
  "You're a great listener.","I bet you sweat glitter.","You were cool way before hipsters.",
  "Hanging out with you is always a blast.","You're one of a kind.","You always know just what to say.",
  "There's ordinary, and then there's you."
];
var GREETING_MESSAGE = [
  "Pleasure to meet you,","Joy to meet you,","Nice to meet you,","Great to meet you,","Hi,","Hello,","Hey,",
  "Good chating with you,","Nice chatting with you,","How do you do,","You have a lovely name,"
];
var GREETING_MESSAGE_INDEX = 0;
// CHAS logo
var CHAS_LOGO_TRIGGER = false;
// CHAS alphabet
var CHASABET_TRIGGER = 0;
var CHASABET_LETTER = ''; // Result
var CHASABET_URL = ''; // Result
var CHASABET = new Array();
CHASABET [0] = ["b1/96/zO6mBcwI","a5/59/dH8YmE0D","28/ca/zIHlflOC"]; // A
CHASABET [1] = ["a7/6b/ykRlRXQ4","35/79/3Fm87p1Z","69/18/7Jwe1SDT"]; // B
CHASABET [2] = ["70/0e/A6ZJwetJ","33/25/aueWYGEx","d9/7e/LaVqtDUQ","85/b1/qh0uavuP"]; // C
CHASABET [3] = ["4a/a3/NqUpBNz4","ef/4c/z5RNxmlD"]; // D
CHASABET [4] = ["63/f7/XaiHgD71","ce/ac/9nCwH3g9","35/3d/TcTbkDhK"]; // E
CHASABET [5] = ["87/c5/ap69ZMxm","ce/20/wUUatq8C"]; // F
CHASABET [6] = ["49/5d/eC9uvi9B","ff/3b/pmvdcWts"]; // G
CHASABET [7] = ["b5/90/PvvkWezf","f5/bf/UXiVHjNV","b6/e0/Tcqrhxhp","ac/2b/eZ5jnY3u","6f/19/EZadWwIQ"]; // H
CHASABET [8] = ["8b/6a/7NVhU4DB","e4/de/dhkBg1G6","ff/35/GWYGOn6L"]; // I
CHASABET [9] = ["50/96/RJQnEZTR","39/a9/rQJGozJp"]; // J
CHASABET [10] = ["a2/d8/Js4Pp0yx","8a/48/3BMq2BbT"]; // K
CHASABET [11] = ["47/a9/rEoruoPl","ce/8e/XQgh4mnL"]; // L
CHASABET [12] = ["e4/d9/3aBWWbLv","9b/f7/YaUMcKiy","8a/24/EUOb4ml4"]; // M
CHASABET [13] = ["a7/b6/I4LznlDF","c5/56/WnE5akMy"]; // N
CHASABET [14] = ["15/78/HIa3Mfir","0f/72/VgMNNoMu"]; // O
CHASABET [15] = ["ef/30/jcLeoia1","00/5c/EKuPupn8","83/0a/dxQuIG6C"]; // P
CHASABET [16] = ["99/c2/eHly9qnq"]; // Q
CHASABET [17] = ["ef/1c/CUsKXwFq","f8/96/qJJm4MIB"]; // R
CHASABET [18] = ["0b/02/O7uHlTst","fd/fe/Tae390bV","95/97/GCCT6cS1","00/ed/yR9lW1az","3c/36/HzHUAz82"]; // S
CHASABET [19] = ["a3/8d/r0xzFJPR","aa/a0/koSvqmVT"]; // T
CHASABET [20] = ["2d/47/F50Ty0wO","d9/04/C1nlNJpU","08/e4/y1bij5xT","fb/a8/pTmffp5t"]; // U
CHASABET [21] = ["d9/da/kzg0lQ8V","e1/79/F9f57NK1"]; // V
CHASABET [22] = ["6e/ec/Hd1zypGj","95/0b/xyZtCqje","b0/f5/wBb2EsqF"]; // W
CHASABET [23] = ["e9/0c/nB1EzCck","2e/60/2ETG0nZa"]; // X
CHASABET [24] = ["2a/4a/9R5ZzF7V","d0/23/QDFnWi52"]; // Y
CHASABET [25] = ["f6/89/4pwI187X","3c/4f/AguL64HL"]; // Z
var CHASABET_INDEX = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
// For Marvel API
// Keys above
var MARVEL_TRIGGER = false;
var MARVEL_SEND = false;
var HERO_WHO = ''; // Result
var HERO_WHO_NOW = '';
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
// Rock Paper Scissors Lizard Spock
const RPSLS_INTRO = "💡 First to five is the champion. Scissors cuts Paper, Paper covers Rock, Rock crushes Lizard, Lizard poisons Spock, Spock smashes Scissors, Scissors decapitates Lizard, Lizard eats Paper, Paper disproves Spock, Spock vaporizes Rock, and Rock crushes Scissors!";
const RPSLS_PROMPT = "Choose... Rock, Paper, Scissors, Lizard or Spock?";
var RPSLS_VALID = ["rock","paper","scissors","lizard","spock"];
var RPSLS_OUTCOMES = ["cuts","covers","crushes","poisons","smashes","decapitates","eats","disproves","vaporizes","crushes"];
var RPSLS_WIN = ["scissorspaper","paperrock","rocklizard","lizardspock","spockscissors","scissorslizard","lizardpaper","paperspock","spockrock","rockscissors"];
var RPSLS_LOSE = ["paperscissors","rockpaper","lizardrock","spocklizard","scissorsspock","lizardscissors","paperlizard","spockpaper","rockspock","scissorsrock"];
var RPSLS_DRAW = ["rockrock","paperpaper","scissorsscissors","lizardlizard","spockspock"];
var RPSLS_IMGS = [
"8a/24/7grzIThv",
"60/ab/GGWv7VGf","5b/aa/gX9yjh8W","de/9a/ZW4Y0A3c","9b/b0/jozAYCPJ","fc/69/9RIO0UnP","ae/96/fImaS52o","e6/d8/NZf7rjvm","ce/75/2lShOY7A","1c/c0/v4T6eRgk","39/85/kCcL35Wx",
"7c/cc/6aXrZ3OR","57/e7/gXFlvW70","49/29/I58HCq4Z","ea/83/4oIJFaQX","35/46/6jfnQOWP","51/27/Mgd2xmkH","5b/43/75oya7i9","65/e5/J9Pi4L30","6d/76/wmyBvmzC","1c/dd/A1qkLRfu",
"bc/5e/WXSBV3m7","7f/65/UufJXgwL","4b/4f/JO6B4jVX","5c/00/lLBYnA89","41/8b/iDCFzS5i"]; // Bottom row images2 source
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
var CARD_DECK  = [
"♥A","♥2","♥3","♥4","♥5","♥6","♥7","♥8","♥9","♥10","♥J","♥Q","♥K",
"♠A","♠2","♠3","♠4","♠5","♠6","♠7","♠8","♠9","♠10","♠J","♠Q","♠K",
"♦A","♦2","♦3","♦4","♦5","♦6","♦7","♦8","♦9","♦10","♦J","♦Q","♦K",
"♣A","♣2","♣3","♣4","♣5","♣6","♣7","♣8","♣9","♣10","♣J","♣Q","♣K"];
var CARD_PROMPTS = [
  "I've picked... ","This time I've drawn... ","I've selected... ","You're card is... "];
var CARD_PROMPT = 0;
// Hangman
var HANGMAN_IN_PLAY = false;
var HANGMAN_TRIGGER = false;
var HANGMAN_REMAINING = 0;
var HANGMAN_STRIKES = 0;
var HANGMAN_GUESS = '';
var HANGMAN_WORD = '';
var HANGMAN_ANSWER = '';
var HANGMAN_ANSWER_ARRAY = [];
var HANGMAN_STRIKE_STRING = ["👍👍👍","👍👍👎","👍👎👎","👎👎👎"];
// survey
var CHASBOT_SURVEY_IN_PLAY = false;
var CHASBOT_SURVEY_TRIGGER = false;
var CHASBOT_SURVEY_FINAL_CHECK = false;
var CHASBOT_SURVEY_VIABLE  = true;
var CHASBOT_SURVEY_NAME = ""; // Loaded from survey.txt 1st line
var CHASBOT_SURVEY_QUESTIONS = [];
var CHASBOT_SURVEY_QUESTION_NUMBER = 0;

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
  var stream = fs.createWriteStream(ENCRYPTED_IDS, "utf-8");
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

function deCryptContents () {
  var text_block = fs.readFileSync(ENCRYPTED_BIOGRAPHIES, "utf-8");
  var text_block_split_garbled = text_block.split("\n");
  CHAS_BIOS = new Array();
  var decrypt_loop = 0;
  for (decrypt_loop = 0; decrypt_loop < text_block_split_garbled.length; decrypt_loop++) {
    CHAS_BIOS[decrypt_loop] = deCrypt(text_block_split_garbled[decrypt_loop]);
  };
  var number_bios_entries = CHAS_BIOS.length;
  //console.log("DEBUG [deCryptContents]> Bios entries: " + number_bios_entries);
  var remainder = number_bios_entries % CHAS_BIOS_BLOCK_SIZE;
  //console.log("DEBUG [deCryptContents]> Bios remainder (looking for 0): " + remainder);
  CHAS_BIOS_TOTAL = number_bios_entries / CHAS_BIOS_BLOCK_SIZE;
  //console.log("DEBUG [deCryptContents]> Events: " + CHAS_BIOS_TOTAL);
  if ((remainder != 0)||(CHAS_BIOS_TOTAL == 0)) {
    console.log("ERROR [deCryptContents]> Something funky going on with bios");
    CHAS_BIOS_VIABLE = false;
  } else {
    CHAS_BIOS_VIABLE = true;
  };
  text_block = fs.readFileSync(ENCRYPTED_IDS, "utf-8");
  text_block_split_garbled = text_block.split("\n");
  IDS_LIST = new Array();
  decrypt_loop = 0;
  for (decrypt_loop = 0; decrypt_loop < text_block_split_garbled.length; decrypt_loop++) {
    IDS_LIST[decrypt_loop] = deCrypt(text_block_split_garbled[decrypt_loop]);
  };
  var number_ids_entries = IDS_LIST.length;
  //console.log("DEBUG [deCryptContents]> ID entries: " + number_ids_entries);
  remainder = number_ids_entries % IDS_BLOCK_SIZE;
  //console.log("DEBUG [deCryptContents]> ID remainder (looking for 0): " + remainder);
  IDS_TOTAL = number_ids_entries / IDS_BLOCK_SIZE;
  //console.log("DEBUG [deCryptContents]> IDs: " + IDS_TOTAL);
  if ((remainder != 0)||(IDS_TOTAL == 0)) {
    console.log("ERROR [deCryptContents]> Something funky going on with IDs");
    IDS_VIABLE = false;
  } else {
    IDS_VIABLE = true;
  };
  text_block = fs.readFileSync(ENCRYPTED_FR_CARD, "utf-8");
  text_block_split_garbled = text_block.split("\n");
  decrypt_loop = 0;
  for (decrypt_loop = 0; decrypt_loop < text_block_split_garbled.length; decrypt_loop++) {
    CHAS_FR_CARD = CHAS_FR_CARD + deCrypt(text_block_split_garbled[decrypt_loop]);
    if (decrypt_loop != text_block_split_garbled.length) {CHAS_FR_CARD = CHAS_FR_CARD + "\n"};
  };
  //console.log("DEBUG [deCryptContents]> Contact Card: " + CHAS_FR_CARD);
}

// Load in encrypted biography information
//enCryptBios(); // Run once to encrypt biography CHAS file
deCryptContents(); // Normal runtime configuration

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
  if ((remainder != 0)||(CHAS_EVENTS_TOTAL == 0)) {
    console.log("ERROR [loadCalendar]> Something funky going on with calendar");
    return false;
  } else {
    return true;
  }
}
var CHASBOT_VIABLE = loadCalendar();

function loadSurvey() {
  var gone_funky = false;
  // Load in survey as a block
  var text_block = fs.readFileSync(SOURCE_SURVEY, "utf-8");
  // Populate a temp array
  var load_array = text_block.split("\n");
  // Configure the survey
  if (load_array.length > 3) {
    for (var i = 0; i < load_array.length; i++) {
      CHASBOT_SURVEY_QUESTIONS[i] = load_array[i].split(","); // Split each row into arrays split by comma
      if (i==0 && CHASBOT_SURVEY_QUESTIONS[0].length != 1) {
        gone_funky = true; // First row has to be <survey_name> without commas
        break;
      } else if (i==0 && CHASBOT_SURVEY_QUESTIONS[0].length == 1) {
        CHASBOT_SURVEY_NAME = CHASBOT_SURVEY_QUESTIONS[0];
        // Delete first row later ****************************
      } else if (i>1 && CHASBOT_SURVEY_QUESTIONS[i].length > 6) {
        gone_funky = true; // Can't have more than 6 elements i.e. Question + 5 Answers
      };// if/else
    }; // for
    if (!gone_funky) {
      CHASBOT_SURVEY_QUESTIONS.shift(); // Removes <survey_name>
    }
  } else {
    // Has to be at least 3 rows
    gone_funky = true;
  };
  if (gone_funky) {
    console.log("ERROR [loadSurvey]> Something funky going on with survey");
    return false;
  } else {
    return true;
  };
}
var CHASBOT_SURVEY_VIABLE = loadSurvey();

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
});/

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

// Keep Heroku alive
setInterval(function() {
    http.get("https://chasbot.herokuapp.com/");
}, 900000); // every 15 minutes

// Handling all messenges in and processing special cases
CHASbot.post('/webhook', (req, res) => {
  if (req.body.object === 'page') {
    req.body.entry.forEach((entry) => {
      entry.messaging.forEach((event) => {
        //if (event.read && event.read.watermark) { //console.log("DEBUG [postWebhook]> Receipt: " + event.read.watermark) };
        if (event.message && event.message.text) {
          FB_WHO_ID = event.sender.id;
          // Lookup ID
          if (!FB_WHO_ESTABLSIHED && IDS_VIABLE) {
            var find_index = 0;
            var match_id = 0;
            for (find_index = 0; find_index < IDS_TOTAL; find_index++) {
              // 1,3,5 etc.
              match_id = IDS_LIST[find_index * IDS_BLOCK_SIZE + 1];
              //console.log("DEBUG [postWebhook]> Find match for ID (" + FB_WHO_ID + "): " + match_id);
              if (FB_WHO_ID == match_id) {
                FB_WHO = IDS_LIST[find_index * IDS_BLOCK_SIZE];
                //console.log("DEBUG [postWebhook]> Matched to: " + FB_WHO);
                FB_WHO_ESTABLSIHED = true;
                break;
              }
            };
          }
          // Prime personalised response
          if (LAST_TIMESTAMP == null||new Date().getTime() - LAST_TIMESTAMP > TIME_TO_WAIT) {
            //console.log("DEBUG [postWebhook]> Interval since last message has been: " + TIME_TO_WAIT);
            if (FB_WHO_ESTABLSIHED) {
              var hr = new Date().getHours();
              for (var loop_hour = 0; loop_hour < TIME_OF_DAY.length; loop_hour++) {
                if (hr >= TIME_OF_DAY[loop_hour][0]) {
                  messageTextExtra = TIME_OF_DAY[loop_hour][1];
                  break;
                }
              };
              messageTextExtra = messageTextExtra + ' ' + FB_WHO + '. ' + RANDOMISED_COMPLIMENT[Math.floor(Math.random()*RANDOMISED_COMPLIMENT.length)] + ' ';
              //console.log("DEBUG [postWebhook]> Segue: " + messageTextExtra);
            };
            LAST_TIMESTAMP = new Date().getTime();
          } else {
            messageTextExtra = '';
          }
          // Clean input
          analyse_text = event.message.text;
          analyse_text = analyse_text.toLowerCase();
          // Check for custom triggers
          // Survey
          var valid_choice = false;
          if (CHASBOT_SURVEY_IN_PLAY||CHASBOT_SURVEY_FINAL_CHECK) {
            position_in_analyse_text = analyse_text.search(STOP_PHRASE) + 1;
            if (position_in_analyse_text > 0) {
              // Reset
              CHASBOT_SURVEY_FINAL_CHECK = false;
              CHASBOT_SURVEY_IN_PLAY = false;
              CHASBOT_SURVEY_QUESTION_NUMBER = 0;
            } else if (CHASBOT_SURVEY_QUESTIONS[CHASBOT_SURVEY_QUESTION_NUMBER - 1].length == 1) { // Free text response
              valid_choice = true;
            } else {
              for (var i = 1; i < CHASBOT_SURVEY_QUESTIONS[CHASBOT_SURVEY_QUESTION_NUMBER - 1].length; i++) {
                position_in_analyse_text = event.message.text.search(CHASBOT_SURVEY_QUESTIONS[CHASBOT_SURVEY_QUESTION_NUMBER - 1][i]) + 1;
                if (position_in_analyse_text > 0) {
                  var xstr = event.message.text;
                  if (xLength(xstr) == 1) {event.message.text = i.toString()};
                  valid_choice = true;
                  break;
                };
              };
            };
            if (valid_choice) {
              console.log('SURVEY [' + CHASBOT_SURVEY_NAME + '],' + FB_WHO_ID + ',' + CHASBOT_SURVEY_QUESTION_NUMBER + ',' + event.message.text);
            } else {
              // Repeat previous question
              CHASBOT_SURVEY_QUESTION_NUMBER = CHASBOT_SURVEY_QUESTION_NUMBER - 1;
              CHASBOT_SURVEY_FINAL_CHECK = false;
            }
          };
          // Trigger the survey
          position_in_analyse_text = event.message.text.search(CHASBOT_SURVEY_TRIGGER_PHRASE) + 1;
          if (position_in_analyse_text > 0 && CHASBOT_SURVEY_VIABLE) {
            // Initialise
            CHASBOT_SURVEY_FINAL_CHECK = false;
            CHASBOT_SURVEY_IN_PLAY = true;
            CHASBOT_SURVEY_QUESTION_NUMBER = 0;
          }
          // Feeling lucky
          position_in_analyse_text = analyse_text.search(CHASBOT_FEELING_LUCKY_TRIGGER_PHRASE) + 1;
          //console.log("DEBUG [postWebhook]> " + CHASBOT_FEELING_LUCKY_TRIGGER_PHRASE + " search result: " + position_in_analyse_text);
          if (position_in_analyse_text > 0) {
            // Math.floor(Math.random()*(max-min+1)+min);
            var cat = Math.floor(Math.random()*5); // 0 to 4
            var ind = Math.floor(Math.random()*6+1); // 1 to 6
            event.message.text = CHASBOT_HELP_PROMPTS[cat][ind];
            analyse_text = event.message.text;
            analyse_text = analyse_text.toLowerCase();
            messageText = '*' + event.message.text + '*';
            sendTextDirect(event);
          }
          // Help
          CHASBOT_HELP_TRIGGER = false;
          position_in_analyse_text = analyse_text.search(CHASBOT_HELP_TRIGGER_PHRASE) + 1;
          //console.log("DEBUG [postWebhook]> " + CHASBOT_HELP_TRIGGER_PHRASE + " search result: " + position_in_analyse_text);
          if (position_in_analyse_text > 0) {
            CHASBOT_HELP_TRIGGER = true;
            HELP_SEND = true;
            var help_url = IMG_URL_PREFIX2 + CHASBOT_HELP_PROMPTS[CHASBOT_HELP_INDEX][0] + IMG_URL_SUFFIX;
            //console.log("DEBUG [postWebhook]> Help URL: " + help_url);
            messageText = "Try some of these:";
            for (var i = 1; i < 7; i++) {
              messageText = messageText + '\n' + CHASBOT_HELP_PROMPTS[CHASBOT_HELP_INDEX][i];
            };
            messageText = messageText + '\n' + "Type *help* for more or try *feeling lucky*";
            //console.log("DEBUG [postWebhook]> Help text: " + messageText);
            CHASBOT_HELP_INDEX = CHASBOT_HELP_INDEX + 1;
            if (CHASBOT_HELP_INDEX > 4) { CHASBOT_HELP_INDEX = 0 };
          };
          // Hangman
          HANGMAN_TRIGGER = false;
          HANGMAN_GUESS = '';
          if (HANGMAN_IN_PLAY) { // Only check if we are playing
            //console.log("DEBUG [postWebhook]> Hangman in play.");
            position_in_analyse_text = analyse_text.search(STOP_PHRASE) + 1;
            if (position_in_analyse_text > 0) {
              HANGMAN_IN_PLAY = false;
              //console.log("DEBUG [postWebhook]> Hangman: Player wants to end i.e. " + analyse_text);
            } else if (analyse_text.length != 1) {
              messageText = "😞 One letter at a time please.";
              //console.log("DEBUG [postWebhook]> Hangman: Guess is too long i.e. " + analyse_text);
            } else if (analyse_text.match(/[a-z]/i)) {
              //console.log("DEBUG [postWebhook]> Hangman: Guess is valid i.e. " + analyse_text);
              HANGMAN_GUESS = analyse_text;
            } else { // Not an alpha
              //console.log("DEBUG [postWebhook]> Hangman: Guess is not an alpha i.e. " + analyse_text);
              messageText = "🔤 A letter would be nice.";
            };
          };
          // If the word typed is another trigger then it trumps the game and sets HANGMAN_IN_PLAY = false;
          // Typing hangman mid-game will start a new game
          position_in_analyse_text = analyse_text.search(HANGMAN_TRIGGER_PHRASE) + 1;
          //console.log("DEBUG [postWebhook]> " + HANGMAN_TRIGGER_PHRASE + " search result: " + position_in_analyse_text);
          if (CHAS_BIOS_VIABLE && position_in_analyse_text > 0) {
            HANGMAN_TRIGGER = true;
            HANGMAN_IN_PLAY = true;
            HANGMAN_STRIKES = 0;
            HANGMAN_ANSWER_ARRAY = [];
            HANGMAN_WORD = CHAS_BIOS[Math.floor(Math.random() * CHAS_BIOS_TOTAL) * CHAS_BIOS_BLOCK_SIZE - 2];
            HANGMAN_WORD = HANGMAN_WORD.toLowerCase();
            //console.log("DEBUG [postWebhook]> Mystery name: " + HANGMAN_WORD);
            // swap out spaces for under_scores
            HANGMAN_WORD = HANGMAN_WORD.replace(/\s/g, '_');
            // Set up the answer array
            HANGMAN_ANSWER_ARRAY = [];
            for (var i = 0; i < HANGMAN_WORD.length; i++) {
              if (HANGMAN_WORD[i] == '_') {
                HANGMAN_ANSWER_ARRAY[i] = "_";
              } else {
                HANGMAN_ANSWER_ARRAY[i] = "?";
              };
            };
            HANGMAN_ANSWER = HANGMAN_ANSWER_ARRAY.join(' ');
            messageText = "🤔 Figure out the mystery staff member name.\nType a letter to guess, or 'stop'.\nYour are allowed no more than 3 strikes.";
            messageText = messageText + "\n" + HANGMAN_ANSWER;
            messageText = messageText + "\n" + HANGMAN_STRIKE_STRING[HANGMAN_STRIKES] + " (" + HANGMAN_STRIKES + " strike";
            if (HANGMAN_STRIKES == 1) {
              messageText = messageText + ")";
            } else {
              messageText = messageText + "s)";
            };
            //console.log("DEBUG [postWebhook]> Hangman Initialise: " + messageText);
          };
          // Search
          SEARCH_TRIGGER = false;
          var rightmost_starting_point = -1;
          var trigger_loop = 0;
          for (trigger_loop = 0; trigger_loop < SEARCH_METHODS.length; trigger_loop++) {
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
                  SEARCH_TRIGGER = true;
                  HANGMAN_IN_PLAY = false; // Cxl Hangman
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
            for (trigger_loop = 0; trigger_loop < RPSLS_VALID.length; trigger_loop++) {
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
            HANGMAN_IN_PLAY = false; // Cxl Hangman
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
          MARVEL_TRIGGER = false;
          position_in_analyse_text = analyse_text.lastIndexOf(MARVEL_TIRGGER_PHRASE) + 1;
          //console.log("DEBUG [postWebhook]> " + MARVEL_TIRGGER_PHRASE + " phrase search result: " + position_in_analyse_text);
          if (position_in_analyse_text > 0) {
            starting_point = position_in_analyse_text + MARVEL_TIRGGER_PHRASE.length;
            ending_point = analyse_text.length;
            string_length = ending_point - starting_point;
            //console.log("DEBUG [postWebhook]> Length is " + string_length + ", starting @ " + starting_point + " and go to " + ending_point);
            if (string_length > 0) {
              MARVEL_TRIGGER = true;
              HANGMAN_IN_PLAY = false; // Cxl Hangman
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
                HANGMAN_IN_PLAY = false; // Cxl Hangman
              };
            };
          };
          // CHAS logo
          CHAS_LOGO_TRIGGER = false;
          position_in_analyse_text = analyse_text.search(CHAS_LOGO_TRIGGER_PHRASE) + 1;
          //console.log("DEBUG [postWebhook]> " + CHAS_LOGO_TRIGGER_PHRASE + " search result: " + position_in_analyse_text);
          if (position_in_analyse_text > 0) {
            CHAS_LOGO_TRIGGER = true;
            HANGMAN_IN_PLAY = false; // Cxl Hangman
          };
          // CHAS Events
          CHAS_EVENTS_TRIGGER = false;
          position_in_analyse_text = analyse_text.lastIndexOf(CHAS_EVENTS_TIRGGER_PHRASE) + 1;
          //console.log("DEBUG [postWebhook]> " + CHAS_EVENTS_TIRGGER_PHRASE + " phrase search result: " + position_in_analyse_text);
          if (position_in_analyse_text > 0) {
            starting_point = position_in_analyse_text + CHAS_EVENTS_TIRGGER_PHRASE.length;
            ending_point = analyse_text.length;
            string_length = ending_point - starting_point;
            //console.log("DEBUG [postWebhook]> Length is " + string_length + ", starting @ " + starting_point + " and go to " + ending_point);
            if (string_length > 0) {
              CHAS_EVENTS_TRIGGER = true;
              HANGMAN_IN_PLAY = false; // Cxl Hangman
              CHAS_EVENTS_NAME = analyse_text.slice(starting_point,ending_point);
            };
          };
          // CHAS Bios
          CHAS_BIOS_TRIGGER = false;
          position_in_analyse_text = analyse_text.lastIndexOf(CHAS_BIOS_TRIGGER_PHRASE) + 1;
          //console.log("DEBUG [postWebhook]> " + CHAS_BIOS_TRIGGER_PHRASE + " phrase search result: " + position_in_analyse_text);
          if (position_in_analyse_text > 0) {
            starting_point = position_in_analyse_text + CHAS_BIOS_TRIGGER_PHRASE.length;
            ending_point = analyse_text.length;
            string_length = ending_point - starting_point;
            //console.log("DEBUG [postWebhook]> Length is " + string_length + ", starting @ " + starting_point + " and go to " + ending_point);
            if (string_length > 0) {
              CHAS_BIOS_TRIGGER = true;
              HANGMAN_IN_PLAY = false; // Cxl Hangman
              CHAS_BIOS_NAME = analyse_text.slice(starting_point,ending_point);
            };
          };
          // Pick a response route
          if (CHASBOT_SURVEY_IN_PLAY||CHASBOT_SURVEY_FINAL_CHECK) {
            //console.log("DEBUG [postWebhook]> Survey);
            if (CHASBOT_SURVEY_FINAL_CHECK) {
              // End of survey and reset
              CHASBOT_SURVEY_FINAL_CHECK = false;
              CHASBOT_SURVEY_IN_PLAY = false;
              CHASBOT_SURVEY_QUESTION_NUMBER = 0;
              messageText = "❤️ Thanks for taking our little survey";
              sendTextDirect(event);
            } else {
              // Next survey question
              sendSurveyQuestion(event);
            };
          } else if (CHASBOT_HELP_TRIGGER) {
            //console.log("DEBUG [postWebhook]> Help: " + CHASBOT_HELP_INDEX);
            console.log("INFO [postWebhook]> Sender: " + FB_WHO_ID);
            console.log("INFO [postWebhook]> Request: " + CHASBOT_FEELING_LUCKY_TRIGGER_PHRASE);
            console.log("INFO [postWebhook]> Action: postWebhook.postImage");
            console.log("INFO [postWebhook]> Response: Help v." + CHASBOT_HELP_INDEX);
            postImage(help_url,event);
          } else if (MARVEL_TRIGGER) {
            //console.log("DEBUG [postWebhook]> Marvel Character: " + HERO_WHO);
            getMarvelChar(HERO_WHO,event);
          } else if (CHASABET_TRIGGER == 1) {
            //console.log("DEBUG [postWebhook]> CHAS alpahbet: " + CHASABET_LETTER);
            getAlphabetCHAS(CHASABET_LETTER,event);
          } else if (CHAS_EVENTS_TRIGGER && CHAS_EVENTS_VIABLE) {
            //console.log("DEBUG [postWebhook]> CHAS event: " + CHAS_EVENTS_NAME);
            getEventCHAS(CHAS_EVENTS_NAME,event);
          } else if (CHAS_BIOS_TRIGGER && CHAS_BIOS_VIABLE) {
            //console.log("DEBUG [postWebhook]> CHAS bios: " + CHAS_BIOS_NAME);
            getBiosCHAS(CHAS_BIOS_NAME,event);
          } else if (RPSLS_TRIGGER > 0) {
            //console.log("DEBUG [postWebhook]> RPSLSpock: " + RPSLS_PICK_PLAYER);
            getRPSLS(event);
          } else if (SEARCH_TRIGGER) {
            //console.log("DEBUG [postWebhook]> Search: " + SEARCH_TERM);
            postSearch(event);
          } else if (CHAS_LOGO_TRIGGER) {
            //console.log("DEBUG [postWebhook]> Logo");
            console.log("INFO [postWebhook]> Sender: " + FB_WHO_ID);
            console.log("INFO [postWebhook]> Request: " + CHAS_LOGO_TRIGGER_PHRASE);
            console.log("INFO [postWebhook]> Action: postWebhook.postImage");
            console.log("INFO [postWebhook]> Response: IMG URL " + CHAS_THUMB);
            postImage(CHAS_THUMB,event)
          } else if (HANGMAN_TRIGGER) {
            //console.log("DEBUG [postWebhook]> Hangman Initiated");
            console.log("INFO [postWebhook]> Sender: " + FB_WHO_ID);
            console.log("INFO [postWebhook]> Request: " + HANGMAN_TRIGGER_PHRASE);
            console.log("INFO [postWebhook]> Action: postWebhook.sendTextDirect");
            console.log("INFO [postWebhook]> Response: Hangman Mystery Name is " + HANGMAN_WORD);
            sendTextDirect(event)
          } else if (HANGMAN_IN_PLAY) {
            //console.log("DEBUG [postWebhook]> Hangman Guess: " + HANGMAN_GUESS);
            checkHangman(event);
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
  return inputString.replace(/\w\S*/g, function(txt) {return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
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
  if (inputString.length > trim_length) {inputString = inputString.slice(0,trim_length-1) + "🤐"};
  return inputString;
}
function xLength(str) {
  //http://blog.jonnew.com/posts/poo-dot-length-equals-two
  const joiner = "\u{200D}";
  const split = str.split(joiner);
  let count = 0;
  for (const s of split) {
    //removing the variation selectors
    const num = Array.from(s.split(/[\ufe00-\ufe0f]/).join("")).length;
    count += num;
  }
  //assuming the joiners are used appropriately
  return count / split.length;
}

// SENDING SECTION
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
  if (MARVEL_SEND || HELP_SEND) {
    sendTextDirect(event);
    MARVEL_SEND = false;
    HELP_SEND = false;
  }
}

function sendSurveyQuestion(event) {
  //console.log("SURVEY [" + CHASBOT_SURVEY_NAME + "]> In Progress");
  let sender = event.sender.id;
  var rspns_items = CHASBOT_SURVEY_QUESTIONS[CHASBOT_SURVEY_QUESTION_NUMBER].length;
  var qstn = CHASBOT_SURVEY_QUESTIONS[CHASBOT_SURVEY_QUESTION_NUMBER][0];
  switch (rspns_items) {
    case 1:
      var surveyTemplate = {
        text: trimTo(640,qstn)};
      break;
    case 2:
      var surveyTemplate = {
        text: trimTo(640,qstn),
        quick_replies:[
              { content_type:"text",
                title: CHASBOT_SURVEY_QUESTIONS[CHASBOT_SURVEY_QUESTION_NUMBER][1],
                payload:"<POSTBACK_PAYLOAD>" }]};
      break;
    case 3:
      var surveyTemplate = {
        text: trimTo(640,qstn),
        quick_replies:[
              { content_type:"text",
                title: CHASBOT_SURVEY_QUESTIONS[CHASBOT_SURVEY_QUESTION_NUMBER][1],
                payload:"<POSTBACK_PAYLOAD>" },
              { content_type:"text",
                title: CHASBOT_SURVEY_QUESTIONS[CHASBOT_SURVEY_QUESTION_NUMBER][2],
                payload:"<POSTBACK_PAYLOAD>" }]};
      break;
    case 4:
      var surveyTemplate = {
        text: trimTo(640,qstn),
        quick_replies:[
              { content_type:"text",
                title: CHASBOT_SURVEY_QUESTIONS[CHASBOT_SURVEY_QUESTION_NUMBER][1],
                payload:"<POSTBACK_PAYLOAD>" },
              { content_type:"text",
                title: CHASBOT_SURVEY_QUESTIONS[CHASBOT_SURVEY_QUESTION_NUMBER][2],
                payload:"<POSTBACK_PAYLOAD>" },
              { content_type:"text",
                title: CHASBOT_SURVEY_QUESTIONS[CHASBOT_SURVEY_QUESTION_NUMBER][3],
                payload:"<POSTBACK_PAYLOAD>" }]};
      break;
    case 5:
      var surveyTemplate = {
        text: trimTo(640,qstn),
        quick_replies:[
              { content_type:"text",
                title: CHASBOT_SURVEY_QUESTIONS[CHASBOT_SURVEY_QUESTION_NUMBER][1],
                payload:"<POSTBACK_PAYLOAD>" },
              { content_type:"text",
                title: CHASBOT_SURVEY_QUESTIONS[CHASBOT_SURVEY_QUESTION_NUMBER][2],
                payload:"<POSTBACK_PAYLOAD>" },
              { content_type:"text",
                title: CHASBOT_SURVEY_QUESTIONS[CHASBOT_SURVEY_QUESTION_NUMBER][3],
                payload:"<POSTBACK_PAYLOAD>" },
              { content_type:"text",
                title: CHASBOT_SURVEY_QUESTIONS[CHASBOT_SURVEY_QUESTION_NUMBER][4],
                payload:"<POSTBACK_PAYLOAD>" }]};
      break;
    case 6:
      var surveyTemplate = {
        text: trimTo(640,qstn),
        quick_replies:[
              { content_type:"text",
                title: CHASBOT_SURVEY_QUESTIONS[CHASBOT_SURVEY_QUESTION_NUMBER][1],
                payload:"<POSTBACK_PAYLOAD>" },
              { content_type:"text",
                title: CHASBOT_SURVEY_QUESTIONS[CHASBOT_SURVEY_QUESTION_NUMBER][2],
                payload:"<POSTBACK_PAYLOAD>" },
              { content_type:"text",
                title: CHASBOT_SURVEY_QUESTIONS[CHASBOT_SURVEY_QUESTION_NUMBER][3],
                payload:"<POSTBACK_PAYLOAD>" },
              { content_type:"text",
                title: CHASBOT_SURVEY_QUESTIONS[CHASBOT_SURVEY_QUESTION_NUMBER][4],
                payload:"<POSTBACK_PAYLOAD>" },
              { content_type:"text",
                title: CHASBOT_SURVEY_QUESTIONS[CHASBOT_SURVEY_QUESTION_NUMBER][5],
                payload:"<POSTBACK_PAYLOAD>" }]};
  }; // Switch
  request({
    uri: FB_MESSENGER_ENDPOINT,
    qs: {access_token: PAGE_ACCESS_TOKEN},
    method: 'POST',
    json: {
      recipient: {id: sender},
      message: surveyTemplate
    }
  }, function (error, response) {
    if (error) {
      console.log("ERROR [sendSurveyQuestion]> Error sending simple message: ", error);
    } else if (response.body.error) {
      console.log("ERROR [sendSurveyQuestion]> Undefined: ", response.body.error);
    }
  }); // request
  CHASBOT_SURVEY_QUESTION_NUMBER = CHASBOT_SURVEY_QUESTION_NUMBER + 1;
  if (CHASBOT_SURVEY_QUESTION_NUMBER == CHASBOT_SURVEY_QUESTIONS.length) {
    CHASBOT_SURVEY_IN_PLAY = false;
    CHASBOT_SURVEY_FINAL_CHECK = true;
  };
}

function sendTextDirect(event) {
  // messageText set outside of function call
  let sender = event.sender.id;
  if (messageTextExtra != '') {
    messageText = messageTextExtra + messageText;
    messageTextExtra = '';
  };
  request({
    uri: FB_MESSENGER_ENDPOINT,
    qs: {access_token: PAGE_ACCESS_TOKEN},
    method: 'POST',
    json: {
      recipient: {id: sender},
      message: {
        text: trimTo(640,messageText)
      }
    }
  }, function (error, response) {
    if (error) {
      console.log("ERROR [sendTextDirect]> Error sending simple message: ", error);
    } else if (response.body.error) {
      console.log("ERROR [sendTextDirect]> Undefined: ", response.body.error);
    }
  }); // request
  messageText = '';
}

// Message request pinged off of API.AI for response
function sendMessageViaAPIAI(event_dialog) {
  let sender = event_dialog.sender.id;
  let text = event_dialog.message.text;
  //if (CHASBOT_FEELING_LUCKY_TRIGGER) {
  //  text =
  //}
  let apiai = dialogFlow.textRequest(text, {
    sessionId: 'chasbot_sessionID' // Arbitrary id
  });
  apiai.on('response', (response) => {
    messageText = response.result.fulfillment.speech;
    console.log("INFO [sendMessageViaAPIAI]> Sender: " + FB_WHO_ID);
    console.log("INFO [sendMessageViaAPIAI]> Request: " + response.result.resolvedQuery);
    if (response.result.action == '') {
      console.log("INFO [sendMessageViaAPIAI]> Action: " + response.result.metadata.intentName);
    } else {
      console.log("INFO [sendMessageViaAPIAI]> Action: " + response.result.action);
    }
    if (DIALOGFLOW_ACTION_TEMPLATE) {
      console.log("INFO [sendMessageViaAPIAI]> Response: Template");
      sendTemplate(event_dialog);
      DIALOGFLOW_ACTION_TEMPLATE = false;
    } else {
      console.log("INFO [sendMessageViaAPIAI]> Response: " + messageTextExtra + ' ' + messageText);
      sendTextDirect(event_dialog);
    }
  });
  apiai.on('error', (error) => {
    console.log("ERROR [sendMessageViaAPIAI]> Undefined: " + error);
  });
  apiai.end();
}

// Webhook for API.ai to get response from the 3rd party API
CHASbot.post('/heroku', (req, res) => {
  //console.log("DEBUG [postHeroku]> " + req.body.result);
  if (req.body.result.action === DIALOGFLOW_ACTION_WEATHER) {
    // Set a default weather location
    var city = 'Edinburgh';
    if (typeof req.body.result.parameters['geo-city-gb'] != 'undefined') {
      city = req.body.result.parameters['geo-city-gb'];
      //console.log("DEBUG [postHeroku]> Location @ :" + city);
    };
    if (typeof req.body.result.parameters['hospice_places'] != 'undefined') {
      city = req.body.result.parameters['hospice_places'];
      //console.log("DEBUG [postHeroku]> Hospice @ :" + city);
    };
    let restUrl = WEATHER_API_URL + WEATHER_API_KEY + '&q=' + city;
    //console.log("DEBUG [postHeroku]> Weather URL: " + restUrl);
    request.get(restUrl, (err, response, body) => {
      if (!err && response.statusCode == 200) {
        let json = JSON.parse(body);
        //console.log("DEBUG [postHeroku]> " + json);
        let tempF = ~~(json.main.temp * 9/5 - 459.67);
        let tempC = ~~(json.main.temp - 273.15);
        messageText = 'The current condition in ' + json.name + ' is ' + json.weather[0].description + ' and the temperature is ' + tempF + ' ℉ (' +tempC+ ' ℃).'
        return res.json({
          speech: messageText,
          displayText: messageText
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
  } else if (req.body.result.action === DIALOGFLOW_ACTION_PICKCARD) {
    CARD_PICK = CARD_DECK[Math.floor(Math.random()*CARD_DECK.length)];
    messageText = CARD_PROMPTS[CARD_PROMPT] + CARD_PICK;
    CARD_PROMPT = CARD_PROMPT + 1;
    if (CARD_PROMPT == CARD_PROMPTS.length) {CARD_PROMPT = 0};
    return res.json({
      speech: messageText,
      displayText: messageText
    });
  } else if (req.body.result.action === DIALOGFLOW_ACTION_FUNDRAISING) {
    return res.json({
      speech: CHAS_FR_CARD,
      displayText: CHAS_FR_CARD
    });
    //console.log("DEBUG [postHeroku]> Send fundraising contact card");
  } else if (req.body.result.action === DIALOGFLOW_ACTION_SLIM_SHADY) {
    if (typeof req.body.result.parameters['given-name'] != 'undefined') {
      FB_WHO = req.body.result.parameters['given-name'];
      //console.log("DEBUG [postHeroku]> Slim shady: " + FB_WHO);
    };
    messageText = GREETING_MESSAGE[Math.floor(Math.random()*GREETING_MESSAGE.length)] + ' ' + FB_WHO + '.';
    LAST_TIMESTAMP = new Date().getTime();
    return res.json({
      speech: messageText,
      displayText: messageText
    });
  } else if (req.body.result.action === DIALOGFLOW_ACTION_GROUP_DOCS) {
    DIALOGFLOW_ACTION_TEMPLATE = true;
    primeLinkButton(GROUP_DOCS,GROUP_DOCS_TXT,'📚 Useful Documents');
    return res.json({
      speech: "Useful Documents Link",
      displayText: messageData
    });
  } else if (req.body.result.action === DIALOGFLOW_ACTION_XMAS) {
    DIALOGFLOW_ACTION_TEMPLATE = true;
    primeLinkButton(CHAS_RETAIL,CHAS_RETAIL_TXT,'🛍️ CHAS Retail');
    return res.json({
      speech: "CHAS Retail Contact Link",
      displayText: messageData
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

function primeLinkButton(link_url,reponse_msg,btn_msg) {
  //console.log("DEBUG [primeLinkButton]> Input: " + reponse_msg);
  let link_template = {
    attachment: {
      type: "template",
      payload: {
        template_type:"button",
        text: reponse_msg,
        buttons: [{
          type: 'web_url',
          url:  link_url,
          title:  btn_msg
        }] // buttons
      } // payload
    } // attachment
  }; // template
  messageData = link_template;
}

function postMarvelResults(pass_on_event,result_or_not) {
  //console.log("DEBUG [postMarvelResults]> Pass or Fail: " + result_or_not);
  console.log("INFO [postMarvelResults]> Sender: " + FB_WHO_ID);
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
            title: HERO_WHO_NOW,
            image_url: HERO_THUMB,
            default_action: {
              type: "web_url",
              url: HERO_URL,
              messenger_extensions: false,
              webview_height_ratio: "tall"
            } // default_action
          }] // elements
        } // payload
      } // attachment
    }; // template
    messageText = HERO_DESCRIPTION; // Required within sendTextDirect
    messageData = marvel_template; // Required within sendTemplate
    MARVEL_SEND = true;
    sendTemplate(pass_on_event);
  } else {
    console.log("INFO [postMarvelResults]> Reponse: Unuccessful");
    messageText = HERO_OOPS[HERO_OOPS_INDEX] + ' try something instead of ' + HERO_WHO + '?'; // Required within sendTextDirect
    HERO_OOPS_INDEX = HERO_OOPS_INDEX + 1;
    if (HERO_OOPS_INDEX == HERO_OOPS.length) {HERO_OOPS_INDEX = 0};
    sendTextDirect(pass_on_event);
  };
}

function postResultsEventsCHAS(pass_on_event,result_or_not) {
  //console.log("DEBUG [postResultsEventsCHAS]> Pass or Fail: " + result_or_not);
  console.log("INFO [postResultsEventsCHAS]> Sender: " + FB_WHO_ID);
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
          }] // elements
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
    if (CHAS_EVENTS_OOPS_INDEX == CHAS_EVENTS_OOPS.length) {CHAS_EVENTS_OOPS_INDEX = 0};
    sendTextDirect(pass_on_event);
  };
}

function postResultsBiosCHAS(pass_on_event,result_or_not) {
  //console.log("DEBUG [postResultsBiosCHAS]> Input: " + pass_on_event);
  console.log("INFO [postResultsBiosCHAS]> Sender: " + FB_WHO_ID);
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
  console.log("INFO [postSearch]> Sender: " + FB_WHO_ID);
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
        }] // elements
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
  };
}

function checkHangman(pass_on_event) {
  //console.log("DEBUG [checkHangman]> Input: " + pass_on_event);
  if (messageText == '') {
    var got_one = false;
    var i = 0; // an indexer into the array
    for (i = 0; i < HANGMAN_WORD.length; i++) {
      if (HANGMAN_WORD[i] == HANGMAN_GUESS) {
        HANGMAN_ANSWER_ARRAY[i] = HANGMAN_GUESS.toUpperCase(); // Swap the ? for the actual upper-case letter
        got_one = true;
        messageText = "Yes! " + HANGMAN_GUESS.toUpperCase() + " is in the answer.";
        messageText = messageText + "\n" + HANGMAN_ANSWER_ARRAY.join(' ');
        messageText = messageText + "\n" + HANGMAN_STRIKE_STRING[HANGMAN_STRIKES] + " (" + HANGMAN_STRIKES + " strike";
        if (HANGMAN_STRIKES == 1) {
          messageText = messageText + ")";
        } else {
          messageText = messageText + "s)";
        };
      };
    };
    // Count the remaining letters
    HANGMAN_REMAINING = 0;
    for (i = 0; i < HANGMAN_WORD.length; i++) {
      if (HANGMAN_ANSWER_ARRAY[i] == '?') {
        HANGMAN_REMAINING = HANGMAN_REMAINING + 1;
      };
    };
    // If no remaining letters, hurray, you won
    if (HANGMAN_REMAINING == 0) {
      HANGMAN_IN_PLAY = false;
      messageText = "Yes! You guessed the mystery staff member, " + HANGMAN_WORD.toUpperCase() + '!';
    };
    // Otherwise, wrong guess
    if (!got_one) {
      messageText = "Sorry, no " + HANGMAN_GUESS.toUpperCase() + " to be found.";
      HANGMAN_STRIKES = HANGMAN_STRIKES + 1;
      // Game Over
      if (HANGMAN_STRIKES == 4) {
        HANGMAN_IN_PLAY = false;
        messageText = messageText + '\n' + 'The mystery staff member was ' + HANGMAN_WORD.toUpperCase() + '!'
      } else {
        messageText = messageText + "\n" + HANGMAN_ANSWER_ARRAY.join(' ');
        messageText = messageText + "\n" + HANGMAN_STRIKE_STRING[HANGMAN_STRIKES] + " (" + HANGMAN_STRIKES + " strike";
        if (HANGMAN_STRIKES == 1) {
          messageText = messageText + ")";
        } else {
          messageText = messageText + "s)";
        };
      };
    };
  };
  console.log("INFO [checkHangman]> Sender: " + FB_WHO_ID);
  console.log("INFO [checkHangman]> Request: Hangman guess was " + HANGMAN_GUESS);
  console.log("INFO [checkHangman]> Action: checkHangman.sendTextDirect");
  console.log("INFO [checkHangman]> Response: " + messageText);
  sendTextDirect(pass_on_event);
}

// Fetch back special queries
function getAlphabetCHAS(LetterTile,pass_in_event) {
  //console.log("DEBUG [getAlphabetCHAS]> Input: " + LetterTile);
  console.log("INFO [getAlphabetCHAS]> Sender: " + FB_WHO_ID);
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
  var url = MARVEL_API_URL + MarvelWho + "&apikey=" + MARVEL_PUBLIC_KEY;
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
          if (characterData['data'].count == 0) { // A successful response doesn't mean there was a match
            //console.log("DEBUG [getMarvelChar]> Valid URL but no results for " + toTitleCase(HERO_WHO));
            postMarvelResults(pass_in_event,0);
            return;
          } else if (characterData['data'].results[0].description !== '') { // Assess the first result back
            HERO_WHO_NOW = MarvelWho;
            HERO_DESCRIPTION = characterData.data.results[0].description;
            //console.log("DEBUG [getMarvelChar]> Description: " + HERO_DESCRIPTION);
            HERO_THUMB = characterData.data.results[0].thumbnail.path + '/standard_xlarge.jpg';
            //console.log("DEBUG [getMarvelChar]> Thumbnail: " + HERO_THUMB);
            HERO_URL = characterData.data.results[0].urls[0].url;
            //console.log("DEBUG [getMarvelChar]> Hero URL: " + HERO_URL);
            postMarvelResults(pass_in_event,1);
            return;
          } else { // Assess the first result back when there isn't a description provided by Marvel
            HERO_WHO_NOW = MarvelWho;
            HERO_DESCRIPTION = "Find out more at Marvel.";
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
  if (stripped_sentence_length == 0) {
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
  for (event_loop = 0; event_loop < CHAS_EVENTS_TOTAL; event_loop++) {
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
      if (!((next_stripped_word == 'the') || (next_stripped_word == 'in') ||
            (next_stripped_word == 'at') || (next_stripped_word == 'on'))) {
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
    if (zero_is_a_match == 0) {
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
  if (stripped_sentence_length == 0) {
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
  for (event_loop = 0; event_loop < CHAS_BIOS_TOTAL; event_loop++) {
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
    if (zero_is_a_match == 0) {
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
  console.log("INFO [getRPSLS]> Sender: " + FB_WHO_ID);
  if (RPSLS_TRIGGER == 1) { // Provide some instructions + prompt
    console.log("INFO [getRPSLS]> Request: " + RPSLS_TRIGGER_PHRASE);
    RPSLS_IMG_URL = IMG_URL_PREFIX + RPSLS_IMGS[0] + IMG_URL_SUFFIX;
    postImage(RPSLS_IMG_URL,pass_in_event);
    messageText = RPSLS_INTRO + "\n" + RPSLS_PROMPT; // Required within sendTextDirect
    console.log("INFO [getRPSLS]> Action: getRPSLS.postImage_sendTextDirect");
    console.log("INFO [getRPSLS]> Reponse: IMG URL "  + RPSLS_IMG_URL + '; Text: ' + messageText);
    sendTextDirect(pass_in_event);
  } else if (RPSLS_TRIGGER == 2) { // Just prompt
    console.log("INFO [getRPSLS]> Request: " + RPSLS_TRIGGER_PHRASE);
    messageText = RPSLS_PROMPT; // Required within sendTextDirect
    console.log("INFO [getRPSLS]> Action: getRPSLS.sendTextDirect");
    console.log("INFO [getRPSLS]> Reponse: " + messageText);
    sendTextDirect(pass_in_event);
  } else { // Compare results and show outcome
    console.log("INFO [getRPSLS]> Request: " + RPSLS_PICK_PLAYER);
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
          RPSLS_IMG_URL = IMG_URL_PREFIX2 + RPSLS_IMGS[21 + find_index] + IMG_URL_SUFFIX;
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
    console.log("INFO [getRPSLS]> Action: getRPSLS.postImage_sendTextDirect");
    console.log("INFO [getRPSLS]> Reponse: IMG URL "  + RPSLS_IMG_URL + '; Text: ' + messageText);
    postImage(RPSLS_IMG_URL,pass_in_event);
    sendTextDirect(pass_in_event);
  };
}
