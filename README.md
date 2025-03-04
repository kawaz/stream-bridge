# @kawaz/stream-bridge

A utility library that provides bidirectional conversion between Node.js streams and Web Stream API streams.

## Features

- Convert Node.js streams to Web Stream API streams
- Convert Web Stream API streams to Node.js streams
- Written in TypeScript for type safety
- Zero external runtime dependencies
- Support for all major stream types

## Installation

```bash
# Using npm
npm install @kawaz/stream-bridge

# Using yarn
yarn add @kawaz/stream-bridge

# Using bun
bun add @kawaz/stream-bridge
```

## Usage

### Converting Node.js Streams to Web Streams

```typescript
import { toReadableStream, toWritableStream, toTransformStream } from '@kawaz/stream-bridge';
import { Readable, Writable, Transform } from 'node:stream';

// Convert to ReadableStream
const nodeReadable = new Readable();
const webReadable = toReadableStream(nodeReadable);

// Convert to WritableStream
const nodeWritable = new Writable();
const webWritable = toWritableStream(nodeWritable);

// Convert to TransformStream
const nodeTransform = new Transform();
const webTransform = toTransformStream(nodeTransform);
```

### Converting Web Streams to Node.js Streams

```typescript
import { toReadable, toWritable, toTransform } from '@kawaz/stream-bridge';

// Convert to Readable
const webReadable = new ReadableStream();
const nodeReadable = toReadable(webReadable);

// Convert to Writable
const webWritable = new WritableStream();
const nodeWritable = toWritable(webWritable);

// Convert to Transform
const webTransform = new TransformStream();
const nodeTransform = toTransform(webTransform);
```

## API

### Node.js → Web Stream

- `toReadableStream<T>(readable: Readable): ReadableStream<T>`
- `toWritableStream<T>(writable: Writable): WritableStream<T>`
- `toTransformStream<T, O>(duplex: Transform|Duplex): TransformStream<T, O>`
- `toReadableWritablePair<R, W>(duplex: Duplex): ReadableWritablePair<R, W>`

### Web Stream → Node.js

- `toReadable(readableStream: ReadableStream, options?): Readable`
- `toWritable(writableStream: WritableStream, options?): Writable`
- `toTransform(transformStream: TransformStream, options?): Transform`
- `toDuplex(transformStream: TransformStream, options?): Duplex`

## License

MIT © Yoshiaki Kawazu

## Contributing

Please report bugs and feature requests in the [GitHub Issues](https://github.com/kawaz/stream-bridge/issues).
Pull requests are welcome.

## Development

```bash
# Install dependencies
bun install

# Run tests
bun test

# Build
bun run build
```
