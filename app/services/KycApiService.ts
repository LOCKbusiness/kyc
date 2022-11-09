import { Environment } from "../env/Environment";
import { ApiError } from "../models/ApiDto";
import { KycInfo } from "../models/User";
import { KycData, toKycDataDto } from "../models/KycData";
import { Language } from "../models/Language";
import { Country } from "../models/Country";
import { CfpResult } from "../models/CfpResult";

const BaseUrl = Environment.api.baseUrl;
const LanguageUrl = "language";
const CountryUrl = "country";
const KycUrl = "kyc";
const StatisticUrl = "statistic";

// --- KYC --- //
export const putKycData = (data: KycData, code?: string): Promise<KycInfo> => {
  return fetchFrom<KycInfo>(`${KycUrl}/${code}/data`, "PUT", toKycDataDto(data));
};

export const postKyc = (code?: string): Promise<KycInfo> => {
  return fetchFrom<KycInfo>(`${KycUrl}/${code}`, "POST");
};

export const getKyc = (code?: string): Promise<KycInfo> => {
  return fetchFrom<KycInfo>(`${KycUrl}/${code}`);
};

export const postFounderCertificate = (files: File[], code?: string): Promise<void> => {
  return postFiles(`${KycUrl}/${code}/incorporationCertificate`, files);
};

export const getCountries = (): Promise<Country[]> => {
  return fetchFrom<Country[]>(CountryUrl).then((countries) => countries.sort((a, b) => (a.name > b.name ? 1 : -1)));
};

export const getLanguages = (): Promise<Language[]> => {
  return fetchFrom<Language[]>(LanguageUrl);
};

export const getCfpResults = (voting: string): Promise<CfpResult[]> => {
  return fetchFrom(`${StatisticUrl}/cfp/${voting}`);
};

// --- HELPERS --- //
const postFiles = (url: string, files: File[]): Promise<void> => {
  const formData = new FormData();
  for (const key in files) {
    formData.append("files", files[key]);
  }
  return fetchFrom(url, "POST", formData, true);
};

const fetchFrom = <T>(
  url: string,
  method: "GET" | "PUT" | "POST" | "DELETE" = "GET",
  data?: any,
  noJson?: boolean
): Promise<T> => {
  return (
    fetch(`${BaseUrl}/${url}`, buildInit(method, data, noJson))
      .then((response) => {
        if (response.ok) {
          return response.json().catch(() => undefined);
        }
        return response.json().then((body) => {
          throw body;
        });
      })
      // TODO: this throws state update error (on HomeScreen)
      .catch((error: ApiError) => {
        throw error;
      })
  );
};

const buildInit = (method: "GET" | "PUT" | "POST" | "DELETE", data?: any, noJson?: boolean): RequestInit => ({
  method: method,
  headers: {
    ...(noJson ? undefined : { "Content-Type": "application/json" }),
  },
  body: noJson ? data : JSON.stringify(data),
});
