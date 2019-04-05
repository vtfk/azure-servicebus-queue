# (WIP) azure-servicebus-queue

High-level API for Azure Servicebus Queue operations.

Uses the [@azure/service-bus](https://www.npmjs.com/package/@azure/service-bus) SDK

# Install

```bash
npm i --save @vtfk/azure-servicebus-queue
```

# API

## Connection

TODO

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
const messages = await queue.peek(6)
```

Gives you an array of max 6 messages.

### Peek messages by sequence number

```js
const messages = await queue.peekBySequenceNumber('<sequenceNumber>')
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
