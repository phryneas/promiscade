# promiscade

`promiscade` provides utilities to convert  `ReadableStream` to cascading of `Promise` objects, and vice versa.

## Installation

```sh
npm install promiscade
```

## Usage

### Converting `ReadableStream` to `Promiscade`

```ts
import { streamToPromiscade } from "promiscade";

const stream = new ReadableStream<string>({
  start(controller) {
    controller.enqueue("a");
    controller.enqueue("b");
    controller.enqueue("c");
    controller.close();
  },
});

const promiscade = streamToPromiscade(stream);
```

### Converting `Promiscade` to `ReadableStream`

```ts
import { promiscadeToReadableStream } from "promiscade";

const cade = Promise.resolve({
  value: "a",
  done: false,
  next: Promise.resolve({
    value: "b",
    done: false,
    next: Promise.resolve({
      value: "c",
      done: false,
      next: Promise.resolve({
        done: true,
      }),
    }),
  }),
});

const stream = promiscadeToReadableStream(cade);
```

## License

This project is licensed under the MIT License. See the [LICENSE.md](LICENSE.md) file for details.
