const { ServiceBusClient, ReceiveMode } = require('@azure/service-bus')
const storage = require('@vtfk/azure-storage-blob')
const uuid = require('uuid/v4')

function messageSizeOverLimit (s) {
  return ~-encodeURI(JSON.stringify(s)).split(/%..|./).length >= 64000
}

module.exports = options => {
  if (!options) {
    throw Error('Missing required input: options')
  }
  if (!options.connectionString) {
    throw Error('Missing required input: options.connectionString')
  }

  const serviceBusClient = ServiceBusClient.createFromConnectionString(options.connectionString)
  let client, storageClient

  if (options.storageConnectionString && options.storageContainerName) {
    const storageConnection = storage({ connectionString: options.storageConnectionString })
    storageClient = storageConnection.container(options.storageContainerName)
  }

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

  async function sendBigMessage (message) {
    if (!storageClient) {
      throw Error('You need to initialize storage blob connection to send messages >64 kb')
    }
    const fileId = uuid() + '.json'
    await storageClient.writeText(fileId, JSON.stringify(message))
    return fileId
  }

  async function send (message) {
    const sender = client.createSender()
    if (messageSizeOverLimit(message)) {
      const fileId = await sendBigMessage(message)
      return sender.send({ body: { fileId } })
    } else {
      return sender.send(message)
    }
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

  function readBigMessage (fileId) {
    if (!storageClient) {
      throw Error('You need to initialize storage blob connection to receive messages >64 kb')
    }
    return storageClient.read(fileId)
  }

  async function receive (limit = 1, timeoutInSeconds = 5) {
    const receiver = client.createReceiver(ReceiveMode.peekLock)
    const messages = []
    for (let i = 0; i <= limit; i++) {
      const message = await receiver.receiveMessages(1, timeoutInSeconds)
      if (!message.length) return messages
      if (message[0].body && message[0].body.fileId) {
        const content = await readBigMessage(message[0].body.fileId)
        messages.push(JSON.parse(content))
      } else {
        messages.push(message[0].body)
      }
      await message[0].complete()
    }
  }

  return {
    close: () => closeServiceBusClient(),
    subscription: (topicName, subscriptionName) => {
      if (!topicName) {
        throw Error('Missing required input: topicName')
      }
      if (!subscriptionName) {
        throw Error('Missing required input: subscriptionName')
      }
      client = serviceBusClient.createSubscriptionClient(topicName, subscriptionName)
      return {
        // TODO: Subscription Client operations
      }
    },
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
    },
    storage: {
      readBigMessage: fileId => readBigMessage(fileId),
      sendBigMessage: message => sendBigMessage(message)
    }
  }
}
