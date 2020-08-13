/**
 * A cool function
 * @param bar some param
 * ```
 * // example stuff
 * const bar = foo();
 * ```
 */
export function foo(bar: string): string {
  return "foo";
}

/**
 * This is the default function
 */
export default function bar(options: {
  /** an abc options */
  abc: string;
}): string {
  return "bar";
}

export * from "./nested/amodule";
