/* __ _  _   _   ___ _         _
 / __| || | /_\ / __| |__  ___| |_
| (__| __ |/ _ \\__ \ '_ \/ _ \  _|
 \___|_||_/_/ \_\___/_.__/\___/\__| CHAS (C) 2017
 Build 2020.2 Refactored for DialogFlow v2*/

// Make sure everything is properly defined
'use strict';
// Pick up variables from the server implementation || Remove API keys
// Source: https://github.com/CHASbotGIT/CHASbotNodeHooks
const KEY_IV = process.env.KEY_IV;
const KEY_ROOT = process.env.KEY_ROOT;
const KEY_ADMIN = process.env.KEY_ADMIN;
const KEY_VERIFY = process.env.KEY_VERIFY;
const KEY_CRYPTO = process.env.KEY_CRYPTO;
const URL_CHASBOT = process.env.APP_URL;
const URL_POSTGRES = process.env.DATABASE_URL;
const KEY_API_GIPHY = process.env.KEY_API_GIPHY;
const KEY_DIALOGFLOW = process.env.KEY_DIALOGFLOW;
const KEY_PAGE_ACCESS = process.env.KEY_PAGE_ACCESS;
const KEY_API_WEATHER = process.env.KEY_API_WEATHER;
const KEY_API_MOVIEDB = process.env.KEY_API_MOVIEDB;
const GOOGLE_PROJECT_ID = process.env.GOOGLE_PROJECT_ID;
const KEY_MARVEL_PUBLIC = process.env.KEY_MARVEL_PUBLIC;
const KEY_ADMIN_TRIGGER = process.env.KEY_ADMIN_TRIGGER;
const KEY_MARVEL_PRIVATE = process.env.KEY_MARVEL_PRIVATE;
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const GOOGLE_PRIVATE_KEY_ORIG = process.env.GOOGLE_PRIVATE_KEY;
const GOOGLE_PRIVATE_KEY = GOOGLE_PRIVATE_KEY_ORIG.replace(/\\n/g, '\n');

// Set-up dependencies for app
const pg = require('pg'); // https://www.npmjs.com/package/pg
const request = require('request'); // https://github.com/request/request
const express = require('express'); // https://expressjs.com
const bodyParser = require('body-parser'); // https://github.com/expressjs/body-parser
//const dialogFlow = require('apiai')(KEY_DIALOGFLOW); // https://www.npmjs.com/package/apiai
// Configure dialogFlow session credentials
const dialogflow = require('@google-cloud/dialogflow');
const credentials = {
  client_email: GOOGLE_CLIENT_EMAIL,
  private_key: GOOGLE_PRIVATE_KEY,
};
const sessionClient = new dialogflow.SessionsClient(
  {
    projectId: GOOGLE_PROJECT_ID,
    credentials
  }
);

// Node.js libraries used
const fs = require("fs"); // https://nodejs.org/api/fs.html
const http = require('https'); // https://nodejs.org/api/https.html
const crypto = require('crypto'); // https://nodejs.org/api/crypto.html
// Difining algorithm
const ALGO = 'aes-256-cbc';

// Initialise CHASbot
const CHASbot = express();
CHASbot.use(bodyParser.json());
CHASbot.use(bodyParser.urlencoded({ extended: true }));
var server_port = process.env.PORT || 9000; //
var server_ip_address = '127.0.0.1'; // Only for testing via local NGROK.IO
// Timings
const KEEP_ALIVE = 25; // mins
const TIME_TO_WAIT = 120; // mins

// ********************************************************************************************
// ********************************************************************************************
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

// Keep Heroku alive
setInterval(function() {
    http.get(URL_CHASBOT);
}, minsConvert(KEEP_ALIVE));
// ********************************************************************************************
// ********************************************************************************************

// Messenger templates can be found at:
// https://developers.facebook.com/docs/messenger-platform/send-messages/templates
// File dependencies
const FILE_HIGH = "./high_score.txt"; // Same directory as source code
const FILE_SURVEY = "./survey.txt";
const FILE_CALENDAR = "./calendar.txt";
const FILE_ENCRYPTED_IDS = "./ids_public.txt";
const FILE_ENCRYPTED_BIOS = "./bios_public.txt";
const FILE_TO_BE_ENCRYPTED = "./ids_private.txt"; // "./bios_private.txt"  "./fundraising_private.txt"
const FILE_ENCRYPTED_FR_CARD = "./fundraising_public.txt";
const FILE_ENCRYPTED = FILE_ENCRYPTED_IDS; // FILE_ENCRYPTED_FR_CARD FILE_ENCRYPTED_BIOS FILE_ENCRYPTED_IDS
// Messages
const MSG_RPSLS_INTRO = "💡 First to five is the champion. Scissors cuts Paper, Paper covers Rock, Rock crushes Lizard, Lizard poisons Spock, Spock smashes Scissors, Scissors decapitates Lizard, Lizard eats Paper, Paper disproves Spock, Spock vaporizes Rock, and Rock crushes Scissors!";
const MSG_RPSLS_PROMPT = "Choose... Rock, Paper, Scissors, Lizard or Spock?";
const MSG_HANGMAN_INTRO = "🤔 Figure out the mystery staff member name.\nType a letter to guess, or 'stop'.\nYou are allowed no more than 3 strikes.";
const MSG_SURVEY_THANKS = "❤️ Thank you for finishing our little survey.";
const MSG_HANGMAN_PROMPT = "🤔 Where were we... who is that!\nType a letter, or 'stop'.\nNo more than 3 strikes.";
var MSG_STAR_RATING = [
  "Meh, in my book it's complete pants, all rotten tomatoes 🍅🍅🍅🍅🍅.",
  "I'd be generous giving it ⭐🍅🍅🍅🍅, I watched it so you don't have to!",
  "Wouldn't watch it again at ⭐⭐🍅🍅🍅, give it 20 mins and judge for yourself.",
  "I'd give it a better than average ⭐⭐⭐🍅🍅. Pop it on.",
  "Well worth the watching ⭐⭐⭐⭐🍅, give it a go.",
  "Wow, a fantastic ⭐⭐⭐⭐⭐. In my humble opinion. you must watch."];
