import { Environment } from "../env/Environment";
import { CfpVotes } from "../models/User";

const BaseUrl = Environment.api.lockUrl;
const VotingUrl = "voting";

// --- VOTING --- //

export const getVotes = (token: string): Promise<CfpVotes> => {
  return fetchFrom<CfpVotes>(`${VotingUrl}/votes`, token);
};

export const putVotes = (votes: CfpVotes, token: string): Promise<CfpVotes> => {
  return fetchFrom<CfpVotes>(`${VotingUrl}/votes`, token, "PUT", votes);
};

// --- HELPERS --- //

const fetchFrom = <T>(
  url: string,
  token: string,
  method: "GET" | "PUT" | "POST" | "DELETE" = "GET",
  data?: any
): Promise<T> => {
  return fetch(`${BaseUrl}/${url}`, buildInit(method, token, data)).then((response) => {
    if (response.ok) {
      return response.json().catch(() => undefined);
    }
    return response.json().then((body) => {
      throw body;
    });
  });
};

const buildInit = (method: "GET" | "PUT" | "POST" | "DELETE", token: string, data?: any): RequestInit => ({
  method: method,
  headers: {
    "Content-Type": "application/json",
    Authorization: token ? "Bearer " + token : "",
  },
  body: JSON.stringify(data),
});
