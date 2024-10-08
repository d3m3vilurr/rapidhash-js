const RAPID_SEED = BigInt('0xbdd89aa982704029');
const RAPID_SECRET = [
  BigInt('0x2d358dccaa6c78a5'),
  BigInt('0x8bb84b93962eacc9'),
  BigInt('0x4b33a62ed433d4a3'),
];

const RAPIDHASH_PROTECTED = false

function mum(a: bigint, b: bigint): [bigint, bigint] {
  a = BigInt.asUintN(64, a);
  b = BigInt.asUintN(64, b);
  const r = BigInt.asUintN(128, a * b);
  if (RAPIDHASH_PROTECTED) {
    return [a ^ BigInt.asUintN(64, r), b ^ BigInt.asUintN(64, r >> 64n)];
  } else {
    return [BigInt.asUintN(64, r), BigInt.asUintN(64, r >> 64n)];
  }
}

function mix(a: bigint, b:bigint): bigint {
  [a, b] = mum(a, b)
  return BigInt.asUintN(64, a ^ b);
}

function read64(p: Buffer, offset: number = 0): bigint {
  return p.readBigUInt64LE(offset);
}

function read32(p: Buffer, offset: number = 0): bigint {
  return BigInt(p.readUInt32LE(offset));
}

function readSmall(p: Uint8Array, k: number): bigint {
  return (
    BigInt.asUintN(64, BigInt(p[0]) << 56n) |
    BigInt.asUintN(64, BigInt(p[k >> 1]) << 32n) |
    BigInt(p[k - 1])
  );
}

function hashInternal(
  key: Uint8Array,
  l: number,
  seed: bigint,
  secret: bigint[],
): bigint {
  const p = Buffer.from(key);
  let a: bigint = 0n;
  let b: bigint = 0n;
  seed ^= mix(seed ^ secret[0], secret[1]) ^ BigInt(l);
  if (l <= 16) {
    if (l >= 4) {
      a = (read32(p, 0) << 32n) | read32(p, l - 4);
      const delta = (l & 24) >> (l >> 3);
      b = read32(p, delta) << 32n | read32(p.slice(l - 4 - delta), 0);
    } else if (l > 0) {
      a = readSmall(p, l);
      b = 0n;
    } else {
      a = b = 0n;
    }
  } else {
    let i = l;
    if (i > 48) {
      let ii = 0;
      let see1 = seed
      let see2 = seed
      do {
        seed = mix(read64(p, ii) ^ secret[0], read64(p, ii + 8) ^ seed);
        see1 = mix(read64(p, ii + 16) ^ secret[1], read64(p, ii + 24) ^ see1);
        see2 = mix(read64(p, ii + 32) ^ secret[2], read64(p, ii + 40) ^ see2);
        i -= 48;
        ii += 48;
      } while (i >= 48);
      seed ^= see1 ^ see2;
      a = read64(p, ii + i - 16)
      b = read64(p, ii + i - 8)
    }
    if (i > 16) {
      seed = mix(read64(p, 0) ^ secret[2], read64(p, 8) ^ seed ^ secret[1]);
      if (i > 32) {
        seed = mix(read64(p, 16) ^ secret[2], read64(p, 24) ^ seed);
      }
      a = read64(p, i - 16);
      b = read64(p, i - 8);
    }
  }
  a ^= secret[1];
  b ^= seed;
  [a, b] = mum(a, b);
  return BigInt.asUintN(64, mix(a ^ secret[0] ^ BigInt(l), b ^ secret[1]));
}

export function hashWithSeed(
  k: string | Uint8Array,
  l: number,
  seed: bigint
): bigint {
  if (typeof(k) === 'string') {
    k = new TextEncoder().encode(k);
  }
  return hashInternal(k, l, seed, RAPID_SECRET)
}

export function hash(k: string | Uint8Array, l?: number): bigint {
  if (l === undefined) {
    l = k.length;
  }
  return hashWithSeed(k, l, RAPID_SEED);
}
