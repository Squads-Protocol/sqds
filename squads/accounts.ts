import {
  Commitment,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import { Account as TokenAccount, getMint, Mint } from "@solana/spl-token";
import BN from "bn.js";
import { DateTime } from "luxon";
import { SQUAD_SOL_SEED } from "./constants";
import { getMultipleAccounts } from "./splTokenCompat";

export type SquadsAccountType = typeof Squad;

export enum SquadAllocationType {
  TeamCoordination = 1,
  MultiSig,
}

export class Squad {
  isInitialized: boolean;
  open: boolean;
  emergencyLock: boolean;
  allocationType: SquadAllocationType;
  voteSupport: number;
  voteQuorum: number;
  coreThreshold: number;
  squadName: string;
  description: string;
  token: string;
  admin: PublicKey;
  solAccount: PublicKey;
  mintAccount: PublicKey;
  mint?: Mint;
  proposalNonce: number;
  createdOn?: DateTime;
  private rawCreatedOn: BN;
  members?: SquadMember[];
  private rawMembers: Uint8Array;
  private rawMembersByteLength: number;
  solBalance?: number;
  publicKey: PublicKey;
  randomId: string;
  childIndex: number;
  memberLockIndex: number;
  constructor(args: {
    isInitialized: boolean;
    open: boolean;
    emergencyLock: boolean;
    allocationType: number;
    voteSupport: number;
    voteQuorum: number;
    coreThreshold: number;
    squadName: string;
    description: string;
    token: string;
    admin: PublicKey;
    solAccount: PublicKey;
    mintAccount: PublicKey;
    proposalNonce: number;
    rawCreatedOn: BN;
    rawMembers: Uint8Array;
    rawMembersByteLength: number;
    publicKey: PublicKey;
    randomId: string;
    childIndex: number;
    memberLockIndex: number;
  }) {
    this.isInitialized = args.isInitialized;
    this.open = args.open;
    this.emergencyLock = args.emergencyLock;
    if (args.allocationType <= 0 || args.allocationType > 2) {
      throw new Error(
        `Invalid allocationType for Squad: ${args.allocationType}. Must be 1 (Teams) or 2 (MultiSig)`
      );
    }
    this.allocationType = args.allocationType;
    this.voteSupport = args.voteSupport;
    this.voteQuorum = args.voteQuorum;
    this.coreThreshold = args.coreThreshold;
    this.squadName = args.squadName;
    this.description = args.description;
    this.token = args.token;
    this.admin = args.admin;
    this.solAccount = args.solAccount;
    this.mintAccount = args.mintAccount;
    this.proposalNonce = args.proposalNonce;
    this.rawCreatedOn = args.rawCreatedOn;
    this.rawMembers = args.rawMembers;
    this.rawMembersByteLength = args.rawMembersByteLength;
    this.publicKey = args.publicKey;
    this.randomId = args.randomId;
    this.childIndex = args.childIndex;
    this.memberLockIndex = args.memberLockIndex;
  }

  async _initMembers(
    connection: Connection,
    programId?: PublicKey,
    commitment?: Commitment
  ) {
    let members: SquadMember[] = [];
    if (this.rawMembersByteLength > 4) {
      const memberObjs = [];

      // Slice of the populated members array
      // Subtract 4 from the bytelength because it includes the length itself as u32 (4 bytes)
      const memberMap = this.rawMembers.slice(0, this.rawMembersByteLength - 4);
      for (let i = 0; i < memberMap.length; i += 64) {
        // Each member is serialized to two PublicKeys (32 bytes each)
        memberObjs.push(memberMap.slice(i, i + 64));
      }

      members = memberObjs.map((m) => {
        const mPubKey = new PublicKey(m.slice(0, 32));
        const mEquityKey = new PublicKey(m.slice(32));

        return new SquadMember({
          publicKey: mPubKey,
          tokenAccount: mEquityKey,
        });
      });

      if (this.allocationType === SquadAllocationType.TeamCoordination) {
        // Only need to deserialize token accounts and calculate voting power if this is a Teams-type Squad
        if (this.mint === undefined) {
          throw new Error(
            "Cannot initialize Squad members: mint account data has not been fetched"
          );
        }
        const mintSupply: bigint = this.mint.supply;
        const govTokens = await getMultipleAccounts(
          connection,
          members.map((m) => m.tokenAccount),
          commitment
        );
        members.forEach((member, idx) => {
          // Both mintSupply and tokens are type: bigint
          // so we need to adjust for precision in decimals manually (only integer division is possible w/ bigint)
          const tokens: bigint = govTokens[idx].amount;
          const precisionAdjustment = BigInt(1000);
          const scaleAdjustment = BigInt(100);
          const votingPower: number = parseFloat(
            (
              Number(
                (tokens * precisionAdjustment * scaleAdjustment) / mintSupply
              ) / Number(precisionAdjustment)
            ).toFixed(2)
          );

          member.tokenAccountData = govTokens[idx];
          member.tokens = tokens;
          member.votingPower = votingPower;
          member.core = votingPower > this.coreThreshold;
        });
      } else {
        // This is a MultiSig-type Squad, set truthy placeholder values to indicate
        // the members have been initialized
        members.forEach((member) => {
          member.tokens = BigInt(1);
          member.votingPower = 1;
          member.core = true;
        });
      }
    }

    // Fetch the Squad SOL account and store the balance on this instance
    const [squadSolAccount] = await PublicKey.findProgramAddress(
      [this.publicKey.toBytes(), Buffer.from(SQUAD_SOL_SEED)],
      programId
    );
    const solInfo: number = await connection.getBalance(
      squadSolAccount,
      commitment
    );

    // Set values on this instance
    this.createdOn = DateTime.fromSeconds(this.rawCreatedOn.toNumber());
    this.members = members;
    this.solBalance = solInfo / LAMPORTS_PER_SOL;
  }

  async _initMintAccount(connection: Connection, commitment?: Commitment) {
    if (this.allocationType === SquadAllocationType.TeamCoordination) {
      // Only need to fetch mint information if this is a Teams-type Squad
      this.mint = await getMint(connection, this.mintAccount, commitment);
    }
  }

  /**
   * Initializes the Squad instance by fetching additional data (e.g. Member Tokens, Mint) from the chain.
   * This function should be called right after deserialization.
   */
  async init(
    connection: Connection,
    programId?: PublicKey,
    commitment?: Commitment
  ) {
    await this._initMintAccount(connection, commitment);
    await this._initMembers(connection, programId, commitment);
  }

  hasMember(publicKey: PublicKey): boolean {
    return (
      this.members.find((member) => member.publicKey.equals(publicKey)) !==
      undefined
    );
  }
}

export class SquadMember {
  publicKey: PublicKey;
  tokenAccount: PublicKey;
  tokens: bigint;
  votingPower: number;
  core: boolean;
  tokenAccountData: TokenAccount;
  constructor(args: {
    publicKey: PublicKey;
    tokenAccount: PublicKey;
    tokens?: bigint;
    votingPower?: number;
    core?: boolean;
    tokenAccountData?: TokenAccount;
  }) {
    this.publicKey = args.publicKey;
    this.tokenAccount = args.tokenAccount;
    this.tokens = args.tokens ?? BigInt(0);
    this.votingPower = args.votingPower ?? 0;
    this.core = args.core ?? false;
    this.tokenAccountData = args.tokenAccountData;
  }
}
