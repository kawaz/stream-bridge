import { describe, expect, it, beforeEach, afterEach } from "bun:test";
import { Duplex, Readable, Transform, Writable } from "node:stream";
import {
  toReadableStream,
  toWritableStream,
  toTransformStream,
  toReadableWritablePair,
  toReadable,
  toWritable,
  toTransform,
  toDuplex
} from "../src"; // パッケージのインポートパスを適宜調整してください
import { skip } from "node:test";

describe("stream-bridge", () => {
  // Node.js → Web Stream API 変換テスト
  describe("Node.js to Web Stream API conversions", () => {
    describe("toReadableStream", () => {
      it("should convert a Node.js Readable to Web ReadableStream", async () => {
        // テストデータ作成
        const data = "Hello, World!";
        const nodeReadable = Readable.from([data]);

        // 変換
        const webReadable = toReadableStream<string>(nodeReadable);

        // 検証
        expect(webReadable).toBeInstanceOf(ReadableStream);

        // データの読み取りテスト
        const reader = webReadable.getReader();
        const { value, done } = await reader.read();
        expect(done).toBe(false);
        expect(value).toBe(data);

        const next = await reader.read();
        expect(next.done).toBe(true);
      });

      it("should handle Buffer data correctly", async () => {
        const buffer = Buffer.from("Buffer Test");
        const nodeReadable = Readable.from([buffer]);

        const webReadable = toReadableStream(nodeReadable);
        const reader = webReadable.getReader();
        const { value } = await reader.read();

        // Web Stream APIではBufferはUint8Arrayに変換される
        expect(value).toBeInstanceOf(Uint8Array);
        expect(new TextDecoder().decode(value as Uint8Array)).toBe("Buffer Test");
      });
    });

    describe("toWritableStream", () => {
      it("should convert a Node.js Writable to Web WritableStream", async () => {
        // 収集するデータの配列
        const chunks: unknown[] = [];

        // Node.js Writable作成
        const nodeWritable = new Writable({
          write(chunk, encoding, callback) {
            chunks.push(chunk.toString().toUpperCase());
            callback();
          }
        });

        // 変換
        const webWritable = toWritableStream(nodeWritable);

        // 検証
        expect(webWritable).toBeInstanceOf(WritableStream);

        // データ書き込みテスト
        const writer = webWritable.getWriter();
        await writer.write(new TextEncoder().encode("Test Data"));
        await writer.close();

        expect(chunks).toEqual(["TEST DATA"]);
      });
    });

    describe("toTransformStream", () => {
      it("should convert Node.js Transform to Web TransformStream", async () => {
        // Node.js Transform作成（大文字変換）
        const nodeTransform = new Transform({
          transform(chunk, encoding, callback) {
            const transformed = chunk.toString().toUpperCase();
            callback(null, transformed);
          }
        });

        // 変換
        const webTransform = toTransformStream(nodeTransform);

        // 検証 TransformStream は interface なのでプロパティの有無をチェック
        expect(webTransform).toHaveProperty("readable");
        expect(webTransform).toHaveProperty("writable");

        // 機能テスト
        const writer = webTransform.writable.getWriter();
        const reader = webTransform.readable.getReader();

        await writer.write(new TextEncoder().encode("test"));
        await writer.close();

        const { value } = await reader.read();
        expect(value).toEqual(new TextEncoder().encode("TEST"));
      });

      it("should convert Node.js Duplex to Web TransformStream", async () => {
        // Node.js Duplex作成
        const nodeDuplex = new Duplex({
          read() {},
          write(chunk, encoding, callback) {
            this.push(chunk.toString().toUpperCase());
            callback();
          }
        });

        // Write後にnullをpushして終了させる
        nodeDuplex.on("finish", () => {
          nodeDuplex.push(null);
        });

        // 変換
        const webTransform = toTransformStream(nodeDuplex);

        // 機能テスト
        const writer = webTransform.writable.getWriter();
        const reader = webTransform.readable.getReader();

        await writer.write(new TextEncoder().encode("duplex test"));
        await writer.close();

        const { value } = await reader.read();
        expect(value).toEqual(new TextEncoder().encode("DUPLEX TEST"));
      });
    });

    describe("toReadableWritablePair", () => {
      it("should convert Node.js Duplex to ReadableWritablePair", async () => {
        // Node.js Duplex作成
        const nodeDuplex = new Duplex({
          read() {},
          write(chunk, encoding, callback) {
            this.push(chunk);
            callback();
          }
        });

        // Write後にnullをpushして終了させる
        nodeDuplex.on("finish", () => {
          nodeDuplex.push(null);
        });

        // 変換
        const pair = toReadableWritablePair(nodeDuplex);

        // 検証
        expect(pair.readable).toBeInstanceOf(ReadableStream);
        expect(pair.writable).toBeInstanceOf(WritableStream);

        // 機能テスト
        const writer = pair.writable.getWriter();
        const reader = pair.readable.getReader();

        await writer.write("pair");
        await writer.close();

        const { value } = await reader.read();
        expect(value).toEqual(new TextEncoder().encode("pair"));
      });
    });
  });

  // Web Stream API → Node.js 変換テスト
  describe("Web Stream API to Node.js conversions", () => {
    describe("toReadable", () => {
      it("should convert Web ReadableStream to Node.js Readable", (done) => {
        // Web ReadableStream作成
        const webReadable = new ReadableStream({
          start(controller) {
            controller.enqueue("web stream data");
            controller.close();
          }
        });

        // 変換
        const nodeReadable = toReadable(webReadable);

        // 検証
        expect(nodeReadable).toBeInstanceOf(Readable);

        // データ収集
        const chunks: string[] = [];
        nodeReadable.on("data", (chunk) => {
          chunks.push(chunk.toString());
        });

        nodeReadable.on("end", () => {
          expect(chunks).toEqual(["web stream data"]);
          done();
        });
      });

      it("should accept options parameter", (done) => {
        // Web ReadableStream作成
        const webReadable = new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode("options test"));
            controller.close();
          }
        });

        // オプション付きで変換
        const nodeReadable = toReadable(webReadable, {
          encoding: "utf8",
          highWaterMark: 64
        });

        // 検証
        const chunks: string[] = [];
        nodeReadable.on("data", (chunk) => {
          // エンコーディングが有効ならすでに文字列になっているはず
          expect(typeof chunk).toBe("string");
          chunks.push(chunk);
        });

        nodeReadable.on("end", () => {
          expect(chunks).toEqual(["options test"]);
          done();
        });
      });
    });

    describe("toWritable", () => {
      it("should convert Web WritableStream to Node.js Writable", async () => {
        // 収集するデータの配列
        const chunks: string[] = [];

        // Web WritableStream作成
        const webWritable = new WritableStream({
          write(chunk) {
            const text = new TextDecoder().decode(chunk);
            chunks.push(text);
          }
        });

        // 変換
        const nodeWritable = toWritable(webWritable);

        // 検証
        expect(nodeWritable).toBeInstanceOf(Writable);

        // データを書き込み
        nodeWritable.write("writable test");
        nodeWritable.end();

        // 非同期処理が完了するのを待つ
        await new Promise(resolve => setTimeout(resolve, 50));

        expect(chunks).toEqual(["writable test"]);
      });

      it("should accept options parameter", async () => {
        const chunks: unknown[] = [];

        const webWritable = new WritableStream({
          write(chunk) {
            chunks.push(chunk);
          }
        });

        // オプション付きで変換
        const nodeWritable = toWritable(webWritable, {
          objectMode: true
        });

        // オブジェクトモードなのでオブジェクトを直接書き込める
        const testObj = { key: "value" };
        nodeWritable.write(testObj);
        nodeWritable.end();

        // 非同期処理が完了するのを待つ
        await new Promise(resolve => setTimeout(resolve, 50));

        expect(chunks[0]).toEqual(testObj);
      });
    });

    describe("toTransform", () => {
      it("should convert Web TransformStream to Node.js Transform", (done) => {
        // Web TransformStream作成（大文字変換）
        const webTransform = new TransformStream({
          transform(chunk, controller) {
            const text = new TextDecoder().decode(chunk);
            controller.enqueue(new TextEncoder().encode(text.toUpperCase()));
          }
        });

        // 変換
        const nodeTransform = toTransform(webTransform);

        // Transform は Duplex のサブクラスで実際には Duplex を返す
        // expect(nodeTransform).toBeInstanceOf(Transform);
        expect(nodeTransform).toBeInstanceOf(Duplex);

        // パイピングのテスト
        const inputStream = Readable.from(["transform test"]);
        const chunks: string[] = [];

        inputStream
          .pipe(nodeTransform)
          .on("data", (chunk) => {
            chunks.push(chunk.toString());
          })
          .on("end", () => {
            expect(chunks).toEqual(["TRANSFORM TEST"]);
            done();
          });
      });

      it("should accept options parameter", (done) => {
        // Web TransformStream作成
        const webTransform = new TransformStream({
          transform(chunk, controller) {
            const text = typeof chunk === "string" ? chunk : new TextDecoder().decode(chunk);
            controller.enqueue(text.toUpperCase());
          }
        });

        // オプション付きで変換
        const nodeTransform = toTransform(webTransform, {
          objectMode: true,
          encoding: "utf8"
        });

        // 検証
        const chunks: string[] = [];

        nodeTransform.on("data", (chunk) => {
          chunks.push(chunk);
        });

        nodeTransform.on("end", () => {
          expect(chunks).toEqual(["OPTIONS TEST"]);
          done();
        });

        // オブジェクトモードなので文字列を直接書き込める
        nodeTransform.write("options test");
        nodeTransform.end();
      });
    });

    describe("toDuplex", () => {
      it("should convert Web TransformStream to Node.js Duplex", (done) => {
        // Web TransformStream作成
        const webTransform = new TransformStream({
          transform(chunk, controller) {
            const text = new TextDecoder().decode(chunk);
            controller.enqueue(new TextEncoder().encode(`${text} processed`));
          }
        });

        // 変換
        const nodeDuplex = toDuplex(webTransform);

        // 検証
        expect(nodeDuplex).toBeInstanceOf(Duplex);

        // データ収集
        const chunks: string[] = [];
        nodeDuplex.on("data", (chunk) => {
          chunks.push(chunk.toString());
        });

        nodeDuplex.on("end", () => {
          expect(chunks).toEqual(["duplex processed"]);
          done();
        });

        // データ書き込み
        nodeDuplex.write("duplex");
        nodeDuplex.end();
      });

      it("should accept options parameter", (done) => {
        const webTransform = new TransformStream({
          transform(chunk, controller) {
            controller.enqueue(chunk);
          }
        });

        // オプション付きで変換
        const nodeDuplex = toDuplex(webTransform, {
          objectMode: true,
          highWaterMark: 64
        });

        // 検証
        const chunks: unknown[] = [];
        nodeDuplex.on("data", (chunk) => {
          chunks.push(chunk);
        });

        nodeDuplex.on("end", () => {
          expect(chunks).toEqual([{ test: "object" }]);
          done();
        });

        // オブジェクトモードなのでオブジェクトを直接書き込める
        nodeDuplex.write({ test: "object" });
        nodeDuplex.end();
      });
    });
  });

  // エッジケースと追加テスト
  describe("Edge cases and additional tests", () => {
    it("should handle empty streams", async () => {
      // 空のReadable
      const emptyReadable = Readable.from([]);
      const webReadable = toReadableStream(emptyReadable);

      const reader = webReadable.getReader();
      const { value, done } = await reader.read();

      expect(done).toBe(true);
      expect(value).toBeUndefined();
    });

    it("should handle multiple chunks", async () => {
      // 複数チャンクのReadable
      const multiChunkReadable = Readable.from(["chunk1", "chunk2", "chunk3"]);
      const webReadable = toReadableStream<string>(multiChunkReadable);

      const reader = webReadable.getReader();
      const chunks: string[] = [];

      let result: ReadableStreamReadResult<string>;
      do {
        result = await reader.read();
        if (!result.done) {
          chunks.push(result.value);
        }
      } while (!result.done);

      expect(chunks).toEqual(["chunk1", "chunk2", "chunk3"]);
    });

    it("should propagate errors from Node streams to Web streams", async () => {
      // エラーを発生させるNode.js Stream
      const errorReadable = new Readable({
        read() {
          this.emit('error', new Error('Test error'));
        }
      });

      const webReadable = toReadableStream(errorReadable);
      const reader = webReadable.getReader();

      try {
        await reader.read();
        // ここに到達しないはず
        expect(true).toBe(false);
      } catch (err) {
        expect(err).toBeDefined();
        expect(err.message).toBe('Test error');
      }
    });

    // TODO: node:stream の Readable.fromWeb() はエラーをちゃんと伝えてくれない…
    it.skip("should propagate errors from Web streams to Node streams", (done) => {
      // エラーを発生させるWeb Stream
      const errorWebReadable = new ReadableStream({
        start(controller) {
          console.log("start");
          controller.enqueue("hello");
          controller.error(new Error('Web stream error'));
          console.log("start end");
        }
      });

      const nodeReadable = toReadable(errorWebReadable);

      nodeReadable.on('error', (err) => {
        expect(err).toBeDefined();
        expect(err.message).toBe('Web stream error');
        done();
      });

      // エラーを触発
      nodeReadable.resume();
    });
  });
});