var MSG_WEEKDAYS = [
  "Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
var MSG_THUMBS = ["👍👍👍","👍👍👎","👍👎👎","👎👎👎"];
var MSG_EVENTS_OOPS = [
  "📆 Oops, that's not something I could find...",
  "📆 Mmmm, not an event that I recognise...",
  "📆 Not sure I'm able to help you with when that is..."];
var MSG_RANDOM_COMPLIMENT = [
  "Looking good.","You're more fun than bubblewrap.","I bet you do crossword puzzles in ink.",
  "You're like a breath of fresh air.","You're like sunshine on a rainy day.","On a scale from 1 to 10, you're an 11.",
  "Your smile is contagious.","You know how to find that silver lining.","You're inspiring.","I like your style.",
  "You're a great listener.","I bet you sweat glitter.","You were cool way before hipsters.",
  "Hanging out with you is always a blast.","You're one of a kind.","You always know just what to say.",
  "There's ordinary, and then there's you."];
var MSG_HERO_OOPS = [
  "⚠️ Alert: Hydra stole this result from the S.H.I.E.L.D. database...",
  "☠️ Warning: Hydra Infiltration. Result unavailable while under attack from enemy forces...",
  "👁️ Not even the eye of Uatu sees your request...",
  "💾 Program missing, exiting protocol...",
  "💣 Danger: Energy Overload..."];
var MSG_INTERCEPTS = [
  ["🎁 While it's always nice to receive a gift, I'm not sure what you want me to do with that ",
   "🎁 I do appreaciate a nice present, so thank you for the lovely ",
   "🎁 I'm far better at understanding regular text, but it is good of you to send me the "],
  ["👍 I'm so glad you like it.",
   "👍 I'm pleased too."],
  ["👍👍 You are very pleased, press for even longer next time!",
   "👍👍 Nice that you are so very chuffed!"],
  ["👍👍👍 Wow, that good is it! I'm ecstatic too!!",
   "👍👍👍 Gosh, you are completely over the moon!!"],
  ["🐰 I do like a nice sticker though I'm not sure that gets us anywhere.",
   "🐰 Stickers are just great, they really brighten up a conversation."],
  ["😃 I’m not too good at reading emotions but that is a power of positivity you are sending out.",
   "😃 You are totally beaming out the sunshine with those happy emojis."],
  ["😭 Bots may not be big on reading people but I’m picking up a negative vibe.",
   "😭 I'm picking up on a lot of unhappy emojis but maybe you just like them."],
  ["🤔 I’m either not picking you up very well or you’ve got quite mixed feelings.",
   "🤔 I’m not sure from that mix of emojis, whether you are up or down."],
  ["💥 That’s an awful lot of emoticons you crammed in there, hard to find what you are saying.",
   "💥 Wow, that's a lot more emojis than I can make sense of."]
];
// Triggers phrases in lowercase - following phrases are handled in code
const TRIGGER_SURVEY = 'survey';
const TRIGGER_QUIZ = 'quiz';
const TRIGGER_HELP = 'help';
const TRIGGER_FEELING_LUCKY = 'feeling lucky';
const TRIGGER_CHAS_LOGO = 'chas logo';
const TRIGGER_CHASABET_1 = 'chas alphabet';
const TRIGGER_CHASABET_2 = 'chas letter';
const TRIGGER_MARVEL = 'marvel';
const TRIGGER_CHAS_EVENTS = 'when is';
const TRIGGER_CHAS_BIOGS = 'who is';
const TRIGGER_RPSLS = 'bazinga';
const TRIGGER_HANGMAN = 'hangman';
const TRIGGER_STOP = 'stop';
var TRIGGER_SEARCH = ['search','google','wiki','beeb'];
var TRIGGER_MOVIEDB = ['synopsis on','synopsis of','watched','info on','about','watch','catch','seen','see'];

// ╦ ╦╔═╗╔═╗╦╔═╔═╗
// ╠═╣║ ║║ ║╠╩╗╚═╗
// ╩ ╩╚═╝╚═╝╩ ╩╚═╝
// DialogFlow fulfilment hard-coded hooks
// These HOOKS use dialogflow NLP but have hard-coded procedures rather than the user-configured
// The user-configurted hooks are set up in FILE_HOOKS and accept the following 'card' layouts:
// [1] Picture (only)
// [2] Picture with Text
// [3] Text with Button (inc. URL)
const MSG_NO_HOOK = "🐞 Any other day, that might have worked but not today, sorry!";
const MSG_NO_WEATHER = "😔 Oops, I wasn't able to look up the weather for that place just now.";
const FILE_HOOKS = "./hooks.txt";
const HOOK_FUNDRAISING = 'fundraising';
const HOOK_PICKCARD = 'cards';
const HOOK_WEATHER = 'weather';
/*const HOOK_WORKPLACE = 'workplace';
const HOOK_URL_GROUP_DOCS = 'group_docs';
const HOOK_PLAN = 'plan';
const HOOK_XMAS = 'xmas';
const HOOK_CONTACT_INFO = 'contact_info';*/
// Add any new hard-coded hook names to the HOOKS array
var HOOKS = ['fundraising','cards','weather']; // List of UNIQUE hook names, gets extended with custom hook names
var HOOKS_CUSTOM = [];

// End-points
const URL_GIPHY = "https://api.giphy.com/v1/gifs/random";
const URL_MOVIEDB = "https://api.themoviedb.org/3/";
const URL_CHAT_ENDPOINT = "https://graph.facebook.com/v2.6/me/messages";
const URL_API_WEATHER = "http://api.openweathermap.org/data/2.5/weather?APPID=";
const URL_API_MARVEL = "https://gateway.marvel.com/v1/public/characters?nameStartsWith="
const URL_SEARCH_GOOGLE = "https://www.google.com/search?q=";
const URL_SEARCH_WIKI = "https://en.wikipedia.org/w/index.php?search=";
const URL_SEARCH_BEEB = "https://www.bbc.co.uk/search?q=";
const URL_CHAS_THUMB = 'https://images.imgbox.com/99/1d/bFWYzY68_o.jpg';
const URL_GOOGLE_THUMB = "https://images.imgbox.com/7f/57/CkDZNBfZ_o.png";
const URL_WIKI_THUMB = "https://images.imgbox.com/30/62/Vv6KJ9k9_o.png";
const URL_BEEB_THUMB = "https://images.imgbox.com/59/f5/PFN3tfX5_o.png";
const URL_IMG_PREFIX = "https://images.imgbox.com/";
const URL_IMG_PREFIX2 = "https://images2.imgbox.com/";
const URL_IMG_SUFFIX = "_o.png";
// Regular expressions
const REGEX_START = '(?=.*\\b'; // Regular expression bits
const REGEX_MIDDLE = '\\b)';
const REGEX_END = '.+';
// For keeping track of senders
var SENDERS = new Array ();
// Functional
var TIME_OF_DAY = [
  [22,"Getting late"],[19,"Good evening"],[18,"Time for tea"],[13,"Afternoon"],[12,"Lunch time"],
  [11,"Time for Elevenses"],[8,"Morning"],[7,"Breakfast time"],[6,"Another day another dollar"],
  [5,"Whoa, you're an early bird"],[4,"You're up early (or very late)"],[3,"Yawn, worst time to be awake"],
  [2,"You're up late"],[1,"Zzzzz, sorry"],[0,"It's the witching hour"]];
var EMOTICON_UP = ["🙂","😊","😀","😁","😃","😆","😍","😎","😉","😜","😘","😂","😉","😜","😘","😛","😝","🤑",
                  ":)",":]","8)","=)",":D","=D",";)",":P",":p","=p",":-*",":*"];
var EMOTICON_DOWN = ["☹️","🙁","😠","😡","😞","😣","😖","😢","😭","😨","😧","😦","😱","😫","😩","😐","😑","🤔","😕","😟",
                  ":'(",":O",":o",">:O",":|",":/","=/"];
var FB_UNKNOWN = ['Friend','Buddy','Pal','Companion','Chum','Partner','Higness','Trouble'];
// CHASbot help
var HELP_PROMPTS = [
  ["ad/e9/ivBhjDXd","When is the Devil Dash","Who is Morven MacLean","Where can I get collecting cans","How do I claim expenses","How do I get Christmas cards","CHAS alphabet C"],
  ["7a/45/0uhs3nQx","Weather at Rachel House","Weather in Aberdeen","Search CHAS","Google FB Workplace","Wiki Santa Claus","Beeb Blue Planet"],
  ["9a/f7/yRfMnV7i","Bazinga","Hangman","Pick a card","Toss a coin","Roll a dice","Mystic 8"],
  ["0a/fe/WxsCGnFs","What’s a scrub","Is winter coming","My milkshake","Have you seen Moana","Is this the real life","I want the truth"],
  ["de/ff/4ZtuUqYX","Marvel codename Hulk","Execute Order 66","Beam me up","Open pod bay doors","Roll for initiative","Talk like Yoda"]]; // images2 source
var HELP_INDEX = 0;
// CHAS events
const CHAS_EVENTS_BLOCK_SIZE = 4;
var CHAS_EVENTS_CALENDAR = new Array();
var CHAS_EVENTS_TOTAL = 0;
var CHAS_EVENTS_OOPS_INDEX = 0;
// CHAS biographies
const CHAS_BIOGS_BLOCK_SIZE = 2;
var CHAS_BIOGS_VIABLE = false;
var CHAS_BIOGS = new Array();
var CHAS_BIOGS_TOTAL = 0;
var CHAS_FR_LIST = "Contact your local Fundraising Team:" + "\n";
// Slim shady
const IDS_BLOCK_SIZE = 2;
var IDS_VIABLE = false;
var IDS_TOTAL = 0;
var IDS_LIST = new Array();
var IDS_TIMESTAMP = new Array();
// CHAS alphabet
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
// Rock Paper Scissors Lizard Spock
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
// Playing cards
var CARD_PICK = '';
var CARD_DECK  = [
"♥A","♥2","♥3","♥4","♥5","♥6","♥7","♥8","♥9","♥10","♥J","♥Q","♥K",
"♠A","♠2","♠3","♠4","♠5","♠6","♠7","♠8","♠9","♠10","♠J","♠Q","♠K",
"♦A","♦2","♦3","♦4","♦5","♦6","♦7","♦8","♦9","♦10","♦J","♦Q","♦K",
"♣A","♣2","♣3","♣4","♣5","♣6","♣7","♣8","♣9","♣10","♣J","♣Q","♣K"];
var CARD_PROMPTS = [
  "I've picked... ","This time I've drawn... ","I've selected... ","You're card is... "];
// Survey/Quiz
const PRIZES = ["🎉","🎈","💰","🎁","👏","🌹","💐","🍹","🍸","🍺","🍷","🍾","🍰","💋","🎖️","🍀"];
var SURVEY_VIABLE = true;
var SURVEY_NAME = ''; // Loaded from survey.txt 1st line
var SURVEY_QUESTIONS = [];
var QUIZ_NAME = '';
var QUIZ = []; // Loaded from survey.txt 1st line, 1st item
var HIGH_SCORE = ["CHASbot",0];
// Film and TV
var MOVIEDB_RECORDS_INDEX = -1;
var MOVIEDB_RECORDS = new Array();

// Valdate a URL
function urlExists(url, cb) {
  request({ url: url, method: 'HEAD' }, function(err, res) {
    if (err) return cb(null, false);
    cb(null, /4\d\d/.test(res.statusCode) === false);
  });
}

// Encryption and decryption of files
var enCrypt = function(text_plain) {
  //console.log("DEBUG [enCrypt]> plain: " + text_plain);
  let cipher = crypto.createCipheriv(ALGO,Buffer.from(KEY_CRYPTO),Buffer.from(KEY_IV,'hex'));
  let crypted = cipher.update(text_plain);
  crypted = Buffer.concat([crypted, cipher.final()]);
  //console.log("DEBUG [enCrypt]> obscured (raw): " + crypted);
  //console.log("DEBUG [enCrypt]> obscured (hex): " + crypted.toString('hex'));
  return crypted.toString('hex');
}
var deCrypt = function(text_obscure) {
  //console.log("DEBUG [deCrypt]> obscured: " + text_obscure);
  let decipher = crypto.createDecipheriv(ALGO,Buffer.from(KEY_CRYPTO),Buffer.from(KEY_IV,'hex'));
  let text_obscure_buffer = Buffer.from(text_obscure,'hex');
  //console.log("DEBUG [deCrypt]> buffered: " + text_obscure_buffer);
  let dec = decipher.update(text_obscure_buffer);
  dec = Buffer.concat([dec, decipher.final()]);
  //console.log("DEBUG [deCrypt]> deciphered: " + dec);
  return dec.toString();
}
function enCryptFileContents () {
  let text_block = fs.readFileSync(FILE_TO_BE_ENCRYPTED, "utf-8");
  let text_block_split = text_block.split("\n");
  let stream = fs.createWriteStream(FILE_ENCRYPTED, "utf-8");
  stream.once('open', function(fd) {
    let stream_loop = 0;
    for (stream_loop = 0; stream_loop < text_block_split.length; stream_loop++) {
      //console.log("DEBUG [enCryptFileContents]> " + text_block_split[stream_loop]);
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
  let text_block = fs.readFileSync(FILE_ENCRYPTED_BIOS, "utf-8");
  let text_block_split_garbled = text_block.split("\n");
  CHAS_BIOGS = new Array();
  let decrypt_loop = 0;
  for (decrypt_loop = 0; decrypt_loop < text_block_split_garbled.length; decrypt_loop++) {
    CHAS_BIOGS[decrypt_loop] = deCrypt(text_block_split_garbled[decrypt_loop]);
  };
  let number_bios_entries = CHAS_BIOGS.length;
  //console.log("DEBUG [deCryptContents]> Bios entries: " + number_bios_entries);
  let remainder = number_bios_entries % CHAS_BIOGS_BLOCK_SIZE;
  //console.log("DEBUG [deCryptContents]> Bios remainder (looking for 0): " + remainder);
  CHAS_BIOGS_TOTAL = number_bios_entries / CHAS_BIOGS_BLOCK_SIZE;
  //console.log("DEBUG [deCryptContents]> Events: " + CHAS_BIOGS_TOTAL);
  if ((remainder != 0)||(CHAS_BIOGS_TOTAL == 0)) {
    console.log("ERROR [deCryptContents]> Something funky going on with bios");
    CHAS_BIOGS_VIABLE = false;
  } else {
    CHAS_BIOGS_VIABLE = true;0
  };
  text_block = fs.readFileSync(FILE_ENCRYPTED_IDS, "utf-8");
  text_block_split_garbled = text_block.split("\n");
  //IDS_LIST = new Array();
  decrypt_loop = 0;
  for (decrypt_loop = 0; decrypt_loop < text_block_split_garbled.length; decrypt_loop++) {
    IDS_LIST[decrypt_loop] = deCrypt(text_block_split_garbled[decrypt_loop]);
    IDS_TIMESTAMP[decrypt_loop] = null;
  };
  let number_ids_entries = IDS_LIST.length;
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
  //console.log("DEBUG [deCryptContents]> IDs Viable? " + IDS_VIABLE);
  text_block = fs.readFileSync(FILE_ENCRYPTED_FR_CARD, "utf-8");
  text_block_split_garbled = text_block.split("\n");
  decrypt_loop = 0;
  for (decrypt_loop = 0; decrypt_loop < text_block_split_garbled.length; decrypt_loop++) {
    CHAS_FR_LIST = CHAS_FR_LIST + deCrypt(text_block_split_garbled[decrypt_loop]);
    if (decrypt_loop != text_block_split_garbled.length) {CHAS_FR_LIST = CHAS_FR_LIST + "\n"};
  };
  //console.log("DEBUG [deCryptContents]> Contact Card: " + CHAS_FR_LIST);
}

function loadHooks() {
  // Load in hooks
  let text_block = fs.readFileSync(FILE_HOOKS, "utf-8");
  let hook_lines = text_block.split("\n");
  let hook_line = 0;
  if (hook_lines.length > 0) {
    for (var i = 0; i < hook_lines.length; i++) {
      if (hook_lines[i].slice(0,2)=='//') { continue }; // Skip comments
      //console.log("DEBUG [loadHooks]> Possible hook: " + hook_lines[i]);
      let poss_hook = hook_lines[i].split("$");
      if (poss_hook.length < 2 || poss_hook.length > 4) { continue }; // Skip where not 2,3 or 4 items
      let poss_hook_name = poss_hook[0];
      //console.log("DEBUG [loadHooks]> Valid items in hook: " + poss_hook.length);
      if (!poss_hook_name.match(/^[a-z_]+$/)) { continue }; // Skip hook name not lowercase + underscore
      let skip_hook = false;
      for (var j = 0; j < HOOKS.length; j++) {
        if (HOOKS[j] == poss_hook_name) { // New hook can't be same as another hook
          skip_hook = true; // Disqualifies this hook
          break;
        }; // if
      }; // for
      if (skip_hook) { continue };
      //console.log("DEBUG [loadHooks]> Poss hook name: " + skip_hook);
      let poss_hook_url = poss_hook[1];
      if (poss_hook_url.slice(0,8) != "https://") { continue }; // Simple check for SSL URL
      if (poss_hook_url.slice(8,14) == "groups") {
        poss_hook_url = "https://work-" + KEY_ROOT + ".facebook.com/" + poss_hook_url.slice(8,poss_hook_url.length);
      };
      //console.log("DEBUG [loadHooks]> Poss URL: " + poss_hook_url);
      let poss_hook_blurb = '';
      let poss_hook_btn = '';
      let hook_type = 'image';
      if (poss_hook.length > 2) {
        poss_hook_blurb = trimTo(640,poss_hook[2]); // Limit
        if (poss_hook_blurb == '') { continue }; // There should be message text
        hook_type = 'image_text';
      };
      if (poss_hook.length > 3) {
        poss_hook_btn = trimTo(20,poss_hook[3]); // Limit
        if (poss_hook_btn == '') { continue }; // There should be button text
        hook_type = 'button';
      };
      HOOKS_CUSTOM[HOOKS_CUSTOM.length] = [true,hook_type,poss_hook_name,poss_hook_url,poss_hook_blurb,poss_hook_btn];
      //console.log("DEBUG [loadHooks]> Valid Hook[" + (HOOKS_CUSTOM.length - 1) + "]: " + HOOKS_CUSTOM[HOOKS_CUSTOM.length - 1]);
      // More compreheinsice URL check
      urlExists(poss_hook_url, function(err, exists) {
        //console.log("DEBUG [loadHooks]> URL check: " + poss_hook_url + ' = ' + exists);
        if (!exists) {
          for (var j = 0; j < HOOKS_CUSTOM.length; j++) {
            if (HOOKS_CUSTOM[j][3] == poss_hook_url) { // Callback delay requires fresh search
              HOOKS_CUSTOM[j][0] = false; // Disables the hook
              //console.log("DEBUG [loadHooks]> Disabled Hook[" + j + "]: " + HOOKS_CUSTOM[j]);
              break;
            }; // if
          }; // for
        }; // if (!exists)
      }); // urlExists
    }; // for
  }; // if
}

function loadCalendar() {
  // Load in calendar events
  let text_block = fs.readFileSync(FILE_CALENDAR, "utf-8");
  CHAS_EVENTS_CALENDAR = text_block.split("\n");
  // Catch if the calendar list is funky i.e. isn't in blocks of four or missing at least one set
  let number_calendar_entries = CHAS_EVENTS_CALENDAR.length;
  //console.log("DEBUG [loadCalendar]> Calendar entries: " + number_calendar_entries);
  let remainder = number_calendar_entries % CHAS_EVENTS_BLOCK_SIZE;
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

function loadSurvey() {
 //console.log("DEBUG [loadSurvey]> Reading: " + FILE_SURVEY);
  let gone_funky = false;
  // Load in survey as a block
  let text_block = fs.readFileSync(FILE_SURVEY, "utf-8");
  // Populate a temp array
  let load_array = text_block.split("\n");
  // Configure the survey
  if (load_array.length > 2) {
    for (var i = 0; i < load_array.length; i++) {
      SURVEY_QUESTIONS[i] = load_array[i].split(","); // Split each row into arrays split by comma
      if (i>0 && SURVEY_QUESTIONS[i].length > 6) {
        gone_funky = true; // Can't have more than 6 elements i.e. Question + 5 Answers
       //console.log("DEBUG [loadSurvey]> " + (SURVEY_QUESTIONS[i].length - 1) + " is too many response elements for Q." + i);
        break;
      }; // if
    }; // for (break)
    if (SURVEY_QUESTIONS[0].length != 1) { // Has to be a quiz
      QUIZ = SURVEY_QUESTIONS[0]; // Load name and responses into array
     //console.log("DEBUG [loadSurvey]> Answers: " + QUIZ);
     //console.log("DEBUG [loadSurvey]> Number of questions is " + (SURVEY_QUESTIONS.length-1));
     //console.log("DEBUG [loadSurvey]> Number of answers is " + (QUIZ.length-1));
      if (QUIZ.length != SURVEY_QUESTIONS.length) { // Both dimensions are not the same
        gone_funky = true;
       //console.log("DEBUG [loadSurvey]> Number of questions doesn't match answers" + i);
      } else { // Both dimensions are the same
        for (var i = 0; i < QUIZ.length; i++) {
          if (i == 0) { // First element
            QUIZ_NAME = QUIZ[0];
           //console.log("DEBUG [loadSurvey]> Quiz Name: " + QUIZ_NAME);
            if (QUIZ_NAME=='') {
              gone_funky = true;
             //console.log("DEBUG [loadSurvey]> Quiz name can't be empty");
              break;
            };
          } else {
           //console.log("DEBUG [loadSurvey]> Question: " + SURVEY_QUESTIONS[i].join(","));
            let potential_number = 0;
            let known_string = '';
            if (!isNaN(QUIZ[i])) {
              // Check that there is a pick question, and that the response is within the range of answers
              // OR number reponse could be a string
              potential_number = parseInt(QUIZ[i],10);
             //console.log("DEBUG [loadSurvey]> Value = " + potential_number + " Parse (should be number) = " + typeof(potential_number));
              if (SURVEY_QUESTIONS[i].length == 1) { // Matching question has free-text response
                known_string = QUIZ[i];
               //console.log("DEBUG [loadSurvey]> Over-rule number value = " + known_string + " Parse (should be number string) = " + typeof(known_string));
                if (known_string.length == 0) { // Can't be empty
                  gone_funky = true;
                 //console.log("DEBUG [loadSurvey]> Funky answer value of <" + known_string + "> where index is " + SURVEY_QUESTIONS[i].length);
                  break;
                }
              } else if (potential_number == 0||potential_number > (SURVEY_QUESTIONS[i].length-1)) { // Check against range
                gone_funky = true;
               //console.log("DEBUG [loadSurvey]> Funky answer value of " + potential_number + " where index is " + SURVEY_QUESTIONS[i].length);
                break;
              };
            } else {
              // Check that there is a free text question and that the correct answer is not empty
              known_string = QUIZ[i];
              //console.log("DEBUG [loadSurvey]> Value = " + known_string + " Parse (should be string) = " + typeof(known_string));
              if (SURVEY_QUESTIONS[i].length > 1||known_string.length == 0) {
                gone_funky = true;
               //console.log("DEBUG [loadSurvey]> Funky answer value of <" + known_string + "> where index is " + SURVEY_QUESTIONS[i].length);
                break;
              }; // if: funky text response
            }; // if/else: index answer OR free text answer
          }; // if/else: quiz name OR answer
        }; // for (break): loop through quiz answers
      }; // if/else: array dimensions not equal OR ok
    } else { // Must be a survey, has only one element in top row i.e. name without any answers
      SURVEY_NAME = SURVEY_QUESTIONS[0];
      if (SURVEY_NAME=='') {
        gone_funky = true;
       //console.log("DEBUG [loadSurvey]> Survey name can't be empty");
      };
    };
    if (!gone_funky) {
      SURVEY_QUESTIONS.shift(); // Removes <survey_name> (plus correct answers in a quiz)
      if (QUIZ.length > 0) { QUIZ.shift() }; // Same for quiz
    }
  } else {
    // Has to be at least 2 rows i.e. header row plus 1 question minimum
    gone_funky = true;
   //console.log("DEBUG [loadSurvey]> There are not enough rows (must header + question at least): " + load_array.length);
  };
  if (gone_funky) {
    console.log("ERROR [loadSurvey]> Something funky going on with survey");
    return false;
  } else {
    return true;
  };
}

function highScore(read_write) {
  let client = new pg.Client(URL_POSTGRES);
  if (read_write == 'read') { // Load from file
    client.connect(function(err) {
      if (err) { return console.error("ERROR [highScore]> Could not connect to read postgres: ", err) };
      client.query('SELECT high_scorer,high_score FROM quiz WHERE id = 0', function(err, result) {
        if (err) { return console.error("ERROR [highScore]> Error running read query: ", err) };
        HIGH_SCORE[0]=result.rows[0].high_scorer;
        HIGH_SCORE[1]=result.rows[0].high_score;
        //console.log("DEBUG [highScore]> Who: " + HIGH_SCORE[0] + " Score: " + HIGH_SCORE[1]);
        client.end();
      });
    });
  } else if (read_write == 'write') { // Save to file
    client.connect(function(err) {
      if (err) { return console.log("ERROR [highScore]> Could not connect to update postgres: ", err) };
      let sql_update = "UPDATE quiz SET high_scorer = '" + HIGH_SCORE[0] + "', high_score = " + HIGH_SCORE[1] + " WHERE id = 0";
      client.query(sql_update, function(err, result) {
        if (err) { return console.error("ERROR [highScore]> Error running update query: ", err) };
        client.end();
      });
    });
  };
};

// LOAD
loadHooks();
// Load in encrypted information
// Update Constants FILE_TO_BE_ENCRYPTED (input) and FILE_ENCRYPTED (output)
//enCryptFileContents(); // Run once to encrypt files
deCryptContents(); // Normal runtime configuration
var CHAS_EVENTS_VIABLE = loadCalendar();
//console.log("DEBUG [postloadCalendar]> Viable? " + CHAS_EVENTS_VIABLE);
var SURVEY_VIABLE = loadSurvey();
//console.log("DEBUG [postloadSurvey]> Viable? " + SURVEY_VIABLE);
highScore('read');

// Facebook/workplace validation
// Configure webhook in work chat integration - KEY_VERIFY matches code and app
// Copy page access token and hard code for testing or set as server variable
CHASbot.get('/webhook', (req, res) => {
  if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === KEY_VERIFY) {
    res.status(200).send(req.query['hub.challenge']);
  } else {
    res.status(403).end();
  }
});

// Sender handling and stacking functions
// ======================================
function inPlayNew(index_id,new_sender) {
  SENDERS[index_id] = [new_sender,        // 0:id_of_sender
                       false,false,false, // 1:survey_in_play,2:hangman_in_play,3:rpsls_in_play
                       0,0,               // 4:survey_question,5:quiz_score
                       0,'',[],           // 6:hangman_strikes,7:hangman_word,8:hangman_array
                       0,true,0,0];       // 9:rpsls_action,10:issue_instructions,11:rpsls_player,12:rpsls_bot
}
function inPlay(in_play,index_id) {
  let in_play_index = 0;
  if (in_play == 'survey') { in_play_index = 1 }
  else if (in_play == 'hangman') { in_play_index = 2 }
  else if (in_play == 'rpsls') { in_play_index = 3 };
  return SENDERS[index_id][in_play_index];
}
function inPlayClean(in_play,index_id) {
  let in_play_index = 0;
  if (in_play == 'survey') {
    in_play_index = 1
    SENDERS[index_id][4] = 0;
    SENDERS[index_id][5] = 0;
  } else if (in_play == 'hangman') {
    in_play_index = 2
    SENDERS[index_id][6] = 0;
    SENDERS[index_id][7] = '';
    SENDERS[index_id][8] = [];
  } else if (in_play == 'rpsls') {
    in_play_index = 3;
    SENDERS[index_id][9] = 0;
    SENDERS[index_id][10] = true;
    SENDERS[index_id][11] = 0;
    SENDERS[index_id][12] = 0;
  };
  SENDERS[index_id][in_play_index] = false;
}
function inPlaySet(in_play,index_id) {
  let in_play_index = 0;
  if (in_play == 'survey') { in_play_index = 1 }
  else if (in_play == 'hangman') { in_play_index = 2; }
  else if (in_play == 'rpsls') { in_play_index = 3 };
  SENDERS[index_id][in_play_index] = true;
}
function inPlayUnset(in_play,index_id) {
  let in_play_index = 0;
  if (in_play == 'survey') { in_play_index = 1 }
  else if (in_play == 'hangman') { in_play_index = 2 }
  else if (in_play == 'rpsls') { in_play_index = 3 };
  SENDERS[index_id][in_play_index] = false;
}
function inPlayPause(index_id) {
  let refresh_sender = SENDERS[index_id][0];
  SENDERS[index_id][1] = false;
  SENDERS[index_id][2] = false;
  SENDERS[index_id][3] = false;
  SENDERS[index_id][9] = 0;
}
function inPlayID (id_to_find) {
  let sender_index = -1;
  for (var i=0; i < SENDERS.length; i++) {
    if (SENDERS[i][0] == id_to_find) {
    	sender_index = i;
    	break;
    };
  };
  return sender_index;
}

// String and number handling functions
// ====================================
function escapeRegExp(str) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}
function replaceAll(str, find, replace) {
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}
function toTitleCase(inputString) {
  return inputString.replace(/\w\S*/g, function(txt) {return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}
function firstAlpha(inputString) {
  for (var i = 0; i < inputString.length; i += 1) {
    if ((inputString.charAt(i) >= 'A' && inputString.charAt(i) <= 'Z') ||
        (inputString.charAt(i) >= 'a' && inputString.charAt(i) <= 'z')) {
        return inputString.charAt(i);
    };
  };
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
  };
  //assuming the joiners are used appropriately
  return count / split.length;
}
function minsConvert(minsIn) {
  return minsIn*60*1000;
}
function randomBetween(min,max) {
  return Math.floor(Math.random()*(max-min+1)+min);
}

function customGreeting(senderID,greet) {
  //console.log("DEBUG [customGreeting]> " + senderID);
  let build_greeting = '';
  let fb_who = FB_UNKNOWN[randomBetween(0,FB_UNKNOWN.length-1)];
  let fb_who_known = false;
  let match_id = 0;
  let id_index = 0;
  if (IDS_VIABLE) {
    for (var find_index = 0; find_index < IDS_TOTAL; find_index++) {
      // 1,3,5 etc.
      match_id = IDS_LIST[find_index * IDS_BLOCK_SIZE + 1];
      //console.log("DEBUG [customGreeting]> Find match for ID (" + senderID + "): " + match_id);
      if (match_id == senderID) {
        id_index = find_index; // Got our match
        fb_who = IDS_LIST[find_index * IDS_BLOCK_SIZE];
        //console.log("DEBUG [customGreeting]> Matched to: " + fb_who);
        break;
      }; // if
    }; // for
  }; // if viable
  if (!greet) { return fb_who }; // Return only a name
  // Prime personalised response
  // if ( we know who the person is AND ( either they've not had a name check OR been a while since name check))
  if (IDS_VIABLE && (IDS_TIMESTAMP[id_index] == null||new Date().getTime() - IDS_TIMESTAMP[id_index] > minsConvert(TIME_TO_WAIT))) {
    //console.log("DEBUG [customGreeting]> Interval in mins since last message has been: " + minsConvert(TIME_TO_WAIT));
    let hr = new Date().getHours();
    for (var loop_hour = 0; loop_hour < TIME_OF_DAY.length; loop_hour++) {
      if (hr >= TIME_OF_DAY[loop_hour][0]) {
        build_greeting = TIME_OF_DAY[loop_hour][1];
        break;
      }; // for
    }; // if
    build_greeting = build_greeting + ' ' + fb_who + '. ' + MSG_RANDOM_COMPLIMENT[randomBetween(0,MSG_RANDOM_COMPLIMENT.length-1)] + ' ';
    // Set the time the ID received a name check
    IDS_TIMESTAMP[id_index] = new Date().getTime();
    console.log("NAME CHECK: [customGreeting]> " + fb_who + ", ID: " + senderID + " @ " + IDS_TIMESTAMP[id_index]);
  };
  //console.log("DEBUG [customGreeting]> Greeting: " + build_greeting);
  return build_greeting;
}

function cleanInput(inboundText) {
  let emoticon_up_count = 0;
  for (var i = 0; i < EMOTICON_UP.length; i++) {
    var pos = inboundText.indexOf(EMOTICON_UP[i]);
    while(pos > -1){
        ++emoticon_up_count;
        pos = inboundText.indexOf(EMOTICON_UP[i], ++pos);
    }; // Count +ve emoticons
    inboundText = replaceAll(inboundText, EMOTICON_UP[i], ''); // Then remove them
  };
  let emoticon_down_count = 0;
  for (var i = 0; i < EMOTICON_DOWN.length; i++) {
    var pos = inboundText.indexOf(EMOTICON_DOWN[i]);
    while(pos > -1){
        ++emoticon_down_count;
        pos = inboundText.indexOf(EMOTICON_DOWN[i], ++pos);
    }; // Count -ve emoticons
    inboundText = replaceAll(inboundText, EMOTICON_DOWN[i], ''); // Then remove them
  };
  // Lowercase
  inboundText = inboundText.toLowerCase();
  // Strip out none alphanumeric
  inboundText = inboundText.replace(/[^A-Za-z0-9\s]/g,'');
  // Contract white space
  let outboundText = inboundText.replace(/\s\s+/g, ' ');
  return [outboundText,emoticon_up_count,emoticon_down_count];
}

// Sending template functions
// ==========================
// Handling all messages in and processing special cases
CHASbot.post('/webhook', (req, res) => {
  if (req.body.object === 'page') {
    req.body.entry.forEach((entry) => {
      entry.messaging.forEach((event) => {
        //if (event.read && event.read.watermark) { //console.log("DEBUG [postWebhook]> Receipt: " + event.read.watermark) };
        let sticker_path = '';
        let sender = event.sender.id;
        let alt_message_type = '';
        // Pick up on non-text messages
        if (event.message && event.message.attachments) {
           sticker_path = MSG_INTERCEPTS[0][randomBetween(0,MSG_INTERCEPTS[0].length-1)];
           alt_message_type = event.message.attachments[0].type;
           sticker_path = sticker_path + alt_message_type + ". Try just words instead.";
        };
        // Pick up on stickers - identify degrees of like
        if (event.message && event.message.sticker_id) {
          let sticker_code = event.message.sticker_id;
          alt_message_type = 'sticker';
          if ( sticker_code == 369239263222822 ) {
            sticker_path = MSG_INTERCEPTS[1][randomBetween(0,MSG_INTERCEPTS[1].length-1)];
          } else if ( sticker_code == 369239343222814 ) {
            sticker_path = MSG_INTERCEPTS[2][randomBetween(0,MSG_INTERCEPTS[2].length-1)];
          } else if (sticker_code == 369239383222810 ) {
            sticker_path = MSG_INTERCEPTS[3][randomBetween(0,MSG_INTERCEPTS[3].length-1)];
          } else {
            sticker_path = MSG_INTERCEPTS[4][randomBetween(0,MSG_INTERCEPTS[4].length-1)];
          };
        };
        if (sticker_path != '') {
          //console.log("DEBUG [postWebhook_route]> Hangman Initiated");
          console.log("INFO [postWebhook]> Sender: " + sender);
          console.log("INFO [postWebhook]> Request: Non-text");
          console.log("INFO [postWebhook]> Action: postWebhook.sendTextDirect");
          console.log("INFO [postWebhook]> Response: " + sticker_path);
          if (alt_message_type == 'image') {
            apiGIPHY(event,'robot','G',sticker_path);
          } else {
            sendTextDirect(event,sticker_path);
          };
        };
        if (event.message && event.message.text) {
          // Manage sender specific 'in-play' progress
          let sender_index = inPlayID(sender);
          if (sender_index == -1) {
            sender_index = SENDERS.length;
            inPlayNew(sender_index,sender);
          };
          let hold_that_thought = event.message.text;
          // CLEAN INPUT
          let cleanResults = cleanInput(event.message.text);
          let analyse_text = cleanResults[0];
          let good_vibe = cleanResults[1];
          let bad_vibe = cleanResults[2];
          let empty_input = false;
          if (analyse_text == '') { // Clean response woud otherwise be empty
            empty_input = true;
            if (good_vibe > bad_vibe) {
              analyse_text = "i'm happy"; // More happy emojis than not
            } else if (bad_vibe > good_vibe) {
              analyse_text = "i'm sad"; // More sad emojis than not
            } else {
              analyse_text = "help"; // Nothing to go on
            };
          };
          if (!inPlay('survey',sender_index)) { event.message.text = analyse_text };
          //console.log("DEBUG [postWebhook]> Cleaned input: " + cleanResults[0] + ' (Emoji +ve ' + cleanResults[1] + ',-ve ' + cleanResults[2] + ')');
          // Feel the vibe
          sendThinking(event,'on');
          let vibeText = '';
          if (good_vibe > ((bad_vibe+2)*3)-2) { // Minimum 5 = +ve
            vibeText = MSG_INTERCEPTS[5][randomBetween(0,MSG_INTERCEPTS[5].length-1)];
          } else if (bad_vibe > ((good_vibe+2)*3)-2) { // Minimum 5 = -ve
            vibeText = MSG_INTERCEPTS[6][randomBetween(0,MSG_INTERCEPTS[6].length-1)];
          } else if (good_vibe + bad_vibe > 4 && good_vibe + bad_vibe < 10) { // Minimum 5 = mixed
            vibeText = MSG_INTERCEPTS[7][randomBetween(0,MSG_INTERCEPTS[7].length-1)];
          } else if (good_vibe + bad_vibe > 9) { // Minimum 10 = lots
            vibeText = MSG_INTERCEPTS[8][randomBetween(0,MSG_INTERCEPTS[8].length-1)];
          };
          if (vibeText != '' && !empty_input) { sendTextDirect(event,vibeText) };
          // *************************
          // Check for custom triggers
          let position_in_analyse_text = -1;
          let trigger_path = '';
          position_in_analyse_text = hold_that_thought.search(KEY_ADMIN_TRIGGER) + 1;
          let route_to = '';
          let adminMessage = '';
          let routeEvent = event;
          if (position_in_analyse_text > 0 && sender == KEY_ADMIN) {
            sendThinking(event,'off');
            route_to = hold_that_thought.slice(KEY_ADMIN_TRIGGER.length,KEY_ADMIN_TRIGGER.length+15);
            adminMessage = hold_that_thought;
            adminMessage = adminMessage.slice(KEY_ADMIN_TRIGGER.length+15,adminMessage.length);
            console.log("ADMIN [postWebhook]> [" + route_to + "]: " + adminMessage);
            routeEvent.sender.id = route_to;
            trigger_path = KEY_ADMIN_TRIGGER;
            analyse_text = trigger_path;
          };
          // ***** HELP & SEARCH *****
          // Feeling lucky - First in list - allows subsequent triggers
          position_in_analyse_text = analyse_text.search(TRIGGER_FEELING_LUCKY) + 1;
          //console.log("DEBUG [postWebhook]> " + TRIGGER_FEELING_LUCKY + " search result: " + position_in_analyse_text);
          let chasbotText = '';
          if (position_in_analyse_text > 0 && !inPlay('survey',sender_index)) {
            let cat = randomBetween(0,4); // 0 to 4
            let ind = randomBetween(1,6); // 1 to 6
            event.message.text = HELP_PROMPTS[cat][ind];
            analyse_text = event.message.text;
            analyse_text = analyse_text.toLowerCase();
            chasbotText = '*' + event.message.text + '*';
            sendTextDirect(event,chasbotText); // Send a sudo-request
            inPlayPause(sender_index); // Pause all in-play
            // FLOW: Sudo request replace 'feeling lucky'
          };
          // Help
          position_in_analyse_text = analyse_text.search(TRIGGER_HELP) + 1;
          //console.log("DEBUG [postWebhook]> " + TRIGGER_HELP + " search result: " + position_in_analyse_text);
          let help_url = '';
          if (position_in_analyse_text > 0 && !inPlay('survey',sender_index)) {
            trigger_path = TRIGGER_HELP;
            help_url = URL_IMG_PREFIX2 + HELP_PROMPTS[HELP_INDEX][0] + URL_IMG_SUFFIX;
            //console.log("DEBUG [postWebhook]> Help URL: " + help_url);
            chasbotText = "Try typing any of these:";
            for (var i = 1; i < 7; i++) {
              chasbotText = chasbotText + '\n' + HELP_PROMPTS[HELP_INDEX][i];
            };
            chasbotText = chasbotText + '\n' + "Type *help* for more or try *feeling lucky*";
            //console.log("DEBUG [postWebhook]> Help text: " + chasbotText);
            HELP_INDEX++;
            if (HELP_INDEX > 4) { HELP_INDEX = 0 };
            // FLOW: 'help' trumps all
            analyse_text = TRIGGER_HELP; // Clean extra
            inPlayPause(sender_index); // Pause all in-play
          };
          // Search
          let rightmost_starting_point = -1;
          let trigger_loop = 0;
          let starting_point = 0;
          let ending_point = 0;
          let string_length = 0;
          let search_method = '';
          let search_term = '';
          for (trigger_loop = 0; trigger_loop < TRIGGER_SEARCH.length; trigger_loop++) {
            position_in_analyse_text = analyse_text.lastIndexOf(TRIGGER_SEARCH[trigger_loop]) + 1;
            if (position_in_analyse_text > 0 && !inPlay('survey',sender_index)) {
              starting_point = position_in_analyse_text + TRIGGER_SEARCH[trigger_loop].length;
              if (starting_point > rightmost_starting_point) { // Find right-most search term
                rightmost_starting_point = starting_point;
                ending_point = analyse_text.length;
                string_length = ending_point - starting_point;
                search_method = TRIGGER_SEARCH[trigger_loop];
                //console.log("DEBUG [postWebhook]> Length is " + string_length + ", starting @ " + starting_point + " and go to " + ending_point);
                //console.log("DEBUG [postWebhook]> Search method found: " + search_method);
                if (string_length > 0) {
                  trigger_path = TRIGGER_SEARCH[0];
                  search_term = analyse_text.slice(starting_point,ending_point);
                  //console.log("DEBUG [postWebhook]> Search term: " + search_term);
                  // FLOW: Seperate out search terms - pause all in-play
                  analyse_text = search_method; // Clean extra
                  inPlayPause(sender_index); // Pause all in-play
                };
              };
            };
          };
          // ******** IN PLAY ********
          // Survey/Quiz
          // 0:id_of_sender,1:survey_in_play,4:survey_question,
          //console.log("DEBUG [postWebhook]> In play, survey: " + inPlay('survey',sender_index));
          //console.log("DEBUG [postWebhook]> In play, rpsls: " + inPlay('rpsls',sender_index));
          //console.log("DEBUG [postWebhook]> In play, hangman: " + inPlay('hangman',sender_index));
          let valid_choice = false;
          let survey_question_number = SENDERS[sender_index][4];
          if (inPlay('survey',sender_index)) { // Review un-parsed text
            if (SURVEY_QUESTIONS[survey_question_number - 1].length == 1) { // Free text response
              valid_choice = true;
              if (cleanResults[0]=='' && cleanResults[1]==0 && cleanResults[2]==0) {
                valid_choice = false; // Empty after cleaning
              } else if (cleanResults[0]=='' && cleanResults[1]+cleanResults[2] > 0) {
                event.message.text = "(Emoji +ve " + cleanResults[1] + ",-ve " + cleanResults[2] + ")"; // Identifiable emoji response
              };
            } else { // Selection based
              for (var i = 1; i < SURVEY_QUESTIONS[survey_question_number - 1].length; i++) {
                position_in_analyse_text = event.message.text.search(SURVEY_QUESTIONS[survey_question_number - 1][i]) + 1;
                if (position_in_analyse_text > 0) {
                  let xstr = event.message.text;
                  event.message.text = i.toString();
                  valid_choice = true;
                  break;
                };
              };
            };
            position_in_analyse_text = event.message.text.search(TRIGGER_SURVEY) + 1;
            if (position_in_analyse_text > 0 && SURVEY_NAME!='') { analyse_text = TRIGGER_SURVEY };
            position_in_analyse_text = event.message.text.search(TRIGGER_QUIZ) + 1;
            if (position_in_analyse_text > 0 && QUIZ_NAME!='') { analyse_text = TRIGGER_QUIZ };
            position_in_analyse_text = event.message.text.search(TRIGGER_STOP) + 1;
            if (position_in_analyse_text > 0) { analyse_text = TRIGGER_STOP };
            if (analyse_text==TRIGGER_SURVEY||analyse_text==TRIGGER_STOP) {
              valid_choice = false;
            };
            if (valid_choice) {
              if (SURVEY_NAME!='') {
                console.log('SURVEY [' + SURVEY_NAME + '],' + sender + ',' + survey_question_number + ',' + event.message.text);
              } else if (QUIZ_NAME!='') {
                console.log('QUIZ [' + QUIZ_NAME + '],' + sender + ',' + survey_question_number + ',' + event.message.text);
              };
              let check_winner = event.message.text;
              check_winner = cleanInput(check_winner)[0];
              let winner = cleanInput(QUIZ[survey_question_number-1])[0];
              //console.log("DEBUG [postWebhook]> Check input: " + check_winner + " Against answer: " + winner);
              if (check_winner == winner) {
		            //console.log("DEBUG [postWebhook]> Won a point");
                SENDERS[sender_index][5] = SENDERS[sender_index][5] + 1; // Add a point
              };
            } else {
              SENDERS[sender_index][4] = survey_question_number - 1; // Repeat previous question
              // FLOW: Clear out invalid survey responses, 'stop', 'survey' or 'quiz' are still valid
              if (analyse_text != TRIGGER_SURVEY && analyse_text != TRIGGER_QUIZ && analyse_text != TRIGGER_STOP) { analyse_text = '' };
            }
          };
          // Trigger the survey or quiz
          position_in_analyse_text = analyse_text.search(TRIGGER_SURVEY) + 1;
          //console.log("DEBUG [postWebhook]> " + TRIGGER_SURVEY + " search result: " + position_in_analyse_text);
          if (position_in_analyse_text > 0 && SURVEY_VIABLE && SURVEY_NAME!='') {
            // FLOW: Typing survey mid-survey, starts it again
            if (inPlay('survey',sender_index)) { inPlayClean('survey',sender_index) };
            inPlayPause(sender_index); // Pause all in-play...
            inPlaySet('survey',sender_index); // ...then un-pause 'survey'
            analyse_text = TRIGGER_SURVEY; // Clean extra
          };
          position_in_analyse_text = analyse_text.search(TRIGGER_QUIZ) + 1;
          //console.log("DEBUG [postWebhook]> " + TRIGGER_QUIZ + " search result: " + position_in_analyse_text);
          if (position_in_analyse_text > 0 && SURVEY_VIABLE && QUIZ_NAME!='') {
            // FLOW: Typing survey mid-survey, starts it again
            if (inPlay('survey',sender_index)) { inPlayClean('survey',sender_index) };
            inPlayPause(sender_index); // Pause all in-play...
            inPlaySet('survey',sender_index); // ...then un-pause 'survey'
            analyse_text = TRIGGER_SURVEY; // Clean extra
          };
          // Rock, Paper, Scissors, Lizard, Spock
          // 0:id_of_sender,3:rpsls_in_play,9:rpsls_action,10:issue_instructions,11:rpsls_player,12:rpsls_bot
          let pick_player = TRIGGER_RPSLS;
          if (inPlay('rpsls',sender_index)) { // Only check if we are playing
            // Presume no match unless found
            SENDERS[sender_index][9] = 0;
            inPlayUnset('rpsls',sender_index);
            trigger_loop = 0;
            for (trigger_loop = 0; trigger_loop < RPSLS_VALID.length; trigger_loop++) {
              position_in_analyse_text = analyse_text.search(RPSLS_VALID[trigger_loop]) + 1;
              if (position_in_analyse_text > 0) {
                pick_player = RPSLS_VALID[trigger_loop];
                analyse_text = pick_player; // Clean extra
                //console.log("DEBUG [postWebhook]> " + pick_player + " search result: " + position_in_analyse_text);
                inPlayPause(sender_index); // Pause all in-play...
                inPlaySet('rpsls',sender_index); // ...then un-pause 'rpsls'
                SENDERS[sender_index][9] = 3; // Evaluate the choice
                break;
              };
            };
          };
          // Trigger RPSLS
          position_in_analyse_text = analyse_text.search(TRIGGER_RPSLS) + 1;
          //console.log("DEBUG [postWebhook]> " + TRIGGER_RPSLS + " search result: " + position_in_analyse_text);
          if (position_in_analyse_text > 0) {
            // FLOW: Typing rpsls mid-survey, starts it again
            if (inPlay('rpsls',sender_index)) { inPlayClean('rpsls',sender_index) }; // Reset if already playing
            inPlayPause(sender_index); // Pause all in-play...
            inPlaySet('rpsls',sender_index); // ...then un-pause 'rpsls'
            if (SENDERS[sender_index][10]) {
              SENDERS[sender_index][9] = 1; // Provide intsructions + prompt
              SENDERS[sender_index][10] = false; // Reset instructions
            } else {
              SENDERS[sender_index][9] = 2; // Prompt only
            };
          };
          // Hangman
          let hangman_guess = '';
          if (inPlay('hangman',sender_index)) { hangman_guess = analyse_text };
          // FLOW: Typing hangman mid-survey, starts it again
          // 0:id_of_sendery,2:hangman_in_play,6:hangman_strikes,7:hangman_word,8:hangman_array
          position_in_analyse_text = analyse_text.search(TRIGGER_HANGMAN) + 1;
          //console.log("DEBUG [postWebhook]> " + TRIGGER_HANGMAN + " search result: " + position_in_analyse_text);
          let hangman_word = '';
          let hangman_answer_array = [];
          let hangman_answer = '';
          if (CHAS_BIOGS_VIABLE && position_in_analyse_text > 0) {
            trigger_path = TRIGGER_HANGMAN;
            if (SENDERS[sender_index][7] == ''||inPlay('hangman',sender_index)) { // New game
              hangman_word = CHAS_BIOGS[randomBetween(1,CHAS_BIOGS_TOTAL) * CHAS_BIOGS_BLOCK_SIZE - 2];
              hangman_word = hangman_word.toLowerCase();
              //console.log("DEBUG [postWebhook]> Mystery name: " + hangman_word);
              // swap out spaces for under_scores
              hangman_word = hangman_word.replace(/\s/g, '_');
              // Set up the answer array
              for (var i = 0; i < hangman_word.length; i++) {
                if (hangman_word[i] == '_') {
                  hangman_answer_array[i] = "_";
                } else {
                  hangman_answer_array[i] = "?";
                };
              };
              hangman_answer = hangman_answer_array.join(' ');
              chasbotText = MSG_HANGMAN_INTRO;
              chasbotText = chasbotText + "\n" + hangman_answer;
              chasbotText = chasbotText + "\n" + MSG_THUMBS[0] + " (0 strikes)";
              SENDERS[sender_index][7] = hangman_word;
              SENDERS[sender_index][8] = hangman_answer_array;
              //console.log("DEBUG [postWebhook]> Hangman Initialise: " + chasbotText);
            } else { // Resume existing game
              hangman_word = SENDERS[sender_index][7];
              hangman_answer_array = SENDERS[sender_index][8];
              hangman_answer = hangman_answer_array.join(' ');
              chasbotText = MSG_HANGMAN_PROMPT;
              chasbotText = chasbotText + "\n" + hangman_answer;
              chasbotText = chasbotText + "\n" + MSG_THUMBS[SENDERS[sender_index][6]] + "(" + SENDERS[sender_index][6] + " strike";
              if (SENDERS[sender_index][6] == 1) {
                chasbotText = chasbotText + ")";
              } else {
                chasbotText = chasbotText + "s)";
              };
            };
            inPlayPause(sender_index); // Pause all in-play...
            inPlaySet('hangman',sender_index); // ...then un-pause 'hangman'
          };
          //console.log("DEBUG [postWebhook]> In play, survey: " + inPlay('survey',sender_index));
          //console.log("DEBUG [postWebhook]> In play, rpsls: " + inPlay('rpsls',sender_index));
          //console.log("DEBUG [postWebhook]> In play, hangman: " + inPlay('hangman',sender_index));
          // FLOW: Remaining triggers each clean out analyse_text, so no other triggers fire
          // ****** API LOOKUP *******
          // TV and film
          let moviedb_term = ''
          for (trigger_loop = 0; trigger_loop < TRIGGER_MOVIEDB.length; trigger_loop++) {
            position_in_analyse_text = analyse_text.lastIndexOf(TRIGGER_MOVIEDB[trigger_loop]) + 1;
            if (position_in_analyse_text > 0) {
              starting_point = position_in_analyse_text + TRIGGER_MOVIEDB[trigger_loop].length;
              if (starting_point > rightmost_starting_point) { // Find right-most search term
                rightmost_starting_point = starting_point;
                ending_point = analyse_text.length;
                string_length = ending_point - starting_point;
                //console.log("DEBUG [postWebhook]> Length is " + string_length + ", starting @ " + starting_point + " and go to " + ending_point);
                //console.log("DEBUG [postWebhook]> MovieDb key found: " + TRIGGER_MOVIEDB[trigger_loop]);
                if (string_length > 0) {
                  trigger_path = TRIGGER_MOVIEDB[0];
                  moviedb_term = analyse_text.slice(starting_point,ending_point);
                  //console.log("DEBUG [postWebhook]> Movie or TV title: " + moviedb_term);
                  analyse_text = trigger_path; // Clean extra
                };
              };
            };
          };
          // Marvel
          let hero_who = ''
          position_in_analyse_text = analyse_text.lastIndexOf(TRIGGER_MARVEL) + 1;
          //console.log("DEBUG [postWebhook]> " + TRIGGER_MARVEL + " phrase search result: " + position_in_analyse_text);
          if (position_in_analyse_text > 0) {
            starting_point = position_in_analyse_text + TRIGGER_MARVEL.length;
            ending_point = analyse_text.length;
            string_length = ending_point - starting_point;
            //console.log("DEBUG [postWebhook]> Length is " + string_length + ", starting @ " + starting_point + " and go to " + ending_point);
            if (string_length > 0) {
              trigger_path = TRIGGER_MARVEL;
              hero_who = analyse_text.slice(starting_point,ending_point);
              hero_who = toTitleCase(hero_who);
              analyse_text = trigger_path; // Clean extra
            };
          };
          // Trigger priority increases down list i.e. if multiple tirggers, lower ones trump higher
          // ****** CHAS STUFF *******
          // CHAS logo
          position_in_analyse_text = analyse_text.search(TRIGGER_CHAS_LOGO) + 1;
          //console.log("DEBUG [postWebhook]> " + TRIGGER_CHAS_LOGO + " search result: " + position_in_analyse_text);
          if (position_in_analyse_text > 0) { trigger_path = TRIGGER_CHAS_LOGO };
          // CHAS alphabet
          let alpha = '';
          let alpha_1st = true;
          position_in_analyse_text = analyse_text.lastIndexOf(TRIGGER_CHASABET_1) + 1;
          if (position_in_analyse_text == 0) { // i.e. first phrase not found
            position_in_analyse_text = analyse_text.lastIndexOf(TRIGGER_CHASABET_2) + 1;
            alpha_1st = false;
          }
          //console.log("DEBUG [postWebhook]> " + TRIGGER_CHASABET_1 + " or " + TRIGGER_CHASABET_2 + " phrase search result: " + position_in_analyse_text);
          if (position_in_analyse_text > 0) {
            if (alpha_1st) {
              starting_point = position_in_analyse_text + TRIGGER_CHASABET_1.length;
            } else {
              starting_point = position_in_analyse_text + TRIGGER_CHASABET_2.length;
            }
            ending_point = analyse_text.length;
            string_length = ending_point - starting_point;
            //console.log("DEBUG [postWebhook]> Length is " + string_length + ", starting @ " + starting_point + " and go to " + ending_point);
            if (string_length > 0) {
              // Strip string to first viable letter
              alpha = analyse_text.slice(starting_point,ending_point);
              alpha = firstAlpha(alpha);
              if (alpha != '') {
                trigger_path = TRIGGER_CHASABET_1;
                analyse_text = trigger_path; // Clean extra
              };
            };
          };
          // CHAS Events
          let event_name = '';
          position_in_analyse_text = analyse_text.lastIndexOf(TRIGGER_CHAS_EVENTS) + 1;
          //console.log("DEBUG [postWebhook]> " + TRIGGER_CHAS_EVENTS + " phrase search result: " + position_in_analyse_text);
          if (position_in_analyse_text > 0) {
            starting_point = position_in_analyse_text + TRIGGER_CHAS_EVENTS.length;
            ending_point = analyse_text.length;
            string_length = ending_point - starting_point;
            //console.log("DEBUG [postWebhook]> Length is " + string_length + ", starting @ " + starting_point + " and go to " + ending_point);
            if (string_length > 0) {
              trigger_path = TRIGGER_CHAS_EVENTS;
              event_name = analyse_text.slice(starting_point,ending_point);
              analyse_text = trigger_path; // Clean extra
            };
          };
	  // CHAS Biogs
          position_in_analyse_text = analyse_text.lastIndexOf(TRIGGER_CHAS_BIOGS) + 1;
          //console.log("DEBUG [postWebhook]> " + TRIGGER_CHAS_BIOGS + " phrase search result: " + position_in_analyse_text);
          let biogs_name = '';
          if (position_in_analyse_text > 0) {
            starting_point = position_in_analyse_text + TRIGGER_CHAS_BIOGS.length;
            ending_point = analyse_text.length;
            string_length = ending_point - starting_point;
            //console.log("DEBUG [postWebhook]> Length is " + string_length + ", starting @ " + starting_point + " and go to " + ending_point);
            if (string_length > 0) {
              let catch_fundraising = analyse_text.lastIndexOf('fundraising');
              if (catch_fundraising > 0) {
                // Swap input text to be caught by hook instead
                analyse_text = 'who is my fundraising contact';
              } else {
                trigger_path = TRIGGER_CHAS_BIOGS;
                biogs_name = analyse_text.slice(starting_point,ending_point);
                analyse_text = trigger_path; // Clean extra
              };
            };
          };
          // Stop pauses all activity, regardless of context or other triggers
          // i.e. must be queried last
          position_in_analyse_text = analyse_text.search(TRIGGER_STOP) + 1;
          if (position_in_analyse_text > 0) {
            inPlayPause(sender_index);
            trigger_path = ''; // Send via default else
          };
          // Pick a response route
          if (trigger_path == KEY_ADMIN_TRIGGER) {
            //console.log("DEBUG [postWebhook_route]> Admin: " + KEY_ADMIN_TRIGGER);
            sendTextDirect(routeEvent,adminMessage);
          } else if (inPlay('survey',sender_index)) { // Survey first - ignores
            //console.log("DEBUG [postWebhook_route]> Survey");
            // Pause other in_play?
            sendQuestion_playSurvey(event);
          } else if (trigger_path == TRIGGER_HELP) {
            //console.log("DEBUG [postWebhook_route]> Help: " + HELP_INDEX);
            console.log("INFO [postWebhook]> Sender: " + sender);
            console.log("INFO [postWebhook]> Request: " + TRIGGER_HELP);
            console.log("INFO [postWebhook]> Action: postWebhook.postImage");
            console.log("INFO [postWebhook]> Response: Help v." + HELP_INDEX);
            postImage(event,help_url,true,chasbotText);
          } else if (trigger_path == TRIGGER_MARVEL) {
            //console.log("DEBUG [postWebhook_route]> Marvel Character: " + hero_who);
            apiMarvelChar(event,hero_who);
          } else if (trigger_path == TRIGGER_CHASABET_1) {
            //console.log("DEBUG [postWebhook_route]> CHAS alpahbet: " + alpha);
            lookupAlpha(event,alpha);
          } else if (trigger_path == TRIGGER_CHAS_EVENTS && CHAS_EVENTS_VIABLE) {
            //console.log("DEBUG [postWebhook_route]> CHAS event: " + event_name);
            lookupEntry(event,event_name);
          } else if (trigger_path == TRIGGER_CHAS_BIOGS && CHAS_BIOGS_VIABLE) {
            //console.log("DEBUG [postWebhook_route]> CHAS bios: " + biogs_name);
            lookupBiogs(event,biogs_name);
          } else if (SENDERS[sender_index][9] > 0) {
            //console.log("DEBUG [postWebhook_route]> RPSLSpock: " + pick_player);
            playRPSLS(event,pick_player);
          } else if (trigger_path == TRIGGER_SEARCH[0]) {
            //console.log("DEBUG [postWebhook_route]> Search: " + search_term);
            postSearch(event,search_method,search_term);
          } else if (trigger_path == TRIGGER_MOVIEDB[0]) {
            //console.log("DEBUG [postWebhook_route]> Movie/TV: " + moviedb_term);
            apiPrimeFilmTV(event,moviedb_term);
          } else if (trigger_path == TRIGGER_CHAS_LOGO) {
            //console.log("DEBUG [postWebhook_route]> Logo");
            console.log("INFO [postWebhook]> Sender: " + sender);
            console.log("INFO [postWebhook]> Request: " + TRIGGER_CHAS_LOGO);
            console.log("INFO [postWebhook]> Action: postWebhook.postImage");
            console.log("INFO [postWebhook]> Response: IMG URL " + URL_CHAS_THUMB);
            postImage(event,URL_CHAS_THUMB,false,'');
          } else if (trigger_path == TRIGGER_HANGMAN) {
            //console.log("DEBUG [postWebhook_route]> Hangman Initiated");
            console.log("INFO [postWebhook]> Sender: " + sender);
            console.log("INFO [postWebhook]> Request: " + TRIGGER_HANGMAN);
            console.log("INFO [postWebhook]> Action: postWebhook.sendTextDirect");
            console.log("INFO [postWebhook]> Response: Hangman Mystery Name is " + hangman_word);
            sendTextDirect(event,chasbotText);
          } else if (inPlay('hangman',sender_index)) {
            //console.log("DEBUG [postWebhook_route]> Hangman Guess: " + hangman_guess);
            playHangman(event,hangman_guess);
          } else {
            //console.log("DEBUG [postWebhook_route]> No special cases, send via APIAI");
            sendViaDialogV2(event);
          }
        }
      });
    });
    res.status(200).end();
  }
});

function sendTemplate(eventSend,messageData,plusText,messageText) {
  // messageData set outside of function call
  sendThinking(eventSend,'off');
  let sender = eventSend.sender.id;
  request({
    uri: URL_CHAT_ENDPOINT,
    qs: {access_token: KEY_PAGE_ACCESS},
    method: 'POST',
    json: {
      messaging_type: 'RESPONSE',
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
  if (plusText) { sendTextDirect(eventSend,messageText) };
}

function sendQuestion_playSurvey(eventSend) {
  //console.log("DEBUG [sendQuestion_playSurvey]> " + SURVEY_NAME + "In Progress");
  // 0:id_of_sender,1:survey_in_play,4:survey_question
  sendThinking(eventSend,'off');
  let sender = eventSend.sender.id;
  let custom_id = inPlayID(sender);
  let survey_question_number = SENDERS[custom_id][4];
  let rspns_items = 0;
  let qstn = '';
  let surveyTemplate = '';
  if (survey_question_number == SURVEY_QUESTIONS.length) {
    rspns_items = 1; // Thanks
    if (SURVEY_NAME != '') { // Survey
      qstn = MSG_SURVEY_THANKS;
    } else { // Quiz - Final Score
      if (SENDERS[custom_id][5] > HIGH_SCORE[1]) {
        let sender_name = customGreeting(sender,false);
        qstn = "🏆 You are our new high scorer on " + SENDERS[custom_id][5] + "! Congratulations " + sender_name + ".";
        HIGH_SCORE[1] = SENDERS[custom_id][5];
        HIGH_SCORE[0] = sender_name;
        highScore('write');
        console.log('QUIZ [' + QUIZ_NAME + '],' + sender + ', ' + sender_name + ' is new HIGH SCORE on ' + SENDERS[custom_id][5]);
      } else if (SENDERS[custom_id][5] == HIGH_SCORE[1]) {
        qstn = "🏆 You are an equal high scorer on " + SENDERS[custom_id][5] + "!";
      } else {
        qstn = "You scored " + SENDERS[custom_id][5] + ", not the top score but everybody wins a prize " +
               PRIZES[randomBetween(0,PRIZES.length-1)] + ". " + HIGH_SCORE[0] + " leads with " + HIGH_SCORE[1] + ".";
      };
    };
    inPlayClean('survey', custom_id);
  } else { // Next question
    rspns_items = SURVEY_QUESTIONS[survey_question_number].length;
    qstn = SURVEY_QUESTIONS[survey_question_number][0];
  }
  switch (rspns_items) {
    case 1:
      surveyTemplate = {
        text: trimTo(640,qstn)};
      break;
    case 2:
      surveyTemplate = {
        text: trimTo(640,qstn),
        quick_replies:[
              { content_type:"text",
                title: SURVEY_QUESTIONS[survey_question_number][1],
                payload:"<POSTBACK_PAYLOAD>" }]};
      break;
    case 3:
      surveyTemplate = {
        text: trimTo(640,qstn),
        quick_replies:[
              { content_type:"text",
                title: SURVEY_QUESTIONS[survey_question_number][1],
                payload:"<POSTBACK_PAYLOAD>" },
              { content_type:"text",
                title: SURVEY_QUESTIONS[survey_question_number][2],
                payload:"<POSTBACK_PAYLOAD>" }]};
      break;
    case 4:
      surveyTemplate = {
        text: trimTo(640,qstn),
        quick_replies:[
              { content_type:"text",
                title: SURVEY_QUESTIONS[survey_question_number][1],
                payload:"<POSTBACK_PAYLOAD>" },
              { content_type:"text",
                title: SURVEY_QUESTIONS[survey_question_number][2],
                payload:"<POSTBACK_PAYLOAD>" },
              { content_type:"text",
                title: SURVEY_QUESTIONS[survey_question_number][3],
                payload:"<POSTBACK_PAYLOAD>" }]};
      break;
    case 5:
      surveyTemplate = {
        text: trimTo(640,qstn),
        quick_replies:[
              { content_type:"text",
                title: SURVEY_QUESTIONS[survey_question_number][1],
                payload:"<POSTBACK_PAYLOAD>" },
              { content_type:"text",
                title: SURVEY_QUESTIONS[survey_question_number][2],
                payload:"<POSTBACK_PAYLOAD>" },
              { content_type:"text",
                title: SURVEY_QUESTIONS[survey_question_number][3],
                payload:"<POSTBACK_PAYLOAD>" },
              { content_type:"text",
                title: SURVEY_QUESTIONS[survey_question_number][4],
                payload:"<POSTBACK_PAYLOAD>" }]};
      break;
    case 6:
      surveyTemplate = {
        text: trimTo(640,qstn),
        quick_replies:[
              { content_type:"text",
                title: SURVEY_QUESTIONS[survey_question_number][1],
                payload:"<POSTBACK_PAYLOAD>" },
              { content_type:"text",
                title: SURVEY_QUESTIONS[survey_question_number][2],
                payload:"<POSTBACK_PAYLOAD>" },
              { content_type:"text",
                title: SURVEY_QUESTIONS[survey_question_number][3],
                payload:"<POSTBACK_PAYLOAD>" },
              { content_type:"text",
                title: SURVEY_QUESTIONS[survey_question_number][4],
                payload:"<POSTBACK_PAYLOAD>" },
              { content_type:"text",
                title: SURVEY_QUESTIONS[survey_question_number][5],
                payload:"<POSTBACK_PAYLOAD>" }]};
  }; // Switch
  request({
    uri: URL_CHAT_ENDPOINT,
    qs: {access_token: KEY_PAGE_ACCESS},
    method: 'POST',
    json: {
      messaging_type: 'RESPONSE',
      recipient: {id: sender},
      message: surveyTemplate
    }
  }, function (error, response) {
    if (error) {
      console.log("ERROR [sendQuestion_playSurvey]> Error sending survey message: ", error);
    } else if (response.body.error) {
      console.log("ERROR [sendQuestion_playSurvey]> Undefined: ", response.body.error);
    }
  }); // request
  if (inPlay('survey',custom_id)) { SENDERS[custom_id][4] = survey_question_number + 1 };
}

function sendThinking(eventThink,on_off) {
  let sender = eventThink.sender.id;
  request({
    uri: URL_CHAT_ENDPOINT,
    qs: {access_token: KEY_PAGE_ACCESS},
    method: 'POST',
    json: {
      messaging_type: 'RESPONSE',
      recipient: {id: sender},
      sender_action: 'typing_' + on_off
    }
  }, function (error, response) {
    if (error) {
      console.log("ERROR [sendThinking]> Error sending simple message: ", error);
    } else if (response.body.error) {
      console.log("ERROR [sendThinking]> Undefined: ", response.body.error);
    };
  }); // request
}

function sendTextDirect(eventSend,outbound_text) {
  sendThinking(eventSend,'off');
  let sender = eventSend.sender.id;
  outbound_text = customGreeting(sender,true) + outbound_text;
  request({
    uri: URL_CHAT_ENDPOINT,
    qs: {access_token: KEY_PAGE_ACCESS},
    method: 'POST',
    json: {
      messaging_type: 'RESPONSE',
      recipient: {id: sender},
      message: {
        text: trimTo(640,outbound_text)
      }
    }
  }, function (error, response) {
    if (error) {
      console.log("ERROR [sendTextDirect]> Error sending simple message: ", error);
    } else if (response.body.error) {
      console.log("ERROR [sendTextDirect]> Undefined: ", response.body.error);
    };
  }); // request
}

//https://github.com/kamjony/Chatbot-DialogFlowV2-Messenger-NodeJS
async function sendViaDialogV2(eventSend) {
  let sender = eventSend.sender.id;
  let dialogFlowInbound = eventSend.message.text;
  console.log("INFO [sendViaDialogV2]> Request from " + sender + ": " + dialogFlowInbound);
  try {
    const sessionPath = sessionClient.projectAgentSessionPath(
      GOOGLE_PROJECT_ID,
      sender
    ); // try
    const dialogflow_request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: dialogFlowInbound,
          languageCode: 'en-UK',
        }, // text
      }, // queryInput
    }; // const
    // Send dialogflow_request and log result
    const responses = await sessionClient.detectIntent(dialogflow_request);
    //console.log("DEBUG [sendViaDialogV2]: DialogFlow Intent Detected");
    const result = responses[0].queryResult;
    console.log("INFO [sendViaDialogV2]> Request Processed for " + sender + ": " + result.queryText);
    //let dialogFlowText = result.fulfillmentText; // [LEGACY]
    let dialogFlowHook = result.action;
    //console.log("DEBUG [sendViaDialogV2]> dialogFlowHook: " + dialogFlowHook);
    let dialogFlowText = ''
    if (dialogFlowHook != '') { // If there is an 'action' then there likely to be a hook
      if (dialogFlowHook.includes('smalltalk') || dialogFlowHook.includes('unknown') || dialogFlowHook.includes('Default')){
        // For dialogflow built-in 'action' exceptons
        dialogFlowText = result.fulfillmentMessages[0].text.text[0];
      }
    } else { // If there is no 'action', there is no hook and therefore will be text
      dialogFlowText = result.fulfillmentMessages[0].text.text[0];
    };
    console.log("INFO [sendViaDialogV2]> Response to " + sender + ": " + dialogFlowText);
    if (result.intent) {
      console.log("INFO [sendViaDialogV2]> Intent to " + sender + ": " + result.intent.displayName);
    } else {
      console.log("INFO [sendViaDialogV2]> Intent to " + sender + ": NONE MATCHED");
    };
    // Check for hard-coded hooks
    let hookText = '';
    if (dialogFlowHook === HOOK_WEATHER) {
      // Set a default weather location
      console.log("DEBUG [sendViaDialogV2]> HOOK_WEATHER");
      let city = 'Edinburgh';

      console.log('Weather >>>>>>>>>>>>>>>>' + result.parameters);

      if (typeof result.parameters['geo-city-gb'] != 'undefined') {
        city = result.parameters['geo-city-gb'];
        console.log("DEBUG [sendViaDialogV2] Weather Hook > Location @ :" + city);
      };
      if (typeof result.parameters['hospice_places'] != 'undefined') {
        city = result.parameters['hospice_places'];
        console.log("DEBUG [sendViaDialogV2] Weather Hook > Hospice @ :" + city);
      };
      let restUrl = URL_API_WEATHER + KEY_API_WEATHER + '&q=' + city;
      console.log("DEBUG [sendViaDialogV2] Weather Hook > URL: " + restUrl);

      request(restUrl, function (err, response, body) {
        if (!err && response.statusCode == 200) { // Successful response
          let json = JSON.parse(body);
          console.log("DEBUG [sendViaDialogV2] Weather Hook JSON > " + json);
          let tempF = ~~(json.main.temp * 9/5 - 459.67);
          let tempC = ~~(json.main.temp - 273.15);
          hookText = 'The current condition in ' + json.name + ' is ' + json.weather[0].description + ' and the temperature is ' + tempF + ' ℉ (' +tempC+ ' ℃).'
          console.log("INFO [sendViaDialogV2]> Response to " + sender + " via Weather Hook: " + hookText);
          sendTextDirect(eventSend,hookText);
          return;
        } else { // Error code from weather API
          hookText = MSG_NO_WEATHER;
          console.log("INFO [sendViaDialogV2]> Response to " + sender + " via Weather Hook: " + hookText);
          sendTextDirect(eventSend,hookText);
          return;
        } //else
      }); // } function ) request
    } else if (dialogFlowHook === HOOK_PICKCARD) {
      //console.log("DEBUG [sendViaDialogV2]> HOOK_PICKCARD");
      CARD_PICK = CARD_DECK[randomBetween(0,CARD_DECK.length-1)];
      hookText = CARD_PROMPTS[randomBetween(0,CARD_PROMPTS.length-1)] + CARD_PICK;
      console.log("INFO [sendViaDialogV2]> Response to " + sender + " via Pick a Card Hook: " + hookText);
      sendTextDirect(eventSend,hookText);
      return;
    } else if (dialogFlowHook === HOOK_FUNDRAISING) {
      //console.log("DEBUG [sendViaDialogV2]> HOOK_FUNDRAISING");
      hookText = CHAS_FR_LIST;
      console.log("INFO [sendViaDialogV2]> Response to " + sender + " via Fundraising Hook: " + hookText);
      sendTextDirect(eventSend,hookText);
      return;
    };
    // Check for custom hooks
    if (HOOKS_CUSTOM.length > 0) {
      for (var i = 0; i < HOOKS_CUSTOM.length; i++) {
        if (HOOKS_CUSTOM[i][0] && dialogFlowHook == HOOKS_CUSTOM[i][2]) { // Found custom
          console.log("INFO [sendViaDialogV2]> Response to " + sender + " via Custom Hook: " + HOOKS_CUSTOM[i][2] + " (" + HOOKS_CUSTOM[i][1] + ")");
          if (HOOKS_CUSTOM[i][1] == 'image') {
            postImage(eventSend,HOOKS_CUSTOM[i][3],false,'');
            return;
          } else if (HOOKS_CUSTOM[i][1] == 'image_text') {
            postImage(eventSend,HOOKS_CUSTOM[i][3],true,HOOKS_CUSTOM[i][4]);
            return;
          } else if (HOOKS_CUSTOM[i][1] == 'button') {
            postLinkButton(eventSend,HOOKS_CUSTOM[i][3],HOOKS_CUSTOM[i][4],HOOKS_CUSTOM[i][5]);
            return;
          };
        }; // if
      }; // for
    }; // if
    // No hooks found - Note that weather request may still be in-flight - it will catch its own errors
    if (dialogFlowText == '' && dialogFlowHook != HOOK_WEATHER) {dialogFlowText = MSG_NO_HOOK}; // Catch empty dialogflow responses
    console.log("INFO [sendViaDialogV2]> Empty response to " + sender + " via dialogflow NLP: " + dialogFlowText);
    sendTextDirect(eventSend,dialogFlowText);
    // Look out for unknown response and cc. admin
    if (result.action == 'input.unknown'||result.action.slice(0,21)=='DefaultFallbackIntent') {
      let loopbackText = sender + ">>" + customGreeting(sender,false) + ">>" + result.queryText;
      console.log("ADMIN [sendViaDialogV2]> Feedback: " + loopbackText);
      let eventLoopback = eventSend;
      eventLoopback.sender.id = KEY_ADMIN;
      sendTextDirect(eventLoopback,loopbackText);
    }; // If
  // Catch undefined error from async await
  } catch (e) {
    sendTextDirect(eventSend,MSG_NO_HOOK);
    console.log("INFO [sendViaDialogV2]> Catch response to " + sender + " via dialogflow NLP: " + MSG_NO_HOOK)
    console.log("ERROR [sendViaDialogV2]> " + e);
  }
} // function

function postImage(postEvent,image_url,plusText,passText) {
  //console.log("DEBUG [postImage]> Input: " + image_url);
  let imgTemplate = {
    attachment: {
      type: "image",
      payload: {
        url: image_url,
        is_reusable: true
      } // payload
    } // attachment
  }; // template
  if (plusText) {
    sendTemplate(postEvent,imgTemplate,true,passText);
  } else {
    sendTemplate(postEvent,imgTemplate,false,'');
  };
}

function postLinkButton(postEvent,link_url,reponse_msg,btn_msg) {
  //console.log("DEBUG [postLinkButton]> Input: " + reponse_msg);
  let linkTemplate = {
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
  sendTemplate(postEvent,linkTemplate,false,'');
}

function postMarvel(postEvent,success_result,hero_array) {
  //console.log("DEBUG [postMarvel]> Pass or Fail: " + success_result);
  let sender = postEvent.sender.id;
  let marvelTemplate = '';
  let marvelText = '';
  // hero_array = [marvelWho,marvelNote,marvelThumb,marvelURL];
  console.log("INFO [postMarvel]> Sender: " + sender);
  console.log("INFO [postMarvel]> Request: " + TRIGGER_MARVEL + " " + toTitleCase(hero_array[0]));
  console.log("INFO [postMarvel]> Action: apiMarvelChar.postMarvel");
  if (success_result) {
    console.log("INFO [postMarvel]> Reponse: Successful");
    marvelTemplate = {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [
            {
            title: toTitleCase(hero_array[0]),
            image_url: hero_array[2],
            default_action: {
              type: "web_url",
              url: hero_array[3],
              messenger_extensions: false,
              webview_height_ratio: "tall"
            } // default_action
          }] // elements
        } // payload
      } // attachment
    }; // template
    marvelText = hero_array[1]; // Required within sendTextDirect
    sendTemplate(postEvent,marvelTemplate,true,marvelText);
  } else {
    console.log("INFO [postMarvel]> Reponse: Unuccessful");
    marvelText = MSG_HERO_OOPS[randomBetween(0,MSG_HERO_OOPS.length-1)] + ' try something instead of ' + toTitleCase(hero_array[0]) + '?'; // Required within sendTextDirect
    sendTextDirect(postEvent,marvelText);
  };
}

function postEvents(postEvent,success_result,event_index,event_in) {
  //console.log("DEBUG [postEvents]> Pass or Fail: " + success_result);
  let sender = postEvent.sender.id;
  let eventsText = '';
  let eventsTemplate = '';
  console.log("INFO [postEvents]> Sender: " + sender);
  console.log("INFO [postEvents]> Request: " + TRIGGER_CHAS_EVENTS + " " + event_in);
  console.log("INFO [postEvents]> Action: lookupEntry.postEvents");
  if (success_result) {
    console.log("INFO [postEvents]> Reponse: Successful");
    let event_name = CHAS_EVENTS_CALENDAR[event_index + 1];
    let event_detail = CHAS_EVENTS_CALENDAR[event_index + 2];
    let event_info = CHAS_EVENTS_CALENDAR[event_index + 3];
    eventsTemplate = {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [
            {
            title: event_name,
            image_url: URL_CHAS_THUMB,
            default_action: {
              type: "web_url",
              url: event_info,
              messenger_extensions: false,
              webview_height_ratio: "tall"
            } // default_action
          }] // elements
        } // payload
      } // attachment
    }; // template
    eventsText = event_detail; // Required within sendTextDirect
    sendTemplate(postEvent,eventsTemplate,true,eventsText);
  } else {
    console.log("INFO [postEvents]> Reponse: Unsuccessful");
    eventsText = MSG_EVENTS_OOPS[CHAS_EVENTS_OOPS_INDEX] + ' try something instead of ' + toTitleCase(event_in) + '?'; // Required within sendTextDirect
    CHAS_EVENTS_OOPS_INDEX++;
    if (CHAS_EVENTS_OOPS_INDEX == MSG_EVENTS_OOPS.length) {CHAS_EVENTS_OOPS_INDEX = 0};
    sendTextDirect(postEvent,eventsText);
  };
}

function postBiogs(postEvent,success_result,biogs_index,biogs_name) {
  //console.log("DEBUG [postBiogs]> Input: " + postEvent);
  let sender = postEvent.sender.id;
  console.log("INFO [postBiogs]> Sender: " + sender);
  console.log("INFO [postBiogs]> Request: " + TRIGGER_CHAS_BIOGS + " " + biogs_name);
  console.log("INFO [postBiogs]> Action: lookupBiogs.postBiogs");
  if (success_result) {
    //console.log("DEBUG [postBiogs]> Index: " + biogs_index);
    console.log("INFO [postBiogs]> Reponse: Successful");
    let biogsText = CHAS_BIOGS[biogs_index + 1];
    //console.log("DEBUG [postBiogs]> Result: " + CHAS_BIOGS[biogs_index + 1]);
    sendTextDirect(postEvent,biogsText);
  } else {
    console.log("INFO [postBiogs]> Reponse: Unsuccessful");
    sendViaDialogV2(postEvent);
  };
}

function postSearch(postEvent,search_method,search_term) {
  //console.log("DEBUG [postSearch]> Input: " + postEvent);
  let sender = postEvent.sender.id;
  console.log("INFO [postSearch]> Sender: " + sender);
  console.log("INFO [postSearch]> Request: " + search_method + ' ' + search_term);
  console.log("INFO [postSearch]> Action: postSearch.sendTemplate");
  let search_title = '';
  let search_image_url = '';
  let search_url = '';
  if (search_method == "google") {
    search_title = 'Search Google';
    search_image_url = URL_GOOGLE_THUMB;
    search_url = URL_SEARCH_GOOGLE + search_term;
  } else if (search_method == "wiki") {
    search_title = 'Search Wikipedia';
    search_image_url = URL_WIKI_THUMB;
    search_url = URL_SEARCH_WIKI + search_term;
  } else if (search_method == "beeb") {
    search_title = 'Search BBC';
    search_image_url = URL_BEEB_THUMB;
    search_url = URL_SEARCH_BEEB + search_term;
  }
  let searchTemplate = {
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
  let carouselTemplate = {
    attachment: {
      type: "template",
      payload: {
        template_type: "generic",
        elements: [{
          title: "Search Google",
          image_url: URL_GOOGLE_THUMB,
          default_action: {
            type: "web_url",
            url: URL_SEARCH_GOOGLE + search_term,
            messenger_extensions: false,
            webview_height_ratio: "tall"
          }
        },{
          title: "Search Wikipedia",
          image_url: URL_WIKI_THUMB,
          default_action: {
            type: "web_url",
            url: URL_SEARCH_WIKI + search_term,
            messenger_extensions: false,
            webview_height_ratio: "tall"
          }
        },{
          title: "Search BBC",
          image_url: URL_BEEB_THUMB,
          default_action: {
            type: "web_url",
            url: URL_SEARCH_BEEB + search_term,
            messenger_extensions: false,
            webview_height_ratio: "tall"
          }
        }]
      }
    }
  };
  if (search_method == "search") {
    console.log("INFO [postSearch]> Reponse: Search Carousel");
    sendTemplate(postEvent,carouselTemplate,false,'');
  } else {
    console.log("INFO [postSearch]> Reponse: Simple Search");
    sendTemplate(postEvent,searchTemplate,false,'');
  };
}

function postFilmTV(postEvent,record_index) {
  //console.log("DEBUG [postFilmTV]> Index: " + record_index + ", " + MOVIEDB_RECORDS[record_index][0] + ", " + MOVIEDB_RECORDS[record_index][3]+ ", " + MOVIEDB_RECORDS[record_index][7]);
  let sender = postEvent.sender.id;
  let filmText = '';
  if (MOVIEDB_RECORDS[record_index][0] && MOVIEDB_RECORDS[record_index][3] && !MOVIEDB_RECORDS[record_index][7]) {
    MOVIEDB_RECORDS[record_index][7] = true;
    if (MOVIEDB_RECORDS[record_index][1] == 'No TV result' && MOVIEDB_RECORDS[record_index][4] == 'No film result') {
      // No result
      sendViaDialogV2(postEvent);
    } else if (MOVIEDB_RECORDS[record_index][1] != 'No TV result' && MOVIEDB_RECORDS[record_index][4] == 'No film result') {
      // TV only
      console.log("INFO [postFilmTV]> Sender: " + sender);
      console.log("INFO [postFilmTV]> Request: MovieDb");
      console.log("INFO [postFilmTV]> Action: postFilmTV.sendTextDirect");
      filmText = "📺 " + MOVIEDB_RECORDS[record_index][1];
      console.log("INFO [postFilmTV]> Reponse: " + filmText);
      sendTextDirect(postEvent,filmText);
    } else if (MOVIEDB_RECORDS[record_index][1] == 'No TV result' && MOVIEDB_RECORDS[record_index][4] != 'No film result') {
      // Film only
      console.log("INFO [postFilmTV]> Sender: " + sender);
      console.log("INFO [postFilmTV]> Request: MovieDb");
      console.log("INFO [postFilmTV]> Action: postFilmTV.sendTextDirect");
      filmText = "📽️ " + MOVIEDB_RECORDS[record_index][4];
      console.log("INFO [postFilmTV]> Reponse: " + filmText);
      sendTextDirect(postEvent,filmText);
    } else {
      // Both
      console.log("INFO [postFilmTV]> Sender: " + sender);
      console.log("INFO [postFilmTV]> Request: MovieDb");
      console.log("INFO [postFilmTV]> Action: postFilmTV.sendTextDirect");
      if (MOVIEDB_RECORDS[record_index][2] > MOVIEDB_RECORDS[record_index][5]) {
        filmText = "📺 " + MOVIEDB_RECORDS[record_index][1];
        console.log("INFO [postFilmTV]> Reponse: " + filmText);
        sendTextDirect(postEvent,filmText);
      } else if (MOVIEDB_RECORDS[record_index][2] < MOVIEDB_RECORDS[record_index][5]) {
        filmText = "📽️ " + MOVIEDB_RECORDS[record_index][4];
        console.log("INFO [postFilmTV]> Reponse: " + filmText);
        sendTextDirect(postEvent,filmText);
      } else {
        let pick_one = Math.floor(randomBetween(0,1));
        if (pick_one == 0) {
          filmText = "🎞️ " + MOVIEDB_RECORDS[record_index][1];
        } else {
          filmText = "🎞️ " + MOVIEDB_RECORDS[record_index][4];
        };
        console.log("INFO [postFilmTV]> Reponse: " + filmText);
        sendTextDirect(postEvent,filmText);
      };
    };
  };
}

function apiGIPHY(eventGiphy,giphy_tag,giphy_rating,passText) {
  // Ratings are Y; G; PG; PG-13; R
  //console.log("DEBUG [apiGIPHY]> Input: " + giphy_tag + ", " + giphy_rating + ", " + passText);
  const base_url = URL_GIPHY;
  const params_url = "?api_key=" + KEY_API_GIPHY + "&tag=" + giphy_tag + "&rating=" + giphy_rating;
  let url = base_url + params_url;
  // e.g. https://api.giphy.com/v1/gifs/random?api_key=5LqK0fRD8cNeyelbovZKnuBVGcEGHytv&tag=robot&rating=G
  //console.log("DEBUG [apiGIPHY]> URL: " + url);
  http.get(url, function(res) {
    //console.log("DEBUG [apiGIPHY]> GIPHY Response Code: " + res.statusCode);
    let body = "";
    res.on('data', function (chunk) { body += chunk });
    res.on('end', function() {
      let giphyData = JSON.parse(body);
      //console.log("DEBUG [apiGIPHY]> GIPHY Response: " + giphyData);
      if (res.statusCode === 200) {
        if (typeof giphyData.data != 'undefined') {
          let giphy_url = giphyData.data.fixed_height_downsampled_url;
          //console.log("DEBUG [apiGIPHY]> URL: " + giphy_url);
          postImage(eventGiphy,giphy_url,false,'');
          return;
        } else {
          console.log("ERROR [apiGIPHY]> No Results");
          sendTextDirect(eventGiphy,passText)
          return;
        };
      } else {
        console.log("ERROR [apiGIPHY]> Response Error");
        sendTextDirect(eventGiphy,passText)
        return;
      }; // if (res.statusCode === 200)
    }); // res.on('end', function()
  }); // http.get(url, function(res)
}

// Remote search functions - API
// =============================
function apiFilmTV(eventFilmTV,nameFilmTV,episode_find,tv_film,record_index) {
  //console.log("DEBUG [apiFilmTV]> Input: " + nameFilmTV + ", " + episode_find + ", " + tv_film + ", " + record_index);
  let epBlurb = ''; // return value
  const base_url = URL_MOVIEDB + "search/";
  const params_url = "api_key=" + KEY_API_MOVIEDB;
  const movie_url = "movie?";
  const tv_url = "tv?";
  let query_url = "&query=" + nameFilmTV;
  // First pass * TV *
  if (tv_film == 'tv') { var url = base_url + tv_url + params_url + query_url }
  else if (tv_film == 'film') { var url = base_url + movie_url + params_url + query_url };
  // e.g. https://api.themoviedb.org/3/search/movie?api_key={api_key}&query=Jack+Reacher
  // id 1871 is Eastenders; Season 33 is 2017
  if (episode_find) { url = URL_MOVIEDB + "tv/1871/season/33?api_key=" + KEY_API_MOVIEDB + "&language=en-US" };
  //console.log("DEBUG [apiFilmTV]> URL: " + url);
  http.get(url, function(res) {
    //console.log("DEBUG [apiFilmTV]> MovieDb Response Code: " + res.statusCode);
    // In the event of API reporting down i.e. 503, then return null results on one pass and exit on other
    if (res.statusCode === 503) {
      console.log("ERROR [apiFilmTV]> 503 Response Error for " + tv_film);
      if (tv_film == 'tv') {
	      MOVIEDB_RECORDS[record_index][0] = true;
        MOVIEDB_RECORDS[record_index][1] = 'No TV result';
        MOVIEDB_RECORDS[record_index][3] = true;
        MOVIEDB_RECORDS[record_index][4] = 'No film result';
        postFilmTV(eventFilmTV,record_index);
      };
      return;
    };
    let body = "";
    res.on('data', function (chunk) { body += chunk });
    res.on('end', function() {
      let movieDbData = JSON.parse(body);
      //console.log("DEBUG [apiFilmTV]> MovieDb Response: " + movieDbData);
      if (res.statusCode === 200) {
        if (episode_find) {
          let tdyDate = new Date();
          // Loop down from latest episode
          for (var i = movieDbData.episodes.length-1; i > -1; i--) {
            let epDate = new Date(movieDbData.episodes[i].air_date);
            // Find the first in the past
            if (tdyDate > epDate) {
              epBlurb = movieDbData.episodes[i].overview;
              let weekday_value = epDate.getDay();
              //epBlurb = "The last episode I saw was on " + MSG_WEEKDAYS[weekday_value] + ", it was the one where: " + epBlurb;
              //console.log("DEBUG [apiFilmTV]> Easties result: " + epBlurb);
              MOVIEDB_RECORDS[record_index][0] = true;
              MOVIEDB_RECORDS[record_index][1] = epBlurb;
              MOVIEDB_RECORDS[record_index][3] = true;
              MOVIEDB_RECORDS[record_index][4] = epBlurb;
              postFilmTV(eventFilmTV,record_index);
              return;
            };
          };
        } else if (typeof movieDbData.results != 'undefined' && movieDbData.total_results != 0) {
          // Read the first result
          let blurb = movieDbData.results[0].overview;
          let rating = Math.round(movieDbData.results[0].vote_average / 2);
          epBlurb = MSG_STAR_RATING[rating] + " That's the one where: " + blurb + " (theMovieDb)";
          //console.log("DEBUG [apiFilmTV]> TV result: " + epBlurb);
          if (tv_film == 'tv') {
            MOVIEDB_RECORDS[record_index][0] = true;
            MOVIEDB_RECORDS[record_index][1] = epBlurb;
            MOVIEDB_RECORDS[record_index][2] = rating;
          } else if (tv_film == 'film') {
            MOVIEDB_RECORDS[record_index][3] = true;
            MOVIEDB_RECORDS[record_index][4] = epBlurb;
            MOVIEDB_RECORDS[record_index][5] = rating;
          };
          postFilmTV(eventFilmTV,record_index);
          return;
        } else {
          //console.log("DEBUG [apiFilmTV]> No " + tv_film + " result");
          if (tv_film == 'tv') {
            MOVIEDB_RECORDS[record_index][0] = true;
            MOVIEDB_RECORDS[record_index][1] = 'No TV result';
          } else if (tv_film == 'film') {
            MOVIEDB_RECORDS[record_index][3] = true;
            MOVIEDB_RECORDS[record_index][4] = 'No film result';
          };
          postFilmTV(eventFilmTV,record_index);
          return;
        };
      } else {
        console.log("ERROR [apiFilmTV]> Response Error");
        MOVIEDB_RECORDS[record_index][0] = true;
        MOVIEDB_RECORDS[record_index][1] = 'No TV result';
        MOVIEDB_RECORDS[record_index][3] = true;
        MOVIEDB_RECORDS[record_index][4] = 'No film result';
        postFilmTV(eventFilmTV,record_index);
        return;
      }; // if (res.statusCode === 200)
    }); // res.on('end', function()
  }); // http.get(url, function(res)
}

function apiPrimeFilmTV(eventFilmTV,targetName) {
  //console.log("DEBUG [apiPrimeFilmTV]> Input: " + targetName);
  MOVIEDB_RECORDS_INDEX++;
  let hold_index = MOVIEDB_RECORDS_INDEX;
  //if (MOVIEDB_RECORDS_INDEX == 10) {MOVIEDB_RECORDS_INDEX = 0;};
  MOVIEDB_RECORDS[hold_index] = [false,'',0,false,'',0,false];
  targetName = targetName.replace(/\s/g, '+');
  targetName = targetName.toLowerCase();
  if (targetName == 'easties'||targetName == 'east+enders'||targetName == 'eastenders') {
    // id 1871 is Eastenders; Season 33 is 2017
    apiFilmTV(eventFilmTV,targetName,true,'tv',hold_index);
  } else {
    apiFilmTV(eventFilmTV,targetName,false,'tv',hold_index,eventFilmTV);
    apiFilmTV(eventFilmTV,targetName,false,'film',hold_index,eventFilmTV);
  };
}

function apiMarvelChar(eventMarvel,marvelWho) {
  //console.log("DEBUG [apiMarvelChar]> Input: " + marvelWho);
  // String together a URL using the provided keys and search parameters
  let marvelNote = '';
  let marvelThumb = '';
  let marvelURL = '';
  let marvelPost = [];
  let url = URL_API_MARVEL + marvelWho + "&apikey=" + KEY_MARVEL_PUBLIC;
  let ts = new Date().getTime();
  let hash = crypto.createHash('md5').update(ts + KEY_MARVEL_PRIVATE + KEY_MARVEL_PUBLIC).digest('hex');
  url += "&ts=" + ts + "&hash=" + hash;
  //console.log("DEBUG [apiMarvelChar]> Lookup: " + url);
  // Call on the URL to get a response
  http.get(url, function(res) {
    let body = "";
    // Data comes through in chunks
    res.on('data', function (chunk) { body += chunk });
    // When all the data is back, go on to query the full response
    res.on('end', function() {
      let characterData = JSON.parse(body);
      //console.log("DEBUG [apiMarvelChar]> Character Code: " + characterData.code);
      if (characterData.code === 200) { // Successful response from Marvel
        if (characterData['data'].count == 0) { // A successful response doesn't mean there was a match
          //console.log("DEBUG [apiMarvelChar]> Valid URL but no results for " + toTitleCase(hero_who));
          marvelPost = [marvelWho,marvelNote,marvelThumb,marvelURL];
          postMarvel(eventMarvel,false,marvelPost);
          return;
        } else if (characterData['data'].results[0].description !== '') { // Assess the first result back
          marvelNote = characterData.data.results[0].description;
          //console.log("DEBUG [apiMarvelChar]> Description: " + marvelNote);
          marvelThumb = characterData.data.results[0].thumbnail.path + '/standard_xlarge.jpg';
          //console.log("DEBUG [apiMarvelChar]> Thumbnail: " + marvelThumb);
          marvelURL = characterData.data.results[0].urls[0].url;
          //console.log("DEBUG [apiMarvelChar]> Hero URL: " + marvelURL);
          marvelPost = [marvelWho,marvelNote,marvelThumb,marvelURL];
          postMarvel(eventMarvel,true,marvelPost);
          return;
        } else { // Assess the first result back when there isn't a description provided by Marvel
          marvelNote = "Find out more at Marvel.";
          //console.log("DEBUG [apiMarvelChar]> Description: " + marvelNote);
          marvelThumb = characterData.data.results[0].thumbnail.path + '/standard_xlarge.jpg';
          //console.log("DEBUG [apiMarvelChar]> Thumbnail: " + marvelThumb);
          marvelURL = characterData.data.results[0].urls[0].url;
          //console.log("DEBUG [apiMarvelChar]> Hero URL: " + marvelURL);
          marvelPost = [marvelWho,marvelNote,marvelThumb,marvelURL];
          postMarvel(eventMarvel,true,marvelPost);
          return;
        };
      } else if (characterData.code === "RequestThrottled") {
          console.log("ERROR [apiMarvelChar]> RequestThrottled Error");
          marvelPost = [marvelWho,marvelNote,marvelThumb,marvelURL];
          postMarvel(eventMarvel,false,marvelPost);
          return;
      } else {
          console.log("ERROR [apiMarvelChar]> Error: " + JSON.stringify(result));
          marvelPost = [marvelWho,marvelNote,marvelThumb,marvelURL];
          postMarvel(eventMarvel,false,marvelPost);
          return;
      };
    });
  });
}

// Loaded/stored value search functions
// ====================================
function lookupAlpha(eventAlpha,letterTile) {
  //console.log("DEBUG [lookupAlpha]> Input: " + letterTile);
  let sender = eventAlpha.sender.id;
  console.log("INFO [lookupAlpha]> Sender: " + sender);
  console.log("INFO [lookupAlpha]> Request: " + TRIGGER_CHASABET_1 + " or " + TRIGGER_CHASABET_2 + " " + letterTile);
  console.log("INFO [lookupAlpha]> Action: lookupAlpha.postImage");
  let target_letter_code = letterTile.charCodeAt(0) - 97;
  let target_version = CHASABET_INDEX[target_letter_code];
  let chasabet_url = URL_IMG_PREFIX + CHASABET[target_letter_code][target_version] + URL_IMG_SUFFIX;
  console.log("INFO [lookupAlpha]> Reponse: IMG URL " + chasabet_url);
  //console.log("DEBUG [lookupAlpha]> IMAGE URL: " + chasabet_url);
  CHASABET_INDEX[target_letter_code] = target_version + 1;
  if (CHASABET_INDEX[target_letter_code] == CHASABET[target_letter_code].length) {
    CHASABET_INDEX[target_letter_code] = 0;
  };
  postImage(eventAlpha,chasabet_url,false,'');
}

function lookupEntry(eventEntry,eventName) {
  //console.log("DEBUG [lookupEntry]> Input: " + eventName);
  let event_index = -1;
  let eventIn = eventName;
  // Take the input provded by the user...
  // ...convert to lower case
  eventName = eventName.toLowerCase();
  // 5k special case
  eventName = eventName.replace(/5k/g, 'fivek');
  // 10k special case
  eventName = eventName.replace(/10k/g, 'tenk');
  // Strip out anything that isn't an alpha or a space
  eventName = eventName.replace(/[^A-Za-z\s]/g, '');
  // Remove small words, 'the','in','at' and 'on'
  eventName = eventName.replace(/ the /g, ' ');
  eventName = eventName.replace(/ in /g, ' ');
  eventName = eventName.replace(/ at /g, ' ');
  eventName = eventName.replace(/ on /g, ' ');
  let compare_to_string = eventName;
  // Remove spaces just to check the final length of the alpha content
  eventName = eventName.replace(/\s/g, '');
  let stripped_sentence_length = eventName.length;
  //console.log("DEBUG [lookupEntry]> Cleaned message is: " + compare_to_string);
  //console.log("DEBUG [lookupEntry]> Length: " + stripped_sentence_length);
  let error_caught = false; // Gets changed to true, if things go iffy before the end
  if (stripped_sentence_length == 0) {
    //console.log("DEBUG [lookupEntry]> There is nothing left to compare");
    error_caught = true;
  };
  // Variables
  let stripped_message_count = 0;
  let regex_builder = '';
  let next_stripped_word = '';
  let found_event = false;
  let zero_is_a_match = -1;
  let event_loop = 0;
  let keyword_loop = 0;
  // Here we go looping through each set of keywords
  //console.log("DEBUG [lookupEntry]> Total events: " + CHAS_EVENTS_TOTAL);
  for (event_loop = 0; event_loop < CHAS_EVENTS_TOTAL; event_loop++) {
    // Break up the keywords into an array of individual words
    let sentence_split = CHAS_EVENTS_CALENDAR[event_loop * CHAS_EVENTS_BLOCK_SIZE].split(' ');
    let sentence_length = sentence_split.length;
    //console.log("DEBUG [lookupEntry]> Number of words: " + sentence_length);
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
        //console.log("DEBUG [lookupEntry]> Next word: " + next_stripped_word);
        stripped_message_count++;
      };
    };
    // Nothing left to compare because search terms have all been stripped out
    if (stripped_message_count == 0) {continue};
    // Complete the search terms regular expression
    regex_builder = regex_builder + REGEX_END;
    //console.log("DEBUG [lookupEntry]> Stripped number of words: " + stripped_message_count);
    //console.log("DEBUG [lookupEntry]> Regex search: " + regex_builder);
    zero_is_a_match = compare_to_string.search(regex_builder);
    //console.log("DEBUG [lookupEntry]> Match Check: " + zero_is_a_match);
    // If there is a match then a value of 0 is returned
    if (zero_is_a_match == 0) {
      //console.log("DEBUG [lookupEntry]> Matched: " + (event_loop * CHAS_EVENTS_BLOCK_SIZE));
      // Sets the index value for the name/keywords for the event
      event_index = event_loop * CHAS_EVENTS_BLOCK_SIZE;
      found_event = true;
      break;
    };
  };
  // If there is not an event found then things have gone funky
  if (!found_event) {
    //console.log("DEBUG [lookupEntry]> No matching event found");
    error_caught = true;
  };
  if (error_caught) {
    postEvents(eventEntry,false,event_index,eventIn);
  } else {
    postEvents(eventEntry,true,event_index,eventIn);
  };
};

