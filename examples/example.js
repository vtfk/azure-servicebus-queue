(async () => {
  require('dotenv').config()
  const log = data => console.log(JSON.stringify(data, null, 2))
  const connectionString = process.env.QUEUE_CONNECTION_STRING
  const queueName = process.env.QUEUE_NAME
  const serviceBusClient = require('../src/index')({
    connectionString
  })
  const queue = serviceBusClient.queue(queueName)
  try {
    const messages = await queue.peek()
    log(messages)
  } finally {
    await serviceBusClient.close()
  }
})()
