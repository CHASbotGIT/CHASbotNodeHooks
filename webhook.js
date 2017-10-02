/* __ _  _   _   ___ _         _
 / __| || | /_\ / __| |__  ___| |_
| (__| __ |/ _ \\__ \ '_ \/ _ \  _|
 \___|_||_/_/ \_\___/_.__/\___/\__| CHAS (C) 2017 */

 let templates = {
  // Button template
 	welcome_message: {
 		attachment: {
 			type: "template",
 			payload: {
 				template_type: "button",
 				text: "Hello and welcome to your first bot. Would you like to get see our products?",
 				buttons: [
 					{
 						type: "postback",
 						title: "Yes",
 						payload: "get_options"
 					},
 					{
 						type: "postback",
 						title: "No",
 						payload: "no_options"
 					}
 				]
 			}
 		}
 	},
  // Carousel
 	get_options: {
 		attachment: {
 			type: "template",
 			payload: {
 				template_type: "generic",
 				elements: [
 					{
 					title: "Option 1",
 					subtitle: "Amazon Echo",
 					image_url:"http://newswatchtv.com/wp-content/uploads/2015/11/Amazon-Echo.jpg"
 					},
 					{
 						title: "Option 2",
 						subtitle: "Nest protect",
 						image_url:"http://www.computerlegacy.com/wp-content/uploads/2015/08/nest_protect.jpg"
 					},
 					{
 						title: "Option 3",
 						subtitle: "Apple iWatch",
 						image_url:"http://i0.wp.com/www.thebinarytrend.com/wp-content/uploads/2015/03/Apple-Watch-logo-main1.png"
 					}
 				]
 			}
 		}
 	},
  // Flight pass
  flight_pass: {
    attachment: {
      type: "template",
      payload: {
        template_type: "airline_boardingpass",
        intro_message: "You are checked in.",
        locale: "en_US",
        boarding_pass: [
          {
            passenger_name: "SMITH\/NICOLAS",
            pnr_number: "CG4X7U",
            seat: "74J",
            logo_image_url: "https:\/\/www.example.com\/en\/logo.png",
            header_image_url: "https:\/\/www.example.com\/en\/fb\/header.png",
            qr_code: "M1SMITH\/NICOLAS  CG4X7U nawouehgawgnapwi3jfa0wfh",
            above_bar_code_image_url: "https:\/\/www.example.com\/en\/PLAT.png",
            auxiliary_fields: [
              {
                label: "Terminal",
                value: "T1"
              },
              {
                label: "Departure",
                value: "30OCT 19:05"
              }
            ],
            secondary_fields: [
              {
                label: "Boarding",
                value: "18:30"
              },
              {
                label: "Gate",
                value: "D57"
              },
              {
                label: "Seat",
                value: "74J"
              },
              {
                label: "Sec.Nr.",
                value: "003"
              }
            ],
            flight_info: {
              flight_number: "KL0642",
              departure_airport: {
                airport_code: "JFK",
                city: "New York",
                terminal: "T1",
                gate: "D57"
              },
              arrival_airport: {
                airport_code: "AMS",
                city: "Amsterdam"
              },
              flight_schedule: {
                departure_time: "2016-01-02T19:05",
                arrival_time: "2016-01-05T17:30"
              }
            }
          }
        ]
      }
    }
  }
 };

let messageData = templates.flight_pass;
//let messageData = templates.get_options;
//let messageData = templates.welcome_message;

// Make sure everything is properly defined
'use strict';

// Pick up variables from the server implimentation
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const APIAI_TOKEN = process.env.APIAI_TOKEN;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

// Set-up pre-requisites for app
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Local server
//const server = app.listen(process.env.PORT || 5000, () => {
//  console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
//});
// Local or Hosted
const server = app.listen(server_port, server_ip_address, () => {
  console.log( "Listening on " + server_ip_address + ", port " + server_port );
});

console.log('Magic = ' + VERIFY_TOKEN);

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

// Handling all messenges
app.post('/webhook', (req, res) => {
  console.log(req.body);
  if (req.body.object === 'page') {
    req.body.entry.forEach((entry) => {
      entry.messaging.forEach((event) => {
        if (event.message && event.message.text) {
          if (event.message.text == 'SPAM'){
            console.log('Person says: ' + event.message.text);
            sendTemplate(event);
          } else {
            sendMessage(event);
          }
        }
      });
    });
    res.status(200).end();
  }
});


function sendTemplate(event) {
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
        console.log('Error sending message: ', error);
    } else if (response.body.error) {
        console.log('Error: ', response.body.error);
    }
  });
}

const apiaiApp = require('apiai')(APIAI_TOKEN);

function sendMessage(event) {
  let sender = event.sender.id;
  let text = event.message.text;

  let apiai = apiaiApp.textRequest(text, {
    sessionId: 'tabby_cat' // use any arbitrary id
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
        console.log('Error sending message: ', error);
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

/* Webhook for API.ai to get response from the 3rd party API */
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
