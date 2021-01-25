const {smarthome} = require('actions-on-google');
const app = smarthome({
  jwt: './Lorenzo\'s Home-54104e95f364.json'
});

app.reportState({
  requestId: '123ABC',
  agentUserId: 'user-123',
  payload: {
    devices: {
      states: {
        "floor-lamp": {
          on: true
        }
      }
    }
  }
})
.then((res) => {
  // Report state was successful
})
.catch((res) => {
  // Report state failed
});
