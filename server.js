require("dotenv").config();
// Import other required libraries
const http = require("http");
const express = require("express");
const restModule = require("./cupiRest.js");
const path = require("path");
const bodyParser = require("body-parser");
const textToSpeech = require("@google-cloud/text-to-speech");
const MessagingResponse = require("twilio").twiml.MessagingResponse;
const axios = require("axios");
const app = express();
const swaggerUi = require("swagger-ui-express"),
  swaggerDocument = require("./swagger.json");

const port = process.env.PORT || 8000;

const settings = {
  cucip: process.env.IP || "10.10.20.18",
  cucuser: process.env.USERNAME || "administrator",
  cucpass: process.env.PASSWORD || "ciscopsdt",
  greetingType: "Alternate",
  greetingName: "Opening Greeting",
  nwsPublicForecastZone: process.env.WEATHERZONE || "ORZ006",
};

const greetingTypes = ['Alternate', 'Busy', 'Error', 'Internal','Closed','Standard','Holiday'];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var weatherID = "";

// Check the weather and update Call Handler if there is a new alert. Runs every 15 mins.
setInterval(function () {
  axios({
    url:
      "https://api.weather.gov/alerts/active/zone/" +
      settings.nwsPublicForecastZone,
    method: "get",
  }).then(function (results) {
    if (results.data.features.length > 0) {
      if (results.data.features[0].properties.id === weatherID) {
        console.log("Weather Alert ID is the same. Skipping alert update");
      } else {
        weatherID = results.data.features[0].properties.id;

        cupiUpdate(
          "Weather",
          "Standard",
          results.data.features[0].properties.headline,
          "en-US-Wavenet-H"
        )
          .then(function (response) {
            console.log("Updated weather alert.");
          })
          .catch(function (error) {
            console.log("Failed!", error);
          });
      }
    } else {
      console.log("No alerts for this area.");
    }
  });
}, 900000);

// Swagger documenation
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Test API Call
app.get("/api/test", (req, res) => {
  res.send({ express: "API successfully working!!!" });
});

// API Call to Unity Backend to get Call Handlers for user to select from
app.get("/api/callhandler/get", (req, res) => {
  // Get Call Handler by name
  restModule
    .fetchRest(
      settings.cucip,
      settings.cucuser,
      settings.cucpass,
      "get",
      "application/json",
      "/vmrest/handlers/callhandlers"
    )
    .catch((err) => {
      res
        .status(404) // HTTP status 404: NotFound
        .send("Not found");
    })
    .then(function (result) {
      if (result) {
        let returnNames = result.Callhandler.filter(function (handler) {
          return handler.IsPrimary == "false";
        }).map(function (names) {
          return names.DisplayName;
        });
        let namesFromAPI = returnNames.map((name) => {
          return {
            label: name,
            value: name.toLowerCase().replace(/\W/g, ""),
            status: "existing",
          };
        });
        res.send(namesFromAPI);
      }
    });
});

// API Call to update/add call handler from values
app.post("/api/callhandler/create", (req, res) => {
  if (req.body.callhandler.status == "existing") {
    cupiUpdate(
      req.body.callhandler.label,
      req.body.greeting.label,
      req.body.text,
      req.body.voice
    ).then(function () {
      res.send(
        `Updated the following Call Handler: (${req.body.callhandler.label}/${req.body.greeting.label})`
      );
    });
  } else {
    cupiNewCallHandler(
      req.body.callhandler.label,
      req.body.greeting.label,
      req.body.text,
      req.body.voice
    ).then(function (result) {
      res.send(
        `Created the following System Call Handler: (${req.body.callhandler.label}/${req.body.greeting.label})`
      );
    });
  }
});

app.param("callhandler", function (req, res, next, callhandler) {
  const modified = callhandler.toLowerCase();
  req.callhandler = modified;
  next();
});

app.param("greeting", function (req, res, next, greeting) {
  if (greeting === "Closed") {
    greeting = "Off Hours";
  }
  const modified = greeting.toLowerCase();
  req.greeting = modified;
  next();
});

app.post("/api/sms/:callhandler/:greeting", (req, res) => {
  const twiml = new MessagingResponse();
  if (req.body.Body.toLowerCase() == "help?") {
    let smsString = `Service will update the Call Handler/Greeting: (${req.callhandler}/${req.greeting}) in Cisco Unity with text to speech that you send via SMS.`;
    twiml.message(smsString);
    res.writeHead(200, { "Content-Type": "text/xml" });
    res.end(twiml.toString());
  } else {
    cupiUpdate(req.callhandler, req.greeting, req.body.Body, "en-US-Wavenet-D")
      .then(function (response) {
        twiml.message(
          `Successfully updated Call Handler/Greeting: (${req.callhandler}/${req.greeting})!`
        );
        res.writeHead(200, { "Content-Type": "text/xml" });
        res.end(twiml.toString());
      })
      .catch(function (error) {
        console.log("Failed!", error);
        twiml.message(
          `Failed to update updated Call Handler/Greeting: (${req.callhandler}/${req.greeting})!`
        );
        res.writeHead(200, { "Content-Type": "text/xml" });
        res.end(twiml.toString());
      });
  }
});

