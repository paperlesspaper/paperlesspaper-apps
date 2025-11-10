declare module "hypher" {
  interface HypherPattern {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  }

  class Hypher {
    constructor(patterns: HypherPattern);
    hyphenate(word: string): string[];
  }

  export = Hypher;
}

declare module "hyphenation.de" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const patterns: any;
  export = patterns;
}
