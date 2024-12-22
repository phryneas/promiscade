export type Cade<T> =
  | (ReadableStreamReadValueResult<T> & { next: Promiscade<T> })
  | ReadableStreamReadDoneResult<undefined>;
export type Promiscade<T> = Promise<Cade<T>>;

export function streamToPromiscade<T>(
  stream: ReadableStream<T>
): Promiscade<T> {
  const reader = stream.getReader();
  return (function cade(): Promiscade<T> {
    return new Promise<Cade<T>>((resolve, reject) =>
      reader.read().then((value) => {
        resolve(
          value.done
            ? { done: true }
            : {
                ...value,
                next: cade(),
              }
        );
      }, reject)
    );
  })();
}

export function promiscadeToReadableStream<T>(
  promiscade: Promiscade<T>
): ReadableStream<T> {
  return new ReadableStream<T>({
    start(controller) {
      const onError = controller.error.bind(controller);
      promiscade.then(function handle(cade) {
        if (cade.done) {
          controller.close();
        } else {
          controller.enqueue(cade.value);
          cade.next.then(handle, onError);
        }
      }, onError);
    },
  });
}
