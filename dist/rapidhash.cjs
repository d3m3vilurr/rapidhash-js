"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// rapidhash.ts
var rapidhash_exports = {};
__export(rapidhash_exports, {
  hash: () => hash,
  hashWithSeed: () => hashWithSeed
});
module.exports = __toCommonJS(rapidhash_exports);
var RAPID_SEED = BigInt("0xbdd89aa982704029");
var RAPID_SECRET = [
  BigInt("0x2d358dccaa6c78a5"),
  BigInt("0x8bb84b93962eacc9"),
  BigInt("0x4b33a62ed433d4a3")
];
var RAPIDHASH_PROTECTED = false;
function mum(a, b) {
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
  const hi = BigInt.asUintN(64, rh + (rm0 >> 32n) + (rm1 >> 32n) + c);
  if (RAPIDHASH_PROTECTED) {
    a ^= lo;
    b ^= hi;
    return [BigInt.asUintN(64, a), BigInt.asUintN(64, b)];
  }
  return [BigInt.asUintN(64, lo), BigInt.asUintN(64, hi)];
}
function mix(a, b) {
  [a, b] = mum(a, b);
  return BigInt.asUintN(64, a ^ b);
}
function read64(p, offset = 0) {
  return p.readBigUInt64LE(offset);
}
function read32(p, offset = 0) {
  return BigInt(p.readUInt32LE(offset));
}
function readSmall(p, k) {
  return BigInt.asUintN(64, BigInt(p[0]) << 56n) | BigInt.asUintN(64, BigInt(p[k >> 1]) << 32n) | BigInt(p[k - 1]);
}
function hashInternal(key, l, seed, secret) {
  const p = Buffer.from(key);
  let a = 0n;
  let b = 0n;
  seed ^= mix(seed ^ secret[0], secret[1]) ^ BigInt(l);
  if (l <= 16) {
    if (l >= 4) {
      a = read32(p, 0) << 32n | read32(p, l - 4);
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
      let see1 = seed;
      let see2 = seed;
      do {
        seed = mix(read64(p, ii) ^ secret[0], read64(p, ii + 8) ^ seed);
        see1 = mix(read64(p, ii + 16) ^ secret[1], read64(p, ii + 24) ^ see1);
        see2 = mix(read64(p, ii + 32) ^ secret[2], read64(p, ii + 40) ^ see2);
        i -= 48;
        ii += 48;
      } while (i >= 48);
      seed ^= see1 ^ see2;
      a = read64(p, ii + i - 16);
      b = read64(p, ii + i - 8);
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
function hashWithSeed(k, l, seed) {
  if (typeof k === "string") {
    k = new TextEncoder().encode(k);
  }
  return hashInternal(k, l, seed, RAPID_SECRET);
}
function hash(k, l) {
  if (l === void 0) {
    l = k.length;
  }
  return hashWithSeed(k, l, RAPID_SEED);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  hash,
  hashWithSeed
});
//# sourceMappingURL=rapidhash.cjs.map