import { Squad, SquadsAccountType } from "./accounts";
import { Structure } from "@solana/buffer-layout";
import Layout from "./layout";

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
      Layout.pubkey("mintAccount"),
      Layout.pubkey("solAccount"),
      Layout.seq(Layout.seq(Layout.u8(), 32), 5), // future address placeholders
      Layout.u32("proposalNonce"),
      Layout.i64("rawCreatedOn"), // raw because this is later converted to DateTime
      Layout.u32("rawMembersByteLength"),
      Layout.u32(), // also members length from borsh (can be ignored)
      Layout.blob(9600, "rawMembers"),
      Layout.fixedUtf8(10, "randomId"),
      Layout.u32("childIndex"),
      Layout.u32("memberLockIndex"),
      Layout.seq(Layout.u64(), 32), // reserved
    ]),
  ],
]);
