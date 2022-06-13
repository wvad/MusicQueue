enum QueueRepeatMode {
  NoRepeat = "NO-REPEAT",
  RepeatOne = "REPEAT-ONE",
  RepeatAll = "REPEAT-ALL",
  RepeatAllIndex = "REPEAT-ALL-INDEX"
}

const { Object, Number, Array, RangeError } = globalThis;
const { isNaN, isSafeInteger } = Number;
const { toStringTag } = Symbol;
const { construct } = Reflect;
const { ceil } = Math;

class SafeObject {}
Object.freeze(Object.defineProperties(SafeObject.prototype, {
  ...Object.getOwnPropertyDescriptors(Object.prototype),
  constructor: {
    // @ts-ignore
    value: SafeObject
  }
}));
Object.freeze(SafeObject);

class SafeArray extends SafeObject {
  constructor(...args: unknown[]) {
    super();
    const { length } = args;
    if (length) {
      if (1 < length) args.length = 1;
      args[0] = Number(args[0]);
    }
    return construct(Array, args, new.target);
  }
};
Object.freeze(Object.defineProperties(SafeArray.prototype, {
  ...Object.getOwnPropertyDescriptors(Array.prototype),
  constructor: {
    // @ts-ignore
    value: SafeArray
  }
}));
Object.freeze(Object.defineProperties(SafeArray, {
  ...Object.getOwnPropertyDescriptors(Array),
  prototype: {
    value: SafeArray.prototype
  }
}));
Object.freeze(SafeArray);

class Queue<T> {
  #data: T[] = new SafeArray() as T[];
  #repeatMode = QueueRepeatMode.NoRepeat;
  public get size(): number {
    return this.#data.length;
  }
  public get current(): T | null {
    return this.#data[0] ?? null;
  }
  public get currentIndex(): number {
    // ...
  }
  public get repeatMode(): QueueRepeatMode {
    return this.#repeatMode;
  }
  public set repeatMode(mode: QueueRepeatMode) {
    // ...
  }
  public at(index: number): T | null {
    if (!isSafeInteger(index)) return null;
    return this.#data.at(index) ?? null;
  }
  public shift({ times = 1, ignoreRepetition = true }: { times?: number, ignoreRepetition?: boolean } = {}): void {
    if (this.#repeatMode === QueueRepeatMode.RepeatOne && !ignoreRepetition) return;
    if (!isSafeInteger(times)) throw new Error();
    if (0 < times) throw new Error();
    times %= this.#data.length;
    // ...
  }
  public removeAt(index: number): T | null {
    const data = this.#data;
    return (isSafeInteger(index) && 0 < index && index < data.length) ? (data.splice(index, 1)[0] ?? null) : null;
  }
  public removeMulti(...indices: number[]): T[] {
    const removed: T[] = [];
    const data = this.#data;
    const { length } = data;
    indices
    .filter(index => isSafeInteger(index) && 0 < index && index < length)
    .sort((a, b) => a - b)
    .forEach((v, i) => removed.push(data.splice(v - i, 1)[0]!));
    return removed;
  }
  public removeRange(begin: number, end: number): T[] {
    if (typeof begin != 'number' || isNaN(begin))
      throw new RangeError('Invalid Argument. "begin" must be a number');
    if (typeof end != 'number' || isNaN(end))
      throw new RangeError('Invalid Argument. "end" must be a number');
    begin = begin         < 1     ? 1:
            4_294_967_295 < begin ? 4_294_967_295:
                                    ceil(begin);
    end   = end           < 1     ? 1:
            4_294_967_295 < end   ? 4_294_967_295:
                                    ceil(end);
    if (begin === end) return []
    if (end < begin) return this.#data.splice(end, begin - end);
    return this.#data.splice(begin, end - begin);
  }
  public prepend(data: T): void {
    this.#data.unshift(data);
  }
  public append(data: T): void {
    this.#data.push(data);
  }
  public clear(): void {
    this.#data.length = 0;
  }
  public shuffle(): void {
    // ...
  }
  public toArray(): T[] {
    return this.#data.slice();
  }
  public remove(filter: (a: T) => boolean): T[] {
    // ...
  }
  public toString(): string {
    return `[object ${this[toStringTag]}(${this.size})]`;
  }
  public get [toStringTag](): string {
    return 'Queue';
  }
}

Reflect.deleteProperty(Queue.prototype, toStringTag);
Reflect.set(Queue.prototype, toStringTag, 'Queue');

Object.freeze(Queue);
Object.freeze(Queue.prototype);

module.exports = exports = Queue;
