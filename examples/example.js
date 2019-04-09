(async () => {
  require('dotenv').config()
  const log = data => console.log(JSON.stringify(data, null, 2))
  const connectionString = process.env.QUEUE_CONNECTION_STRING
  const queueName = process.env.QUEUE_NAME
  const serviceBusClient = require('../src/index')({
    connectionString
  })
  const queue = serviceBusClient.queue(queueName)
  const message = { body: 'Hello' }
  try {
    const messages = await queue.peek()
    const receivedMessage = await queue.receive(1)
    await queue.send(message)
    console.log('Message sent:')
    log(message)
    console.log('Peeked message:')
    log(messages)
    console.log('Received message:')
    log(receivedMessage)
  } catch (error) {
    console.error(error)
  } finally {
    await serviceBusClient.close()
  }
})()
