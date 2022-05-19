import {
  Layout as AbstractLayout,
  Structure,
  uint8ArrayToBuffer,
} from "@solana/buffer-layout";
import { BN } from "bn.js";
import { Squad, SquadsAccountType } from "./accounts";
import { PublicKey } from "@solana/web3.js";
const Layout = require("@solana/buffer-layout");

declare module "@solana/buffer-layout" {
  let fixedUtf8: (length: number, property?: string) => FixedLengthUTF8;
  let u64: (property?: string) => U64;
  let i64: (property?: string) => I64;
  let pubkey: (property?: string) => Pubkey;
  let bool: (property?: string) => ByteBoolean;
}

class FixedLengthUTF8 extends AbstractLayout<string> {
  constructor(length: number, property?: string) {
    super(length, property);
  }
  /** @override */
  decode(b: Uint8Array, offset: number = 0): string {
    return uint8ArrayToBuffer(b)
      .slice(offset, offset + this.span)
      .toString("utf-8");
  }
  /** @override */
  encode(src: string, b: Uint8Array, offset: number = 0): number {
    const srcb = Buffer.from(src, "utf8");
    const span = srcb.length;
    if (this.span < span) {
      throw new RangeError("text length exceeds intended span");
    }
    if (this.span + offset > b.length) {
      throw new RangeError(
        `encoding overruns Buffer (${
          this.property ?? "(unnamed)"
        }: FixedLengthUTF8)`
      );
    }

    srcb.copy(uint8ArrayToBuffer(b), offset);
    return span;
  }
}

Layout.fixedUtf8 = (length, property?) => new FixedLengthUTF8(length, property);

class U64 extends AbstractLayout<BN> {
  constructor(property?: string) {
    super(8, property);
  }
  /** @override */
  decode(b: Uint8Array, offset: number = 0): BN {
    const buffer = uint8ArrayToBuffer(b);
    return new BN(buffer.slice(offset, offset + this.span), "le");
  }
  /** @override */
  encode(src: BN, b: Uint8Array, offset: number = 0): number {
    if (src.isNeg()) {
      throw new RangeError(
        `BN with negative value ${src.toString()} cannot be encoded as u64`
      );
    }
    if (this.span + offset > b.length) {
      throw new RangeError(
        `encoding overruns Buffer (${this.property ?? "(unnamed)"}: U64)`
      );
    }
    const srcb = src.toArrayLike(Buffer, "le", this.span);
    srcb.copy(uint8ArrayToBuffer(b), offset);
    return this.span;
  }
}

Layout.u64 = (property?) => new U64(property);

class I64 extends AbstractLayout<BN> {
  constructor(property?: string) {
    super(8, property);
  }
  /** @override */
  decode(b: Uint8Array, offset: number = 0): BN {
    const buffer = uint8ArrayToBuffer(b);
    return new BN(buffer.slice(offset, offset + this.span), "le").fromTwos(
      this.span * 8
    );
  }
  /** @override */
  encode(src: BN, b: Uint8Array, offset: number = 0): number {
    if (this.span + offset > b.length) {
      throw new RangeError(
        `encoding overruns Buffer (${this.property ?? "(unnamed)"}: I64)`
      );
    }
    const srcb = src.toTwos(64).toArrayLike(Buffer, "le", this.span);
    srcb.copy(uint8ArrayToBuffer(b), offset);
    return this.span;
  }
}

Layout.i64 = (property?) => new I64(property);

class ByteBoolean extends AbstractLayout<boolean> {
  constructor(property?: string) {
    super(1, property);
  }
  /** @override */
  decode(b: Uint8Array, offset: number = 0): boolean {
    const buffer = uint8ArrayToBuffer(b);
    return Boolean(buffer.slice(offset, offset + this.span).readUint8());
  }
  /** @override */
  encode(src: boolean, b: Uint8Array, offset: number = 0): number {
    if (this.span + offset > b.length) {
      throw new RangeError(
        `encoding overruns Buffer (${
          this.property ?? "(unnamed)"
        }: ByteBoolean)`
      );
    }
    uint8ArrayToBuffer(b).writeUInt8(Number(src), offset);
    return this.span;
  }
}

Layout.bool = (property?) => new ByteBoolean(property);

class Pubkey extends AbstractLayout<PublicKey> {
  constructor(property?: string) {
    super(32, property);
  }
  /** @override */
  decode(b: Uint8Array, offset: number = 0): PublicKey {
    const buffer = uint8ArrayToBuffer(b);
    return new PublicKey(buffer.slice(offset, offset + this.span));
  }
  /** @override */
  encode(src: PublicKey, b: Uint8Array, offset: number = 0): number {
    if (this.span + offset > b.length) {
      throw new RangeError(
        `encoding overruns Buffer (${this.property ?? "(unnamed)"}: Pubkey)`
      );
    }
    const srcb = src.toBuffer();
    srcb.copy(uint8ArrayToBuffer(b), offset);
    return this.span;
  }
}

Layout.pubkey = (property?) => new Pubkey(property);

export const SquadsSchema = new Map<SquadsAccountType, Structure<any>>([
  [
    Squad,
    Layout.struct([
      Layout.bool("isInitialized"),
      Layout.bool("open"),
      Layout.bool("emergencyLock"),
      Layout.u8("allocationType"),
      Layout.u8("voteSupport"),
      Layout.u8("voteQuorum"),
      Layout.u8("coreThreshold"),
      Layout.fixedUtf8(24, "squadName"),
      Layout.fixedUtf8(36, "description"),
      Layout.fixedUtf8(6, "token"),
      Layout.seq(Layout.u8(), 5), // future settings placeholders
      Layout.pubkey("admin"),
      Layout.pubkey("mint"),
      Layout.pubkey("solAccount"),
      Layout.seq(Layout.seq(Layout.u8(), 32), 5), // future address placeholders
      Layout.u32("proposalNonce"),
      Layout.i64("createdOn"),
      Layout.u32(), // members length (redundant)
      Layout.seq(Layout.u8(), 9604), // skipping members for now,
      Layout.fixedUtf8(10, "randomId"),
      Layout.u32("childIndex"),
      Layout.u32("memberLockIndex"),
      Layout.seq(Layout.u64(), 32), // reserved
    ]),
  ],
]);
