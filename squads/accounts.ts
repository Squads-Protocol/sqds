import { AccountInfo, PublicKey } from "@solana/web3.js";
import { Account as SPLTokenAccount } from "@solana/spl-token";
import BN from "bn.js";

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
  proposalNonce: number;
  createdOn: BN;
  members?: SquadMember[];
  solBalance: BN;
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
    createdOn: BN;
    members?: SquadMember[];
    solBalance: BN;
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
    this.createdOn = args.createdOn;
    this.members = args.members;
    this.solBalance = args.solBalance;
    this.publicKey = args.publicKey;
    this.randomId = args.randomId;
    this.childIndex = args.childIndex;
    this.memberLockIndex = args.memberLockIndex;
  }
  hasMember(publicKey: PublicKey) {
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
  equityTokenAccount: TokenAccount;
  tokens: BN;
  votingPower: BN;
  core: boolean;
  tokenAccount: TokenAccount;
  constructor(args: {
    publicKey: PublicKey;
    equityTokenAccount: TokenAccount;
    tokens?: BN;
    votingPower?: BN;
    core?: boolean;
    tokenAccount?: TokenAccount;
  }) {
    this.publicKey = args.publicKey;
    this.equityTokenAccount = args.equityTokenAccount;
    this.tokens = args.tokens ?? new BN(0);
    this.votingPower = args.votingPower ?? new BN(0);
    this.core = args.core ?? false;
    this.tokenAccount = args.tokenAccount;
  }
}
