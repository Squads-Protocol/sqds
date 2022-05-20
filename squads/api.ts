import {
  Commitment,
  Connection,
  GetProgramAccountsConfig,
  PublicKey,
} from "@solana/web3.js";
import { SquadsSchema } from "./schema";
import { Squad, SquadItem } from "./accounts";

export const getSquads = async (
  programId: PublicKey,
  connection: Connection,
  config?: GetProgramAccountsConfig
): Promise<SquadItem[]> => {
  const layout = SquadsSchema.get(Squad);
  if (!layout) throw new Error("Missing schema entry for Squad!");

  const mergedConfig = config
    ? { ...config, filters: [...config.filters, { dataSize: 10228 }] }
    : { filters: [{ dataSize: 10228 }] };
  const accounts = await connection.getProgramAccounts(programId, mergedConfig);
  return accounts.map((account) => ({
    account: layout.decode(account.account.data),
    pubkey: account.pubkey,
  }));
};

export const getSquad = async (
  connection: Connection,
  squad: PublicKey,
  commitment?: Commitment
): Promise<Squad> => {
  const layout = SquadsSchema.get(Squad);
  if (!layout) throw new Error("Missing schema entry for Squad!");

  const accountInfo = await connection.getAccountInfo(squad, commitment);
  const squadInstance: Squad = new Squad({
    ...layout.decode(accountInfo.data),
    publicKey: squad,
  });
  await squadInstance.init(connection);
  return squadInstance;
};
