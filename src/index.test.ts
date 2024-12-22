import { test } from "node:test";
import assert from "node:assert";
import { type Cade, promiscadeToReadableStream, streamToPromiscade } from "./index.ts";

test("ReadableStream -> Promiscade", async () => {
  const stream = new ReadableStream<string>({
    start(controller) {
      controller.enqueue("a");
      controller.enqueue("b");
      controller.enqueue("c");
      controller.close();
    },
  });
  let cade = streamToPromiscade(stream);
  {
    const value = await cade;
    assert.ok(!value.done);
    assert.equal(value.value, "a");
    cade = value.next;
  }
  {
    const value = await cade;
    assert.ok(value.done == false);
    assert.equal(value.value, "b");
    cade = value.next;
  }
  {
    const value = await cade;
    assert.ok(value.done == false);
    assert.equal(value.value, "c");
    cade = value.next;
  }
  {
    const value = await cade;
    assert.ok(value.done == true);
    assert.equal(value.value, undefined);
  }
});

test("Promiscade -> ReadableStream", async () => {
  const cade = Promise.resolve<Cade<string>>({
    value: "a",
    done: false,
    next: Promise.resolve<Cade<string>>({
      value: "b",
      done: false,
      next: Promise.resolve<Cade<string>>({
        value: "c",
        done: false,
        next: Promise.resolve<Cade<string>>({
          done: true,
        }),
      }),
    }),
  });
  const stream = promiscadeToReadableStream(cade)
  const reader = stream.getReader()
  {
    const value = await reader.read()
    assert.ok(value.done == false)
    assert.equal(value.value, "a")
  }
  {
    const value = await reader.read()
    assert.ok(value.done == false)
    assert.equal(value.value, "b")
  }
  {
    const value = await reader.read()
    assert.ok(value.done == false)
    assert.equal(value.value, "c")
  }
  {
    const value = await reader.read()
    assert.ok(value.done == true)
    assert.equal(value.value, undefined)
  }
});
