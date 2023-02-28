import { Environment } from "../env/Environment";
import { ApiError } from "../models/ApiDto";
import { LockResults } from "../models/CfpResult";
import { CfpVotes } from "../models/User";
import AuthService, { Session } from "./AuthService";

const BaseUrl = Environment.api.lockUrl;
const VotingUrl = "voting";

// --- VOTING --- //

export const getVotes = (): Promise<CfpVotes> => {
  return fetchFrom<CfpVotes>(`${VotingUrl}/votes`);
};

export const putVotes = (votes: CfpVotes): Promise<CfpVotes> => {
  return fetchFrom<CfpVotes>(`${VotingUrl}/votes`, "PUT", votes);
};

export const getVotingResults = (): Promise<LockResults[]> => {
  return fetchFrom<LockResults[]>(`${VotingUrl}/result`);
};

// --- HELPERS --- //

const fetchFrom = <T>(url: string, method: "GET" | "PUT" | "POST" | "DELETE" = "GET", data?: any): Promise<T> => {
  return AuthService.Session.then((session) => buildInit(method, session, data))
    .then((init) => fetch(`${BaseUrl}/${url}`, init))
    .then((response) => {
      if (response.ok) {
        return response.json().catch(() => undefined);
      }
      return response.json().then((body) => {
        throw body;
      });
    })
    .catch((error: ApiError) => {
      if (error.statusCode === 401) {
        AuthService.deleteSession();
      }

      throw error;
    });
};

const buildInit = (method: "GET" | "PUT" | "POST" | "DELETE", session: Session, data?: any): RequestInit => ({
  method: method,
  headers: {
    "Content-Type": "application/json",
    Authorization: session.accessToken ? "Bearer " + session.accessToken : "",
  },
  body: JSON.stringify(data),
});
