import { Duplex, Readable, Transform, Writable } from 'node:stream';
import type * as nodeStreamWeb from 'node:stream/web';

export function toReadableStream<T=Uint8Array>(readable: Readable): ReadableStream<T> {
  return Readable.toWeb(readable) as unknown as ReadableStream<T>;
}

export function toWritableStream<T=Uint8Array>(writable: Writable): WritableStream<T> {
  return Writable.toWeb(writable) as unknown as WritableStream<T>;
}

export function toTransformStream<T=Uint8Array, O=Uint8Array>(duplex: Transform|Duplex): TransformStream<T, O> {
  if (duplex instanceof Transform) {
    return Transform.toWeb(duplex) as unknown as TransformStream<T, O>;
  }
  return Duplex.toWeb(duplex) as unknown as TransformStream<T, O>;
}

export function toReadableWritablePair<R=unknown, W=unknown>(duplex: Duplex): ReadableWritablePair<R, W> {
  return Duplex.toWeb(duplex) as unknown as ReadableWritablePair<R, W>;
}

export function toReadable(readableStream: ReadableStream): Readable {
  return Readable.fromWeb(readableStream as unknown as nodeStreamWeb.ReadableStream);
}

export function toWritable(writableStream: WritableStream): Writable {
  return Writable.fromWeb(writableStream as unknown as nodeStreamWeb.WritableStream);
}

export function toTransform(transformStream: TransformStream): Transform {
  return Transform.fromWeb(transformStream as unknown as nodeStreamWeb.TransformStream) as Transform;
}

export function toDuplex(transformStream: TransformStream): Duplex {
  return Duplex.fromWeb(transformStream as unknown as nodeStreamWeb.TransformStream) as Duplex;
}
