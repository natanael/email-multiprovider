type CallbackFn<T> = (err: Error | null, data: T) => void;

// Forgot for a sec about the utils.promisify in node, but I kinda like mine now :)
// True true, real life I would use the standard
export function promisify<T>(callbackFn: (cb: CallbackFn<T>) => void): Promise<T> {
  return new Promise((resolve, reject) => callbackFn((err: Error | null, data: T) => err ? reject(err) : resolve(data)));
}