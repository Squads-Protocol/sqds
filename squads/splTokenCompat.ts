import {
  Account,
  ACCOUNT_SIZE,
  AccountLayout,
  AccountState,
  MULTISIG_SIZE,
  TOKEN_PROGRAM_ID,
  TokenAccountNotFoundError,
  TokenError,
  TokenInvalidAccountOwnerError,
  TokenInvalidAccountSizeError,
} from "@solana/spl-token";
import {
  AccountInfo,
  Commitment,
  Connection,
  PublicKey,
} from "@solana/web3.js";

/**
 *
 * This file contains code from the solana-labs/solana-program-library repo.
 * It includes functions and types not currently available in the published @solana/spl-token package (0.2.0).
 *
 */

/** Thrown if a program state account is not a valid Account */
export class TokenInvalidAccountError extends TokenError {
  name = "TokenInvalidAccountError";
}

export enum AccountType {
  Uninitialized,
  Mint,
  Account,
}
export const ACCOUNT_TYPE_SIZE = 1;

/**
 * Retrieve information about multiple token accounts in a single RPC call
 *
 * @param connection Connection to use
 * @param addresses  Token accounts
 * @param commitment Desired level of commitment for querying the state
 * @param programId  SPL Token program account
 *
 * @return Token account information
 */
export async function getMultipleAccounts(
  connection: Connection,
  addresses: PublicKey[],
  commitment?: Commitment,
  programId = TOKEN_PROGRAM_ID
): Promise<Account[]> {
  const infos = await connection.getMultipleAccountsInfo(addresses, commitment);
  const accounts = [];
  for (let i = 0; i < infos.length; i++) {
    const account = unpackAccount(infos[i], addresses[i], programId);
    accounts.push(account);
  }
  return accounts;
}

function unpackAccount(
  info: AccountInfo<Buffer> | null,
  address: PublicKey,
  programId: PublicKey
) {
  if (!info) throw new TokenAccountNotFoundError();
  if (!info.owner.equals(programId)) throw new TokenInvalidAccountOwnerError();
  if (info.data.length < ACCOUNT_SIZE) throw new TokenInvalidAccountSizeError();

  const rawAccount = AccountLayout.decode(info.data.slice(0, ACCOUNT_SIZE));
  let tlvData = Buffer.alloc(0);
  if (info.data.length > ACCOUNT_SIZE) {
    if (info.data.length === MULTISIG_SIZE)
      throw new TokenInvalidAccountSizeError();
    if (info.data[ACCOUNT_SIZE] != AccountType.Account)
      throw new TokenInvalidAccountError();
    tlvData = info.data.slice(ACCOUNT_SIZE + ACCOUNT_TYPE_SIZE);
  }

  return {
    address,
    mint: rawAccount.mint,
    owner: rawAccount.owner,
    amount: rawAccount.amount,
    delegate: rawAccount.delegateOption ? rawAccount.delegate : null,
    delegatedAmount: rawAccount.delegatedAmount,
    isInitialized: rawAccount.state !== AccountState.Uninitialized,
    isFrozen: rawAccount.state === AccountState.Frozen,
    isNative: !!rawAccount.isNativeOption,
    rentExemptReserve: rawAccount.isNativeOption ? rawAccount.isNative : null,
    closeAuthority: rawAccount.closeAuthorityOption
      ? rawAccount.closeAuthority
      : null,
    tlvData,
  };
}
