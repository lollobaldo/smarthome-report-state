const {smarthome} = require('actions-on-google');
const mqtt = require('async-mqtt');
const { v4: uuidv4 } = require('uuid');

const googleCredentials = require('./google-credentials.json');
const mqttCredentials = require('./mqtt-credentials.json');

const app = smarthome({
  jwt: googleCredentials
});

const USER_ID = '123';

const devicesChannels = {
  'floor-lamp': 'lights/bulbs',
  'leds-light': 'lights/leds',
};


(async () => {
  try {
    const client = await mqtt.connectAsync(
      'mqtts://mqtt.flespi.io', {
        ...mqttCredentials,
        port: 8883,
        clientId: `report-state--${Math.random().toString(16).substr(2, 8)}`,
      },
    );
    console.log('connected');
    await client.publish('logs/report-state', `Connected: ${67}`);
    client.subscribe(devicesChannels['floor-lamp']);
    client.subscribe(devicesChannels['leds-light']);
    console.log('published');
    
    client.on('message', messageHandler);
    console.log('Idk');
  } catch (e) {
    console.log(e.stack);
  }
})();

const handleLed = (msg) => {
  console.log(msg);
};

const messageHandler = (topic, message) => {
  const msg = message.toString();
  if (topic === devicesChannels['floor-lamp']) {
    handleLight(msg);
  } else if (topic === devicesChannels['leds-light']) {
    handleLed(msg);
  }
};

const reportState = (id, state) => {
  console.log({[id]: state});
  app.reportState({
    requestId: uuidv4(),
    agentUserId: USER_ID,
    payload: {
      devices: {
        states: {
          [id]: state
        }
      }
    }
  })
  .then((res) => {
    console.log(res);
  })
  .catch((res) => {
    console.log(res);
  });
};

const handleLight = (msg) => {
  console.log(msg);
  const { state, brightness, temperature } = message2state(msg);
  const report = { on: state, brightness, color: {
    temperatureK: map(temperature, 0, 255, 2000, 9000),
  }};
  reportState('floor-lamp', report);
};

const map = (value, lowFrom, highFrom, lowTo, highTo) => (
  // eslint-disable-next-line no-mixed-operators
  (value - lowFrom) * (highTo - lowFrom) / (highFrom - lowFrom) + lowTo
);

const message2state = (message) => {
  if (message && (message.charAt(0) === 'N' || message.charAt(0) === 'F')) {
    const [brightness, temperature] = message.substring(1).split(',').map(Number);
    const state = message.charAt(0) === 'N';
    return { state, brightness, temperature };
  }
  console.error('Invalid message');
};

// app.reportState({
//   requestId: '123ABCx',
//   agentUserId: USER_ID,
//   payload: {
//     devices: {
//       states: {
//         "floor-lamp": {
//           on: false
//         }
//       }
//     }
//   }
// })
// .then((res) => {
//   console.log(res);
// })
// .catch((res) => {
//   console.log(res);
// });
