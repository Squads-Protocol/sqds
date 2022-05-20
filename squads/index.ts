import { Connection, PublicKey } from "@solana/web3.js";
import { SQUADS_PROGRAM_ID } from "./constants";
import { getSquad, getSquads } from "./api";
import { Squad } from "./accounts";

class Squads {
  connection: Connection;
  programId: PublicKey;
  constructor(args: { connection: Connection; programId?: PublicKey }) {
    this.connection = args.connection;
    this.programId = args.programId ?? SQUADS_PROGRAM_ID;
  }
  static mainnet() {
    return new Squads({
      connection: new Connection("https://api.mainnet-beta.solana.com"),
      programId: SQUADS_PROGRAM_ID,
    });
  }
  static devnet() {
    return new Squads({
      connection: new Connection("https://api.devnet.solana.com"),
      programId: SQUADS_PROGRAM_ID,
    });
  }
  static localnet() {
    return new Squads({
      connection: new Connection("http://localhost:8899"),
      programId: SQUADS_PROGRAM_ID,
    });
  }

  async getSquad(squad: PublicKey): Promise<Squad> {
    return await getSquad(this.connection, squad);
  }

  async getSquads(squads: PublicKey[]): Promise<Squad[]> {
    return await getSquads(this.programId, this.connection, squads);
  }
}

export default Squads;
