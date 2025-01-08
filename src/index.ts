/**
 * The resolved value of a promise cascade, can cascade further
 */
export type Cade<T> =
  | (ReadableStreamReadValueResult<T> & { next: Promiscade<T> })
  | ReadableStreamReadDoneResult<undefined>;

/**
 * A cascading promise structure for stream processing
 */
export type Promiscade<T> = Promise<Cade<T>>;

/**
 * Converts a ReadableStream into a Promiscade structure
 */
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

/**
 * Converts a Promiscade into a ReadableStream
 */
export function promiscadeToReadableStream<T>(
  promiscade: Promiscade<T>
): ReadableStream<T> {
  return new ReadableStream<T>({
    start(controller) {
      const onError = controller.error.bind(controller);
      promiscade.then(function handle(cade) {
        try {
          if (cade.done) {
            controller.close();
          } else {
            controller.enqueue(cade.value);
            cade.next.then(handle, onError);
          }
        } catch {
          // the controller might already be closed by the consumer, don't error in that case
        }
      }, onError);
    },
  });
}
