const { ServiceBusClient, ReceiveMode } = require('@azure/service-bus')

module.exports = options => {
  if (!options) {
    throw Error('Missing required input: options')
  }
  if (!options.connectionString) {
    throw Error('Missing required input: options.connectionString')
  }

  const serviceBusClient = ServiceBusClient.createFromConnectionString(options.connectionString)
  let client

  async function closeServiceBusClient () {
    if (client) await client.close()
    if (serviceBusClient) await serviceBusClient.close()
  }

  async function closeClient () {
    if (client) await client.close()
  }

  function peekBySequenceNumber (sequenceNumber, limit = 1) {
    return client.peekBySequenceNumber(sequenceNumber, limit)
  }

  function peek (limit = 1) {
    return client.peek(limit)
  }

  function send (message) {
    const sender = client.createSender()
    return sender.send(message)
  }

  function sendBatch (messages) {
    const sender = client.createSender()
    return sender.sendBatch(messages)
  }

  function scheduleMessage (date, message) {
    const sender = client.createSender()
    return sender.scheduleMessage(date, message)
  }

  function scheduleMessages (date, messages) {
    const sender = client.createSender()
    return sender.scheduleMessages(date, messages)
  }

  async function receive (limit = 1, timeoutInSeconds = 5) {
    const receiver = client.createReceiver(ReceiveMode.peekLock)
    const messages = []
    for (let i = 0; i <= limit; i++) {
      const message = await receiver.receiveMessages(1, timeoutInSeconds)
      if (!message.length) return messages
      messages.push(message[0].body)
      await message[0].complete()
    }
  }

  return {
    close: () => closeServiceBusClient(),
    topic: topicName => {
      if (!topicName) {
        throw Error('Missing required input: topicName')
      }
      client = serviceBusClient.createTopicClient(topicName)
      return {
        close: () => closeClient(),
        peek: limit => peek(limit),
        peekBySequenceNumber: (sequenceNumber, limit) => peekBySequenceNumber(sequenceNumber, limit),
        send: message => send(message),
        sendBatch: messages => sendBatch(messages),
        scheduleMessage: (date, message) => scheduleMessage(date, message),
        scheduleMessages: (date, messages) => scheduleMessages(date, messages),
        receive: (limit, timeoutInSeconds) => receive(limit, timeoutInSeconds)
      }
    },
    queue: queueName => {
      if (!queueName) {
        throw Error('Missing required input: queueName')
      }
      client = serviceBusClient.createQueueClient(queueName)
      return {
        close: () => closeClient(),
        peek: limit => peek(limit),
        peekBySequenceNumber: (sequenceNumber, limit) => peekBySequenceNumber(sequenceNumber, limit),
        send: message => send(message),
        sendBatch: messages => sendBatch(messages),
        scheduleMessage: (date, message) => scheduleMessage(date, message),
        scheduleMessages: (date, messages) => scheduleMessages(date, messages),
        receive: (limit, timeoutInSeconds) => receive(limit, timeoutInSeconds)
      }
    }
  }
}
