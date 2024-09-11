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
  const ha = a >> 32n;
  const hb = b >> 32n;
  const la = BigInt.asUintN(32, a);
  const lb = BigInt.asUintN(32, b);
  const rh = BigInt.asUintN(64, ha * hb);
  const rm0 = BigInt.asUintN(64, ha * lb);
  const rm1 = BigInt.asUintN(64, hb * la);
  const rl = BigInt.asUintN(64, la * lb);
  const t = BigInt.asUintN(64, rl + (rm0 << 32n));
  let c = t < rl ? 1n : 0n;
  const lo = BigInt.asUintN(64, t + (rm1 << 32n));
  c += lo < t ? 1n : 0n;
  const hi = BigInt.asUintN(64, (rh + (rm0 >> 32n) + (rm1 >> 32n) + c));
  if (RAPIDHASH_PROTECTED) {
    a ^= lo;
    b ^= hi;
    return [BigInt.asUintN(64, a), BigInt.asUintN(64, b)];
  }
  return [BigInt.asUintN(64, lo), BigInt.asUintN(64, hi)];
}

function mix(a: bigint, b:bigint): bigint {
  [a, b] = mum(a, b)
  return BigInt.asUintN(64, a ^ b);
}

function read64(p: Buffer, offset: number): bigint {
  return p.readBigUInt64LE(offset);
}

function read32(p: Buffer, offset: number): bigint {
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
      let pp = p;
      let see1 = seed
      let see2 = seed
      do {
        seed = mix(read64(pp, 0) ^ secret[0], read64(pp, 8) ^ seed);
        see1 = mix(read64(pp, 16) ^ secret[1], read64(pp, 24) ^ see1);
        see2 = mix(read64(pp, 32) ^ secret[2], read64(pp, 40) ^ see2);
        pp = pp.slice(48)
        i -= 48;
      } while (i >= 48);
      seed ^= see1 ^ see2;
      a = read64(p.slice(i - 16 - pp.length), 0)
      b = read64(p.slice(i - 8 - pp.length), 0)
    }
    if (i > 16) {
      seed = mix(read64(p, 0) ^ secret[2], read64(p, 8) ^ seed ^ secret[1]);
      if (i > 32) {
        seed = mix(read64(p, 16) ^ secret[2], read64(p, 24) ^ seed);
      }
      a = read64(p.slice(i - 16), 0);
      b = read64(p.slice(i - 8), 0);
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

export function hash(k: string | Uint8Array, l: number): bigint {
  return hashWithSeed(k, l, RAPID_SEED);
}
