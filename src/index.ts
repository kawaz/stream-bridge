import { Duplex, Readable, Transform, Writable } from 'node:stream';
import type * as nodeStreamWeb from 'node:stream/web';

/**
 * Converts a Node.js Readable stream to a Web ReadableStream
 * @param readable The Node.js Readable stream to convert
 * @returns A Web ReadableStream with the same functionality
 */
export function toReadableStream<T=Uint8Array>(readable: Readable): ReadableStream<T> {
  return Readable.toWeb(readable) as unknown as ReadableStream<T>;
}

/**
 * Converts a Node.js Writable stream to a Web WritableStream
 * @param writable The Node.js Writable stream to convert
 * @returns A Web WritableStream with the same functionality
 */
export function toWritableStream<T=Uint8Array>(writable: Writable): WritableStream<T> {
  return Writable.toWeb(writable) as unknown as WritableStream<T>;
}

/**
 * Converts a Node.js Transform or Duplex stream to a Web TransformStream
 * @param duplex The Node.js Transform or Duplex stream to convert
 * @returns A Web TransformStream with the same functionality
 */
export function toTransformStream<T=Uint8Array, O=Uint8Array>(duplex: Transform|Duplex): TransformStream<T, O> {
  if (duplex instanceof Transform) {
    return Transform.toWeb(duplex) as unknown as TransformStream<T, O>;
  }
  return Duplex.toWeb(duplex) as unknown as TransformStream<T, O>;
}

/**
 * Converts a Node.js Duplex stream to a Web ReadableWritablePair
 * @param duplex The Node.js Duplex stream to convert
 * @returns A Web ReadableWritablePair with the same functionality
 */
export function toReadableWritablePair<R=unknown, W=unknown>(duplex: Duplex): ReadableWritablePair<R, W> {
  return Duplex.toWeb(duplex) as unknown as ReadableWritablePair<R, W>;
}

/**
 * Converts a Web ReadableStream to a Node.js Readable stream
 * @param readableStream The Web ReadableStream to convert
 * @returns A Node.js Readable stream with the same functionality
 */
export function toReadable(readableStream: ReadableStream): Readable {
  return Readable.fromWeb(readableStream as unknown as nodeStreamWeb.ReadableStream);
}

/**
 * Converts a Web WritableStream to a Node.js Writable stream
 * @param writableStream The Web WritableStream to convert
 * @returns A Node.js Writable stream with the same functionality
 */
export function toWritable(writableStream: WritableStream): Writable {
  return Writable.fromWeb(writableStream as unknown as nodeStreamWeb.WritableStream);
}

/**
 * Converts a Web TransformStream to a Node.js Transform stream
 * @param transformStream The Web TransformStream to convert
 * @returns A Node.js Transform stream with the same functionality
 */
export function toTransform(transformStream: TransformStream): Transform {
  return Transform.fromWeb(transformStream as unknown as nodeStreamWeb.TransformStream) as Transform;
}

/**
 * Converts a Web TransformStream to a Node.js Duplex stream
 * @param transformStream The Web TransformStream to convert
 * @returns A Node.js Duplex stream with the same functionality
 */
export function toDuplex(transformStream: TransformStream): Duplex {
  return Duplex.fromWeb(transformStream as unknown as nodeStreamWeb.TransformStream) as Duplex;
}
