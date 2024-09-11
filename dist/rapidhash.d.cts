declare function hashWithSeed(k: string | Uint8Array, l: number, seed: bigint): bigint;
declare function hash(k: string | Uint8Array, l: number): bigint;

export { hash, hashWithSeed };
