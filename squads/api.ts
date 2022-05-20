import {
  AccountInfo,
  Commitment,
  Connection,
  PublicKey,
} from "@solana/web3.js";
import { SquadsSchema } from "./schema";
import { Squad } from "./accounts";

export const getSquads = async (
  programId: PublicKey,
  connection: Connection,
  squads: PublicKey[],
  commitment?: Commitment
): Promise<Squad[]> => {
  const layout = SquadsSchema.get(Squad);
  if (!layout) throw new Error("Missing schema entry for Squad!");

  const squadItems: Squad[] = [];
  const accounts = await connection.getMultipleAccountsInfo(squads, commitment);
  for (let i = 0; i < accounts.length; i++) {
    const accountInfo: AccountInfo<Buffer> | null = accounts[i];
    const squad: PublicKey = squads[i];
    if (accountInfo === null) {
      throw new Error(
        `Account ${squads[i]
          .toString()
          .slice(0, 6)}... not found when fetching Squads`
      );
    }
    const squadInstance: Squad = new Squad({
      ...layout.decode(accountInfo.data),
      publicKey: squad,
    });
    // NOTE: This initialization will make additional queries for each Squad
    // it can be optimized further by creating a bulk init method etc.
    await squadInstance.init(connection);
    squadItems.push(squadInstance);
  }
  return squadItems;
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