function lookupBiogs(eventBiogs,personName) {
  //console.log("DEBUG [lookupBiogs]> Input: " + personName);
  let biogs_index = -1;
  let nameIn = personName;
  // Take the input provded by the user...
  // ...convert to lowercase
  personName = personName.toLowerCase();
  let compare_to_string = personName;
  // Remove spaces just to check the final length of the alpha content
  personName = personName.replace(/\s/g, '');
  let stripped_sentence_length = personName.length;
  //console.log("DEBUG [lookupBiogs]> Cleaned message is: " + compare_to_string);
  //console.log("DEBUG [lookupBiogs]> Length: " + stripped_sentence_length);
  let error_caught = false; // Gets changed to true, if things go iffy before the end
  if (stripped_sentence_length == 0) {
    //console.log("DEBUG [lookupBiogs]> There is nothing left to compare");
    error_caught = true;
  }
  // Variables
  let stripped_message_count = 0;
  let regex_builder = '';
  let next_stripped_word = '';
  let found_bio = false;
  let zero_is_a_match = -1;
  let event_loop = 0;
  let keyword_loop = 0;
  // Here we go looping through each set of keywords
  //console.log("DEBUG [lookupBiogs]> Total: " + CHAS_BIOGS_TOTAL);
  for (event_loop = 0; event_loop < CHAS_BIOGS_TOTAL; event_loop++) {
    // Break up the keywords into an array of individual words
    let sentence_split = CHAS_BIOGS[event_loop * CHAS_BIOGS_BLOCK_SIZE].split(' ');
    let sentence_length = sentence_split.length;
    //console.log("DEBUG [lookupBiogs]> Number of words: " + sentence_length);
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
      //console.log("DEBUG [lookupBiogs]> Next word: " + next_stripped_word);
      stripped_message_count++;
    }
    // Nothing left to compare because search terms have all been stripped out
    if (stripped_message_count == 0) {continue};
    // Complete the search terms regular expression
    regex_builder = regex_builder + REGEX_END;
    //console.log("DEBUG [lookupBiogs]> Stripped number of words: " + stripped_message_count);
    //console.log("DEBUG [lookupBiogs]> Regex search: " + regex_builder);
    zero_is_a_match = compare_to_string.search(regex_builder);
    //console.log("DEBUG [lookupBiogs]> Match Check: " + zero_is_a_match);
    // If there is a match then a value of 0 is returned
    if (zero_is_a_match == 0) {
      //console.log("DEBUG [lookupBiogs]> Matched: " + (event_loop * CHAS_BIOGS_BLOCK_SIZE));
      // Sets the index value for the name/keywords for the event
      biogs_index = event_loop * CHAS_BIOGS_BLOCK_SIZE;
      found_bio = true;
      break;
    };
  };
  // If there is not a name found then things have gone funky
  if (!found_bio) {
    //console.log("DEBUG [lookupBiogs]> No matching name found");
    error_caught = true;
  };
  if (error_caught) {
    postBiogs(eventBiogs,false,biogs_index,nameIn);
  } else {
    postBiogs(eventBiogs,true,biogs_index,nameIn);
  };
}

