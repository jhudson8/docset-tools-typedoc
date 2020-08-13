/**
 * This is a ntested module
 * @param ddd the param value
 */
export function nestedFunction(ddd: string): string {
  return "ddd";
}

/**
 * This is the Bar interface
 */
export interface Bar {
  /**
   * This is the ccc function
   */
  ccc: () => string;
}

/**
 * This is the Foo class
 */
export class Foo implements Bar {
  ccc = (): string => {
    return "ccc";
  };
}
