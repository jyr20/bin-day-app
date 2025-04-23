// test.js
require('dotenv').config() // optional if using .env
const { handler } = require('./index')

const event = require('./event.json')

handler(event)
  .then((response) => {
    console.log('Lambda Response:', response)
  })
  .catch((error) => {
    console.error('Lambda Error:', error)
  })