// 'In-play' functions
// ===================
// Note sendQuestion_playSurvey is also an in-play function
function playHangman(postEvent,hangman_guess) {
  // 0:id_of_sender,2:hangman_in_play,3:rpsls_in_play,6:hangman_strikes,7:hangman_word,8:hangman_array
  //console.log("DEBUG [playHangman]> Input: " + postEvent);
  let sender = postEvent.sender.id;
  // Take out some possible prefixes
  hangman_guess = hangman_guess.replace(/is it /g, '');
  hangman_guess = hangman_guess.replace(/is there an /g, '');
  hangman_guess = hangman_guess.replace(/is there a /g, '');
  hangman_guess = hangman_guess.replace(/\s/g, '_'); // Swap spaces for under under_scores
  let hangmanText = hangman_guess;
  let custom_id = inPlayID(sender);
  let hangman_strikes = SENDERS[custom_id][6];
  let hangman_word = SENDERS[custom_id][7];
  let hangman_answer_array = SENDERS[custom_id][8];
  let clean = false;
  if (hangman_guess == hangman_word) { // Correct answer
    hangman_guess = "Yes! You guessed the mystery staff member, " + hangman_word.toUpperCase() + '!';
    hangmanText = hangman_guess;
    clean = true;
  } else if (hangman_guess.length != 1) { // Long answer that isn't correct
    hangman_guess = '0'; // Make sure it fails on processing
  } else if (!hangman_guess.match(/[a-z]/i)||hangman_guess.length == 0) {
    hangman_guess = "🔤 Single letters only would be nice. I won't give you a strike for that." ;
    hangmanText = hangman_guess;
  };
  if (hangman_guess.length == 1) {
    var got_one = false;
    let i = 0; // an indexer into the array
    for (i = 0; i < hangman_word.length; i++) {
      if (hangman_word[i] == hangman_guess) {
        hangman_answer_array[i] = hangman_guess.toUpperCase(); // Swap the ? for the actual upper-case letter
        got_one = true;
        hangmanText = "Yes! " + hangman_guess.toUpperCase() + " is in the answer.";
        hangmanText = hangmanText + "\n" + hangman_answer_array.join(' ');
        hangmanText = hangmanText + "\n" + MSG_THUMBS[hangman_strikes] + " (" + hangman_strikes + " strike";
        if (hangman_strikes == 1) {
          hangmanText = hangmanText + ")";
        } else {
          hangmanText = hangmanText + "s)";
        };
      };
    };
    // Count the remaining letters
    let hangman_remaining = 0;
    for (i = 0; i < hangman_word.length; i++) {
      if (hangman_answer_array[i] == '?') {
        hangman_remaining++;
      };
    };
    // If no remaining letters, hurray, you won
    if (hangman_remaining == 0) {
      clean = true;
      hangmanText = "Yes! You guessed the mystery staff member, " + hangman_word.toUpperCase() + '!';
    };
    // Otherwise, wrong guess
    if (!got_one) {
      if (hangman_guess == '0') {
        hangmanText = "Bad guess, try a letter at a time until you are closer.";
      } else {
        hangmanText = "Sorry, no " + hangman_guess.toUpperCase() + " to be found.";
      }
      hangman_strikes++;
      // Game Over
      if (hangman_strikes == 4) {
        clean = true;
        hangmanText = hangmanText + '\n' + 'The mystery staff member was ' + hangman_word.toUpperCase() + '!'
      } else {
        hangmanText = hangmanText + "\n" + hangman_answer_array.join(' ');
        hangmanText = hangmanText + "\n" + MSG_THUMBS[hangman_strikes] + " (" + hangman_strikes + " strike";
        if (hangman_strikes == 1) {
          hangmanText = hangmanText + ")";
        } else {
          hangmanText = hangmanText + "s)";
        };
      };
    };
  };
  if (clean) {
    inPlayClean('hangman',custom_id);
  } else {
    SENDERS[custom_id][6] = hangman_strikes;
    SENDERS[custom_id][7] = hangman_word;
    SENDERS[custom_id][8] = hangman_answer_array;
  };
  console.log("INFO [playHangman]> Sender: " + sender);
  console.log("INFO [playHangman]> Request: Hangman guess was " + hangman_guess);
  console.log("INFO [playHangman]> Action: playHangman.sendTextDirect");
  console.log("INFO [playHangman]> Response: " + hangmanText);
  sendTextDirect(postEvent,hangmanText);
}

