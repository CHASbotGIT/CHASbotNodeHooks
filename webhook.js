const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const server = app.listen(process.env.PORT || 5000, () => {
  console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});

/* For Facebook Validation */
app.get('/webhook', (req, res) => {
  if (req.query['hub.mode'] && req.query['hub.verify_token'] === 'child_of_ch@5bot!') {
    res.status(200).send(req.query['hub.challenge']);
  } else {
    res.status(403).end();
  }
});

/* Handling all messenges */
app.post('/webhook', (req, res) => {
  console.log(req.body);
  if (req.body.object === 'page') {
    req.body.entry.forEach((entry) => {
      entry.messaging.forEach((event) => {
        if (event.message && event.message.text) {
          sendMessage(event);
        }
      });
    });
    res.status(200).end();
  }
});

//const request = require('request');

//function sendMessage(event) {
//  let sender = event.sender.id;
//  let text = event.message.text;

//  request({
//    url: 'https://graph.facebook.com/v2.6/me/messages',
//    qs: {access_token: 'DQVJ0UmNGZAm1CaDlpMHlMLUlmbFQ1dXh5cS1qQ2lyM1dvRjlsNnRfUlQwUEtOZAUgwNGNockltWkJSRjdzb0REVkxtX3FhYnBPZA19sRXB5c1dmWFFiT3dlczVsdDhrTkNNeXJwQ0tBdklKMnZAEX2pHN2ZAjd3liNDdJRXppc19Kd1JTMkEzYzdEX1Y2UWFERldZAUDVBTXgtRGNzYktDSkp3SFhMOGN3OHZAHZATBLZA2s3ZAnREM1NZALWJybllJSFk1N3lrTTUzb2FkNGRkNC1UNDNxWQZDZD'},
//    method: 'POST',
//    json: {
//      recipient: {id: sender},
//      message: {text: text}
//    }
//  }, function (error, response) {
//    if (error) {
//        console.log('Error sending message: ', error);
//    } else if (response.body.error) {
//        console.log('Error: ', response.body.error);
//    }
//  });
//}

const apiaiApp = require('apiai')('dee91c4603864109b2d13ab6ecbac526');

function sendMessage(event) {
  let sender = event.sender.id;
  let text = event.message.text;

  let apiai = apiaiApp.textRequest(text, {
    sessionId: 'tabby_cat' // use any arbitrary id
  });

  apiai.on('response', (response) => {
    let aiText = response.result.fulfillment.speech;

      request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: 'DQVJ0UmNGZAm1CaDlpMHlMLUlmbFQ1dXh5cS1qQ2lyM1dvRjlsNnRfUlQwUEtOZAUgwNGNockltWkJSRjdzb0REVkxtX3FhYnBPZA19sRXB5c1dmWFFiT3dlczVsdDhrTkNNeXJwQ0tBdklKMnZAEX2pHN2ZAjd3liNDdJRXppc19Kd1JTMkEzYzdEX1Y2UWFERldZAUDVBTXgtRGNzYktDSkp3SFhMOGN3OHZAHZATBLZA2s3ZAnREM1NZALWJybllJSFk1N3lrTTUzb2FkNGRkNC1UNDNxWQZDZD'},
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
