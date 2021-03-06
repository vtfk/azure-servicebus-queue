# (WIP) azure-servicebus-queue

High-level API for Azure Servicebus Queue operations.

Supports to send and receive messages >64kb by storing and retrieving from blob storage.

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
const serviceBusClient = require('@vtfk/azure-servicebus-queue')({
  connectionString: '<Servicebus Connection String>'
  /* Uncomment to send and receive messages >64kb
    storageConnectionString: '<Blob Service SAS URL>'
    storageContainerName: '<Container name>'
  */
})
```

## Service Bus operations

TODO

## Subcription client operations

TODO

## Topic operations


First, connect to the desired topic

```js
const topic = serviceBusClient.topic('topicName')
```

### Peek messages

Looks at mesages but don't delete

```js
const limit = 6
const messages = await topic.peek(limit)
```

Returns an array of max 6 messages.

### Peek messages by sequence number

```js
const messages = await topic.peekBySequenceNumber('<sequenceNumber>')
```

### Send message

```js
const message = { body: 'message' }
await topic.send(message)
```

### Receive message(s)

```js
const limit = 10
const timeoutInSeconds = 1
const messages = await topic.receive(limit, timeoutInSeconds)
```

### Send batch

```js
const messages = [{ body: '1' }, { body: '2' }]
await topic.sendBatch(messages)
```

### Schedule Message

```js
const dateToSend = new Date().toISOString()
const message = { body: 'message' }
await topic.scheduleMessage(dateToSend, message)
```

### Schedule Messages

```js
const dateToSend = new Date().toISOString()
const messages = [{ body: '1' }, { body: '2' }]
await topic.scheduleMessages(dateToSend, messages)
```

## Queue operations

First, connect to the desired queue

```js
const queue = serviceBusClient.queue(queueName)
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

### Send message

```js
const message = { body: 'message' }
await queue.send(message)
```

### Receive message(s)

```js
const limit = 10
const timeoutInSeconds = 1
const messages = await queue.receive(limit, timeoutInSeconds)
```

### Send batch

```js
const messages = [{ body: '1' }, { body: '2' }]
await queue.sendBatch(messages)
```

### Schedule Message

```js
const dateToSend = new Date().toISOString()
const message = { body: 'message' }
await queue.scheduleMessage(dateToSend, message)
```


### Schedule Messages

```js
const dateToSend = new Date().toISOString()
const messages = [{ body: '1' }, { body: '2' }]
await queue.scheduleMessages(dateToSend, messages)
```

## Storage operations

Inside storage you will find `readBigMessage` and `sendBigMessage`.  
These will use the `storageConnectionString` and `storageContainerName` arguments to get the correct blob.

### Send big messages

Store a message and get the ID in return.

```js
const message = 'A message that is to big for the servicebus queue'
const fileId = await serviceBusClient.storage.sendBigMessage(message)
```

### Read big messages

Reads a message from the configured blob storage with a specified ID.  
Useful if a function binding is used for listening to new messages.

```js
const fileId = '5266176d-dc5f-4304-b87e-5a4ef78a29b1.json'
const message = await serviceBusClient.storage.readBigMessage(fileId)
```

Returns the content of the blob with that ID.

# Examples

See [examples/example.js](examples/example.js)

To run `example.js` create file `.env` in project root with following content

```
QUEUE_NAME=<queue name>
QUEUE_CONNECTION_STRING=<Servicebus Connection String>
BLOB_SERVICE_SAS_URL=<Blob Service SAS URL> # Only needed for bigfile example
BLOB_CONTAINER_NAME=<Container name> # Only needed for bigfile example
```

And run `npm run example` or `npm run example-bigfile` (to test with messages >64kb)

# License

[MIT](LICENSE)
