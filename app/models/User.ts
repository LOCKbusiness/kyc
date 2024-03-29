import i18n from "../i18n/i18n";

export enum KycStatus {
  NA = "NA",
  CHATBOT = "Chatbot",
  ONLINE_ID = "OnlineId",
  VIDEO_ID = "VideoId",
  CHECK = "Check",
  COMPLETED = "Completed",
  REJECTED = "Rejected",
}

export enum KycState {
  NA = "NA",
  FAILED = "Failed",
  REMINDED = "Reminded",
  REVIEW = "Review",
}

export enum AccountType {
  PERSONAL = "Personal",
  BUSINESS = "Business",
  SOLE_PROPRIETORSHIP = "SoleProprietorship",
}

export enum TradingPeriod {
  DAY = "Day",
  YEAR = "Year",
}

export interface KycInfo {
  kycStatus: KycStatus;
  kycState: KycState;
  kycDataComplete: boolean;
  kycHash: string;
  accountType: AccountType;
  sessionUrl?: string;
  setupUrl?: string;
  blankedPhone?: string;
  blankedMail?: string;
}

export interface CfpVotes {
  [number: string]: CfpVote | undefined;
}

export enum CfpVote {
  YES = "Yes",
  NO = "No",
  NEUTRAL = "Neutral",
}

export const kycNotStarted = (kycStatus?: KycStatus) => [KycStatus.NA].includes(kycStatus ?? KycStatus.NA);

export const kycCompleted = (kycStatus?: KycStatus) => [KycStatus.COMPLETED].includes(kycStatus ?? KycStatus.NA);

export const kycInReview = (kycStatus?: KycStatus, kycState?: KycState) =>
  [KycStatus.CHECK].includes(kycStatus ?? KycStatus.NA) || [KycState.REVIEW].includes(kycState ?? KycState.NA);

export const kycInProgress = (kycStatus?: KycStatus) =>
  [KycStatus.CHATBOT, KycStatus.ONLINE_ID, KycStatus.VIDEO_ID].includes(kycStatus ?? KycStatus.NA);

export const kycStepInProgress = (kycState?: KycState) =>
  ![KycState.REVIEW, KycState.FAILED].includes(kycState ?? KycState.NA);

export const getKycStatusString = (user: KycInfo): string => {
  if (kycInProgress(user.kycStatus)) {
    return `${i18n.t("model.kyc." + user.kycState.toLowerCase())} (${i18n.t(
      "model.kyc." + user.kycStatus.toLowerCase()
    )})`;
  } else {
    return i18n.t(`model.kyc.${user.kycStatus.toLowerCase()}`);
  }
};
