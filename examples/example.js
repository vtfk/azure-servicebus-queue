(async () => {
  require('dotenv').config()
  const log = data => console.log(JSON.stringify(data, null, 2))
  const connectionString = process.env.QUEUE_CONNECTION_STRING
  const queueName = process.env.QUEUE_NAME
  const storageConnectionString = process.env.BLOB_SERVICE_SAS_URL
  const storageContainerName = process.env.BLOB_CONTAINER_NAME
  const serviceBusClient = require('../src/index')({
    connectionString,
    storageConnectionString,
    storageContainerName
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