function playRPSLS(eventRPSLS,pickPlayer) {
  // 0:id_of_sender,3:rpsls_in_play,9:rpsls_action,10:issue_instructions,11:rpsls_player,12:rpsls_bot
  //console.log("DEBUG [playRPSLS]> Round");
  let sender = eventRPSLS.sender.id;
  let custom_id = inPlayID(sender);
  let rpslsText = '';
  let rpsls_url = '';
  let pick_chasbot = '';
  let rpsls_action = SENDERS[custom_id][9];
  let issue_instructions = SENDERS[custom_id][10];
  let score_player = SENDERS[custom_id][11];
  let score_bot = SENDERS[custom_id][12];
  console.log("INFO [playRPSLS]> Sender: " + sender);
  if (rpsls_action == 1) { // Provide some instructions + prompt
    console.log("INFO [playRPSLS]> Request: " + TRIGGER_RPSLS);
    rpsls_url = URL_IMG_PREFIX + RPSLS_IMGS[0] + URL_IMG_SUFFIX;
    rpslsText = MSG_RPSLS_INTRO + "\n" + MSG_RPSLS_PROMPT; // Required within sendTextDirect
    console.log("INFO [playRPSLS]> Action: playRPSLS.postImage_sendTextDirect");
    console.log("INFO [playRPSLS]> Reponse: IMG URL "  + rpsls_url + '; Text: ' + rpslsText);
    postImage(eventRPSLS,rpsls_url,true,rpslsText);
  } else if (rpsls_action == 2) { // Just prompt
    console.log("INFO [playRPSLS]> Request: " + TRIGGER_RPSLS);
    rpslsText = MSG_RPSLS_PROMPT; // Required within sendTextDirect
    console.log("INFO [playRPSLS]> Action: playRPSLS.sendTextDirect");
    console.log("INFO [playRPSLS]> Reponse: " + rpslsText);
    sendTextDirect(eventRPSLS,rpslsText);
  } else { // Compare results and show outcome
    console.log("INFO [playRPSLS]> Request: " + pickPlayer);
    pick_chasbot = RPSLS_VALID[randomBetween(0,4)];
    let PLAYERvBOT = pickPlayer + pick_chasbot;
    rpslsText = '';
    //console.log("DEBUG [playRPSLS]> PLAYERvBOT: " + PLAYERvBOT);
    // Check WIN
    let find_index = 0;
    for (find_index = 0; find_index < RPSLS_WIN.length; find_index++) {
      //console.log("DEBUG [playRPSLS]> Win check: " + RPSLS_WIN[find_index]);
      if (PLAYERvBOT == RPSLS_WIN[find_index]) {
        rpsls_url = URL_IMG_PREFIX + RPSLS_IMGS[1 + find_index] + URL_IMG_SUFFIX;
        rpslsText = "You win. Your " + toTitleCase(pickPlayer) + " ";
        rpslsText = rpslsText + RPSLS_OUTCOMES[find_index] + " my ";
        rpslsText = rpslsText + toTitleCase(pick_chasbot) + ". ";
        score_player++;
        break;
      };
    };
    // Check LOSE
    if (rpslsText == '') {
      find_index = 0;
      for (find_index = 0; find_index < RPSLS_LOSE.length; find_index++) {
        //console.log("DEBUG [playRPSLS]> Lose check: " + RPSLS_LOSE[find_index]);
        if (PLAYERvBOT == RPSLS_LOSE[find_index]) {
          rpsls_url = URL_IMG_PREFIX + RPSLS_IMGS[11 + find_index] + URL_IMG_SUFFIX;
          rpslsText = "I win. My " + toTitleCase(pick_chasbot) + " ";
          rpslsText = rpslsText + RPSLS_OUTCOMES[find_index] + " your ";
          rpslsText = rpslsText + toTitleCase(pickPlayer) + ". ";
          score_bot++;
          break;
        };
      };
    };
    // Check DRAW
    if (rpslsText == '') {
      find_index = 0;
      for (find_index = 0; find_index < RPSLS_DRAW.length; find_index++) {
        //console.log("DEBUG [playRPSLS]> Draw check: " + RPSLS_DRAW[find_index]);
        if (PLAYERvBOT == RPSLS_DRAW[find_index]) {
          rpsls_url = URL_IMG_PREFIX2 + RPSLS_IMGS[21 + find_index] + URL_IMG_SUFFIX;
          rpslsText = "It's a draw. ";
          break;
        };
      };
    };
    // Script message
    if (score_bot == 5) {
      rpslsText = rpslsText + "😁 Soz, I'm the Champion! (Score: CHASbot " + score_bot ;
      rpslsText = rpslsText + ", you " + score_player + ").";
      score_bot = 0;
      score_player = 0;
      issue_instructions = true;
    } else if (score_player == 5) {
      rpslsText = rpslsText + "😡 Whoop, your're the Champion! (Score: CHASbot " + score_bot ;
      rpslsText = rpslsText + ", you " + score_player + ").";
      score_bot = 0;
      score_player = 0;
      issue_instructions = true;
    } else if (score_bot > score_player) {
      rpslsText = rpslsText + "😉 I'm ahead for now but you could turn it around! (Score: CHASbot " + score_bot ;
      rpslsText = rpslsText + ", you " + score_player + ").";
    } else if (score_player > score_bot) {
      rpslsText = rpslsText + "😏 You're leading the way, for now! (Score: CHASbot " + score_bot ;
      rpslsText = rpslsText + ", you " + score_player + ").";
    } else {
      rpslsText = rpslsText + "🙂 Level pegging. (Score: CHASbot " + score_bot ;
      rpslsText = rpslsText + ", you " + score_player + ").";
    };
    SENDERS[custom_id][9] = rpsls_action;
    SENDERS[custom_id][10] = issue_instructions;
    SENDERS[custom_id][11] = score_player;
    SENDERS[custom_id][12] = score_bot;
    console.log("INFO [playRPSLS]> Action: playRPSLS.postImage_sendTextDirect");
    console.log("INFO [playRPSLS]> Reponse: IMG URL "  + rpsls_url + '; Text: ' + rpslsText);
    postImage(eventRPSLS,rpsls_url,true,rpslsText);
  };
}
