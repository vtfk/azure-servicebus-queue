const { Namespace } = require('@azure/service-bus')

module.exports = options => {
  if (!options) {
    throw Error('Missing required input: options')
  }
  if (!options.connectionString) {
    throw Error('Missing required input: options.connectionString')
  }

  const ns = Namespace.createFromConnectionString(options.connectionString)
  let client

  async function closeNs () {
    if (client) await client.close()
    if (ns) await ns.close()
  }

  async function closeQueue () {
    if (client) await client.close()
  }

  function peekBySequenceNumber (sequenceNumber, limit = 1) {
    return client.peekBySequenceNumber(sequenceNumber, limit)
  }

  function peek (limit = 1) {
    return client.peek(limit)
  }

  function send (message) {
    const sender = client.getSender()
    return sender.send(message)
  }

  function sendBatch (messages) {
    const sender = client.getSender()
    return sender.sendBatch(messages)
  }

  function scheduleMessage (date, message) {
    const sender = client.getSender()
    return sender.scheduleMessage(date, message)
  }

  function scheduleMessages (date, messages) {
    const sender = client.getSender()
    return sender.scheduleMessages(date, messages)
  }

  function receive (limit = 1, timeoutInSeconds = 1) {
    const receiver = client.getReceiver()
    // TODO: Mark as complete i.e await messages[0].complete()
    return receiver.receiveBatch(limit, timeoutInSeconds)
  }

  return {
    close: () => closeNs(),
    topic: topicName => {
      return {}
    },
    queue: queueName => {
      if (!queueName) {
        throw Error('Missing required input: queueName')
      }
      client = ns.createQueueClient(queueName)
      return {
        close: () => closeQueue(),
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