if (process.env.NODE_ENV === "production") {
  // Serve any static files
  app.use(express.static(path.join(__dirname, "client/build")));

  // Handle React routing, return all requests to React app
  app.get("*", function (req, res) {
    res.sendFile(path.join(__dirname, "client/build", "index.html"));
  });
}

http.createServer(app).listen(port, () => {
  console.log("Express server listening on port " + port);
});

function cupiUpdate(callhandler, greeting, text, voice) {
  return new Promise(function (resolve, reject) {
    // Get Call Handler by name
    var callHandlerLower = callhandler.toLowerCase();

    restModule
      .fetchRest(
        settings.cucip,
        settings.cucuser,
        settings.cucpass,
        "get",
        "application/json",
        "/vmrest/handlers/callhandlers"
      )
      .catch((err) => {
        reject(err);
      })
      .then(function (result) {
        // Let's find the greeting we want to upday
        var findMe = result.Callhandler.find(
          (element) => element.DisplayName.toLowerCase() === callHandlerLower
        );

        let findGreeting = greetingTypes.findIndex(item => greeting.toLowerCase() === item.toLowerCase());

        // Let's get the Greeting URI
        restModule
          .fetchRest(
            settings.cucip,
            settings.cucuser,
            settings.cucpass,
            "get",
            "application/json",
            findMe.GreetingsURI + "/" + greetingTypes[findGreeting] + "/"
          )
          .catch((err) => {
            reject(err);
          })
          .then(function (result) {
            // Let's upload the WAV file from Google TTS
            googleTTS(result.GreetingStreamFilesURI, text, voice)
              .then(function (result) {
                resolve(result);
              })
              .catch(function (err) {
                reject(err);
              });
          });

        let data = {
          Enabled: "true",
          TimeExpires: "",
        };

        // Let's enable the greeting
        restModule
          .fetchRest(
            settings.cucip,
            settings.cucuser,
            settings.cucpass,
            "put",
            "application/json",
            findMe.GreetingsURI + "/" + greetingTypes[findGreeting] + "/",
            data
          )
          .catch((err) => {
            reject(err);
          })
          .then(function (result) {
            resolve(result);
          });
      });
  });
}

function cupiNewCallHandler(callhandler, greeting, text, voice) {
  return new Promise(function (resolve, reject) {
    // Get Call Handler Template
    restModule
      .fetchRest(
        settings.cucip,
        settings.cucuser,
        settings.cucpass,
        "get",
        "application/json",
        "/vmrest/callhandlertemplates"
      )
      .catch((err) => {
        reject(err);
      })
      .then(function (result) {
        // Let's find the greeting we want to update
        if (Array.isArray(result.CallhandlerTemplate)) {
          var findMe = result.CallhandlerTemplate.find(
            (element) => element.DisplayName === "System Call Handler Template"
          );
          templateObjId = findMe.ObjectId;
        } else {
          if (
            result.CallhandlerTemplate.DisplayName ==
            "System Call Handler Template"
          ) {
            templateObjId = result.CallhandlerTemplate.ObjectId;
          } else {
            reject("Could not locate System Call Handler Template");
          }
        }

        json_body = {
          DisplayName: callhandler,
        };

        restModule
          .fetchRest(
            settings.cucip,
            settings.cucuser,
            settings.cucpass,
            "POST",
            "application/json",
            "/vmrest/handlers/callhandlers?templateObjectId=" + templateObjId,
            json_body
          )
          .catch((err) => {
            reject(err);
          })
          .then(function (result) {
            cupiUpdate(callhandler, greeting, text, voice).then(function () {
              resolve(result);
            });
          });
      });
  });
}

function googleTTS(uri, text, voice) {
  return new Promise(async function (resolve, reject) {
    try {
      // Creates a client
      const client = new textToSpeech.TextToSpeechClient();

      const request = {
        audioConfig: {
          audioEncoding: "LINEAR16",
          effectsProfileId: ["telephony-class-application"],
          pitch: 0,
          speakingRate: 1,
        },
        input: {
          text: text,
        },
        voice: {
          languageCode: "en-US",
          name: voice.status,
        },
      };

      // Performs the Text-to-Speech request
      const [response] = await client.synthesizeSpeech(request);
      // Write the binary audio content to a local file
      restModule
        .fetchRest(
          settings.cucip,
          settings.cucuser,
          settings.cucpass,
          "put",
          "audio/wav",
          uri + "/1033/audio",
          response.audioContent
        )
        .catch((err) => {
          reject(err);
        })
        .then(function (result) {
          resolve(result);
        });
    } catch (error) {
      reject(error);
    }
  });
}
