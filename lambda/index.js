const https = require('https')
const { URL } = require('url')
const UPRN = process.env.UPRN
const ROUTE_1 = process.env.ROUTE_1
const ROUTE_2 = process.env.ROUTE_2
const PROPERTY_NAME = process.env.PROPERTY_NAME || 'Hm'
const HEADER_PROP_NAME = process.env.HEADER_PROP_NAME || 'Hm'

// Helper to build query string from an object
const buildQueryString = (params) =>
  Object.entries(params)
    .map(
      ([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`
    )
    .join('&')

// Enhanced fetch function to accept query params
const fetch = (url, params = {}, headers = {}) =>
  new Promise((resolve, reject) => {
    const fullUrl = new URL(url)
    if (params && Object.keys(params).length > 0) {
      fullUrl.search = buildQueryString(params)
    }
    // Prepare the options for the https request
    const options = {
      headers: headers,
    }
    https
      .get(fullUrl.toString(), options, (res) => {
        let data = ''
        res.on('data', (chunk) => (data += chunk))
        res.on('end', () => resolve(data))
      })
      .on('error', (err) => reject(err))
  })

// Build query parameters object
const buildQueryParams = () => {
  const uprn = UPRN
  const today = new Date()
  const sixMonthsLater = new Date(today)
  sixMonthsLater.setMonth(today.getMonth() + 6)

  const formatDate = (date) => date.toISOString().split('T')[0] // YYYY-MM-DD

  return {
    uprn,
    startDate: formatDate(today),
    endDate: formatDate(sixMonthsLater),
  }
}

function extractPropertyValue(jsCode, propertyName) {
  // Create a dynamic regex pattern to find the value of the given propertyName
  const regex = new RegExp(`${propertyName}\\s*:\\s*["'](.*?)["']`, 'i')

  // Try to match the regex pattern against the jsCode
  const match = jsCode.match(regex)

  // If a match is found, return the value, otherwise return null
  return match ? match[1] : null
}

exports.handler = async (event) => {
  try {
    const route1 = ROUTE_1
    const route2 = ROUTE_2

    // 1. GET ROUTE_1 and extract property
    const jsFile = await fetch(route1)
    const propertyValue = extractPropertyValue(jsFile, PROPERTY_NAME)
    if (!propertyValue) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Property not found' }),
      }
    }

    // 2. Build query params and fetch ROUTE_2
    const queryParams = buildQueryParams()
    const headers = {
      [HEADER_PROP_NAME]: propertyValue,
    }
    const response2 = await fetch(route2, queryParams, headers)
    const items = JSON.parse(response2)

    // 3. Filter by type and date
    const now = new Date()
    const relevantItems = items
      .filter(
        (item) =>
          (item.type === 'Black' || item.type === 'Green') &&
          new Date(item.date) > now
      )
      .map((item) => ({
        ...item,
        dateObj: new Date(item.date),
        days: Math.ceil((new Date(item.date) - now) / (1000 * 60 * 60 * 24)),
      }))

    // 4. Find the closest future event
    relevantItems.sort((a, b) => a.dateObj - b.dateObj)
    const nextEvent = relevantItems[0]

    if (!nextEvent) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'No relevant future events found' }),
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        color: nextEvent.type === 'Green' ? 0 : 1,
        days: nextEvent.days,
        colorName: nextEvent.type,
        todayDate: new Date().toISOString().split('T')[0],
        nextEventDate: nextEvent.date.split('T')[0],
      }),
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    }
  }
}
