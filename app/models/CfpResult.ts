export enum ResultStatus {
  APPROVED = "Approved",
  NOT_APPROVED = "Not approved",
}

export enum VotingType {
  CFP = "cfp",
  DFIP = "dfip",
}

interface Vote {
  address: string;
  signature: string;
  cfpId: string;
  vote: string;
  createdAt: string;
  isCake: boolean;
}

export interface LockResults {
  id: string;
  name: string;
  result: { yes: number; neutral: number; no: number };
}

export interface CfpResult {
  number: string;
  title: string;
  type: VotingType;
  dfiAmount: number;
  htmlUrl: string;
  currentResult: ResultStatus;
  totalVotes: {
    total: number;
    possible: number;
    turnout: number;
    yes: number;
    neutral: number;
    no: number;
  };
  cakeVotes: {
    total: number;
    yes: number;
    neutral: number;
    no: number;
  };
  voteDetails: {
    yes: Vote[];
    no: Vote[];
    neutral: Vote[];
  };
  creationHeight: number;
  endHeight: number;
  endDate: string;
  status: string;
}
