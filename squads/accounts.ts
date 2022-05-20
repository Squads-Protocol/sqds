import {
  AccountInfo,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import { Account as SPLTokenAccount } from "@solana/spl-token";
import BN from "bn.js";
import { DateTime } from "luxon";
import { SQUAD_SOL_SEED, SQUADS_PROGRAM_ID } from "./constants";

export type SquadsAccountType = typeof Squad;

export interface TokenAccount {
  pubkey: PublicKey;
  account: AccountInfo<Buffer>;
  info: SPLTokenAccount;
}

export class Squad {
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
  mint: PublicKey;
  mintAccount?: any; // TODO: get the real type
  proposalNonce: number;
  createdOn?: DateTime;
  rawCreatedOn: BN;
  members?: SquadMember[];
  rawMembers: Uint8Array;
  rawMembersByteLength: number;
  solBalance?: BN;
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
    mint: PublicKey;
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
    this.allocationType = args.allocationType;
    this.voteSupport = args.voteSupport;
    this.voteQuorum = args.voteQuorum;
    this.coreThreshold = args.coreThreshold;
    this.squadName = args.squadName;
    this.description = args.description;
    this.token = args.token;
    this.admin = args.admin;
    this.solAccount = args.solAccount;
    this.mint = args.mint;
    this.proposalNonce = args.proposalNonce;
    this.rawCreatedOn = args.rawCreatedOn;
    this.rawMembers = args.rawMembers;
    this.rawMembersByteLength = args.rawMembersByteLength;
    this.publicKey = args.publicKey;
    this.randomId = args.randomId;
    this.childIndex = args.childIndex;
    this.memberLockIndex = args.memberLockIndex;
  }

  async _initMembers(connection: Connection) {
    let members: SquadMember[] = [];
    if (this.rawMembersByteLength > 4) {
      const memberObjs = [];
      const memberMap = this.rawMembers.slice(0, this.rawMembersByteLength - 4);
      // slice of the actual used members array
      for (let i = 0; i < memberMap.length; i += 64) {
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

      if (this.mintAccount === undefined) {
        throw new Error(
          "Cannot initialize Squad members: mintAccount data has not been fetched"
        );
      }
      // TODO: figure out TokenAccountParser behavior
      // const mintSupply = this.mintAccount; // clean this up, throw error if needed and undefined
      // const govTokens = await getMultipleGovernanceAccounts(
      //   connection,
      //   members.map((m) => m.tokenAccount)
      // );
      // members.forEach((member, idx) => {
      //   const tokens = govTokens[idx].info.amount.toNumber();
      //   const votingPower = parseFloat(
      //     (((tokens / mintSupply) * 1000) / 10).toFixed(2)
      //   );
      //
      //   member.tokenAccountData = govTokens[idx];
      //   member.tokens = tokens;
      //   member.votingPower = votingPower;
      //   member.core = votingPower > this.coreThreshold;
      // });
    }

    const createdTimeNum = this.rawCreatedOn.toNumber();
    const [squadSolAccount] = await PublicKey.findProgramAddress(
      [this.publicKey.toBytes(), Buffer.from(SQUAD_SOL_SEED)],
      SQUADS_PROGRAM_ID
    );
    const solInfo = await connection.getBalance(squadSolAccount!);

    // set values on instance
    this.createdOn = DateTime.fromSeconds(createdTimeNum);
    this.members = members;
    this.solBalance = solInfo / LAMPORTS_PER_SOL;
  }

  async _initMintAccount(connection: Connection) {
    // mint info
    const mintAccountInfo = await connection.getAccountInfo(this.mint);
    // TODO: figure out MintParser behavior
    // const mintAccount = MintParser(
    //   new PublicKey(mintAddress!),
    //   mintAccountInfo
    // );

    this.mintAccount = mintAccountInfo;
  }

  async init(connection: Connection) {
    await this._initMintAccount(connection);
    await this._initMembers(connection);
  }

  hasMember(publicKey: PublicKey): boolean {
    return (
      this.members.find((member) => member.publicKey.equals(publicKey)) !==
      undefined
    );
  }
}

export class SquadItem {
  account: Squad;
  pubkey: PublicKey;
}

export class SquadMember {
  publicKey: PublicKey;
  tokenAccount: PublicKey;
  tokens: BN;
  votingPower: BN;
  core: boolean;
  tokenAccountData: TokenAccount;
  constructor(args: {
    publicKey: PublicKey;
    tokenAccount: PublicKey;
    tokens?: BN;
    votingPower?: BN;
    core?: boolean;
    tokenAccountData?: TokenAccount;
  }) {
    this.publicKey = args.publicKey;
    this.tokenAccount = args.tokenAccount;
    this.tokens = args.tokens ?? new BN(0);
    this.votingPower = args.votingPower ?? new BN(0);
    this.core = args.core ?? false;
    this.tokenAccountData = args.tokenAccountData;
  }
}
