
// https://bit.ly/35iomfS

const http = require('http');
const express = require('express');
const restModule = require('./cupiRest.js')
const path = require('path');
const bodyParser = require('body-parser');
const textToSpeech = require('@google-cloud/text-to-speech');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const ngrok = require('ngrok');
const opn = require('opn');

const app = express();
const port = process.env.PORT || 5000;

const settings = {
    cucip: '10.10.20.18',
    cucuser: 'administrator',
    cucpass: 'ciscopsdt',
    greetingType: 'Alternate',
    greetingName: 'Opening Greeting'
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API calls

// Test API Call
app.get('/api/test', (req, res) => {
  res.send({ express: 'Hello From Express' });
});

// API Call to Unity Backend to get Call Handlers for user to select from
app.get('/api/callhandler/get', (req, res) => {
  // Get Call Handler by name
  restModule.fetchRest(settings.cucip, settings.cucuser, settings.cucpass,'get','application/json','/vmrest/handlers/callhandlers').catch(err => {
    console.log(err)
  }).then(function (result) {
    let returnNames =  result['Callhandler'].filter(function(handler) {
      return handler.IsPrimary == 'false';
    }).map(function (names) {
        return names.DisplayName;
    })
    let namesFromAPI = returnNames.map(name => { return { label: name, value: name.toLowerCase().replace(/\W/g, ''), status: 'existing'} })
    res.send(namesFromAPI);
  })
});

// API Call to update call handler from values
app.post('/api/callhandler/create', (req, res) => {
  //  {
  //    callhandler: {
  //      label: 'Opening Greeting',
  //      value: 'openinggreeting',
  //      status: 'existing'
  //    },
  //     greeting: { label: 'Alternate', value: 'alternate', status: 'existing' },
  //     text: 'adfadfadf'
  // }
  if (req.body.callhandler.status == 'existing'){
    cupiUpdate(req.body.callhandler.label,req.body.greeting.label,req.body.text).then(function() {
      res.send(
        `Updated the following call handler: ${req.body.callhandler.label}`,
      );
    })
  }else{
    cupiNewCallHandler(req.body.callhandler.label,req.body.greeting.label,req.body.text).then(function(result) {
      res.send(
        `Created the following call handler: ${req.body.callhandler.label}`,
      );
    })
  }
});

app.post('/api/callhandler/opengreeting/alternate/sms', (req, res) => {
  const twiml = new MessagingResponse();
	if (req.body.Body.toLowerCase() == 'help?') {
    twiml.message('Service will update the "Open Greeting" call handler alternate greeting in Cisco Unity with text to speech that you send via SMS.');
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
	} else {
    cupiUpdate(settings.greetingName,settings.greetingType,req.body.Body).then(function(response) {
      twiml.message(
        'Successfully updated "Open Greeting" alternate greeting!'
      );
      res.writeHead(200, { 'Content-Type': 'text/xml' });
      res.end(twiml.toString());

    }).catch(function(error) {
      console.log("Failed!", error);
      twiml.message(
        'Failed to update "Open Greeting" alternate greeting!'
      );
      res.writeHead(200, { 'Content-Type': 'text/xml' });
      res.end(twiml.toString());
    })
	}
});

if (process.env.NODE_ENV === 'production') {
  // Serve any static files
  app.use(express.static(path.join(__dirname, 'client/build')));

  // Handle React routing, return all requests to React app
  app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}else{
  // In development mode...open NGROK status page
  opn('http://127.0.0.1:4040/status')
}

http.createServer(app).listen(port, () => {
	console.log('Express server listening on port ' + port);
	(async function() {
		await ngrok.connect({
			proto: 'http', // http|tcp|tls, defaults to http
			addr: port, // port or network address, defaults to 80
			subdomain: 'automate.builders', // reserved tunnel name
			authtoken: '7f71vJpNdmJszQQQYVQLt_7Kctcy12W4Td2AmwELYF1', // your authtoken from ngrok.com
			region: 'us', // one of ngrok regions (us, eu, au, ap), defaults to us
			onStatusChange: status => {}, // 'closed' - connection is lost, 'connected' - reconnected
			onLogEvent: data => {}, // returns stdout messages from ngrok process
    });
	})();
});

// Disconnect Ngrok
process.once("SIGHUP", function () {
  (async function() {
    try {
      await ngrok.kill();
    } catch (error) {
      console.log(error.message)
    }
	})();
})

function cupiUpdate(callhandler,greeting,text) {
  return new Promise(function(resolve, reject){
    // Get Call Handler by name
    restModule.fetchRest(settings.cucip, settings.cucuser, settings.cucpass,'get','application/json','/vmrest/handlers/callhandlers').catch(err => {
      reject(err)
    }).then(function (result) {
      // Let's find the greeting we want to upday 
      var findMe = result.Callhandler.find(element => element.DisplayName === callhandler);
      
      // Let's get the Alternate Greeting URI
      restModule.fetchRest(settings.cucip,settings.cucuser,settings.cucpass,'get','application/json',findMe.GreetingsURI + '/' + greeting + '/').catch(err => {
        reject(err)
      }).then(function(result) {
        // Let's upload the WAV file from Google TTS
        googleTTS(result.GreetingStreamFilesURI,text)
      })
      
      let data = {
        "Enabled":"true",
        "TimeExpires": ""
      }
      
      // Let's enable the greeting
      restModule.fetchRest(settings.cucip,settings.cucuser,settings.cucpass,'put','application/json',findMe.GreetingsURI + '/' + greeting + '/', data).catch(err => {
        reject(err)
      }).then(function (result) {
        resolve(result)
      })
    })
  })
}

function cupiNewCallHandler(callhandler,greeting,text) {
  return new Promise(function(resolve, reject){
    // Get Call Handler Template
    restModule.fetchRest(settings.cucip, settings.cucuser, settings.cucpass,'get','application/json','/vmrest/callhandlertemplates').catch(err => {
      reject(err)
    }).then(function (result) {
      // Let's find the greeting we want to update
      if (Array.isArray(result.CallhandlerTemplate)){
        var findMe = result.CallhandlerTemplate.find(element => element.DisplayName === 'System Call Handler Template');
        templateObjId = findMe.ObjectId
      }else{
        if (result.CallhandlerTemplate.DisplayName == 'System Call Handler Template'){
          templateObjId = result.CallhandlerTemplate.ObjectId
        }else{
          reject('Could not locate System Call Handler Template')
        }
      }

      json_body = {
        "DisplayName": callhandler
      }

      restModule.fetchRest(settings.cucip, settings.cucuser, settings.cucpass,'POST','application/json','/vmrest/handlers/callhandlers?templateObjectId=' + templateObjId,json_body).catch(err => {
        reject(err)
      }).then(function (result) {
        cupiUpdate(callhandler,greeting,text).then(function() {
          resolve(result)
        })
      })
    })
  })
}

async function googleTTS(uri,text) {
	// Creates a client
	const client = new textToSpeech.TextToSpeechClient();

	const request = {
		"audioConfig": {
			"audioEncoding": "LINEAR16",
			"effectsProfileId": [
				"telephony-class-application"
			],
			"pitch": 0,
			"speakingRate": 1
		},
		"input": {
			"text": text
		},
		"voice": {
			"languageCode": "en-US",
			"name": "en-US-Wavenet-D"
		}
  }

	// Performs the Text-to-Speech request
	const [response] = await client.synthesizeSpeech(request);
	// Write the binary audio content to a local file
	restModule.fetchRest(settings.cucip,settings.cucuser,settings.cucpass,'put','audio/wav',uri + '/1033/audio',response.audioContent).catch(err => {
		console.log(err)
	}).then(function (result) {
		console.log(result)
	})
}
