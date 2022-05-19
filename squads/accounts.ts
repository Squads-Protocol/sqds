import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";

export type SquadsAccountType = typeof Squad;

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
  members?: Map<PublicKey, PublicKey>;
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
    members: Map<PublicKey, PublicKey>;
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
    this.randomId = args.randomId;
    this.childIndex = args.childIndex;
    this.memberLockIndex = args.memberLockIndex;
  }
}

export class SquadItem {
  account: Squad;
  pubkey: PublicKey;
}
