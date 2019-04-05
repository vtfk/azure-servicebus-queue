# (WIP) azure-servicebus-queue

High-level API for Azure Servicebus Queue operations.

Uses the [@azure/service-bus](https://www.npmjs.com/package/@azure/service-bus) SDK

# Install

```bash
npm i --save @vtfk/azure-servicebus-queue
```

# API

## Connection

Get connection string for Service Bus & names for Queues/Topics/Subscriptions

- In the [Azure Portal](https://portal.azure.com), go to **Dashboard > Service Bus > _your-servicebus-namespace_**.
- Note down the "Primary Connection String" of **RootManageSharedAccessKey** at **Shared access policies** under **Settings** tab.
- To work with Queues, find the "Queues" tab right under "Entities" at **_your-servicebus-namespace_**, create a Queue and note down its name.
- To work with Topics, find the "Topics" tab right under "Entities" at **_your-servicebus-namespace_**, create a Topic. Go to **_your-servicebus-namespace_ > _your-topic_**, create subscriptions for the topic. Note down the names of the topic and subscriptions.

```js
const namespace = require('./src/index')({
  connectionString: '<Servicebus Connection String>'
})
```

## Namespace operations

## Queue operations

First, connect to the desired queue

```js
const queue = namespace.queue(queueName)
```

### Peek messages

Looks at mesages but don't delete

```js
const limit = 6
const messages = await queue.peek(limit)
```

Returns an array of max 6 messages.

### Peek messages by sequence number

```js
const messages = await queue.peekBySequenceNumber('<sequenceNumber>')
```

## Send message

```js
const message = 'Message'
await queue.send(message)
```

## Receive message(s)

```js
const limit = 10
const timeoutInSeconds = 1
const messages = await queue.receive(limit, timeoutInSeconds)
```

## Send batch

```js
const messages = [{ message: '1' }, { message: '2' }]
await queue.sendBatch(messages)
```

## Schedule Message

```js
const dateToSend = new Date().toISOString()
const message = 'Message'
await queue.scheduleMessage(dateToSend, message)
```


## Schedule Messages

```js
const dateToSend = new Date().toISOString()
const messages = [{ message: '1' }, { message: '2' }]
await queue.scheduleMessages(dateToSend, messages)
```

# Examples

See [examples/example.js](examples/example.js)

To run `example.js` create file `.env` in project root with following content

```
QUEUE_NAME=<queue name>
QUEUE_CONNECTION_STRING=<queue connection string url>
```

And run `npm run example`

# License

[MIT](LICENSE)
