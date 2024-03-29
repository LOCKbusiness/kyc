import React, { useEffect, useRef, useState } from "react";
import AppLayout from "../components/AppLayout";
import Iframe from "../components/util/Iframe";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { DeFiButton } from "../elements/Buttons";
import { getKyc, postFounderCertificate, postKyc } from "../services/KycApiService";
import NotificationService from "../services/NotificationService";
import {
  AccountType,
  getKycStatusString,
  kycCompleted,
  kycInProgress,
  KycInfo,
  KycStatus,
  kycNotStarted,
  kycInReview,
  kycStepInProgress,
} from "../models/User";
import { openUrl, pickDocuments } from "../utils/Utils";
import KycInit from "../components/KycInit";
import { SpacerV } from "../elements/Spacers";
import { H2 } from "../elements/Texts";
import { AppSettings } from "../services/SettingsService";
import withSettings from "../hocs/withSettings";
import { DataTable, Dialog, Paragraph, Portal } from "react-native-paper";
import { CompactRow, CompactCell } from "../elements/Tables";
import ButtonContainer from "../components/util/ButtonContainer";
import DeFiModal from "../components/util/DeFiModal";
import AppStyles from "../styles/AppStyles";
import Colors from "../config/Colors";
import { KycData } from "../models/KycData";
import KycDataEdit from "../components/edit/KycDataEdit";
import Routes from "../config/Routes";
import StorageService from "../services/StorageService";

const KycScreen = ({ settings }: { settings?: AppSettings }) => {
  const { t } = useTranslation();
  const nav = useNavigation();
  const route = useRoute();

  // data
  const [kycInfo, setKycInfo] = useState<KycInfo>();
  const [kycData, setKycData] = useState<KycData>();
  const [inputParams, setInputParams] = useState<any>();

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isKycInProgress, setIsKycInProgress] = useState<boolean>(false);
  const [isKycDataEdit, setKycDataEdit] = useState<boolean>(false);
  const [showsKycStartDialog, setShowsKycStartDialog] = useState<boolean>(false);
  const [isFileUploading, setIsFileUploading] = useState(false);
  const [showsReviewHint, setShowsReviewHint] = useState(false);

  const intervalRef = useRef<NodeJS.Timer>();

  useEffect(() => {
    const params = route.params as any;

    // fetch code from storage
    StorageService.getPrimitive(StorageService.Keys.KycCode).then((storageCode) => {
      const code = params?.code ?? storageCode;
      if (!code) return onError();

      // store and reset params
      setInputParams(params);
      StorageService.storeValue(StorageService.Keys.KycCode, code);
      nav.navigate(Routes.Kyc, { code: undefined, autostart: undefined, phone: undefined, mail: undefined });

      // get KYC info
      getKyc(code)
        .then((result) => {
          setKycInfo(result);
          setIsLoading(false);

          if (params?.autostart) continueKyc(result, params);
        })
        .catch(onError);
    });
  }, []);

  const continueAllowed = (info?: KycInfo): boolean =>
    kycStepInProgress(info?.kycState) && !kycInReview(info?.kycStatus) && !kycCompleted(info?.kycStatus);

  const continueKyc = (info?: KycInfo, params?: any) => {
    if (!continueAllowed(info)) return;

    if (!info?.kycDataComplete) {
      setKycData({ accountType: AccountType.PERSONAL, ...params });
      setKycDataEdit(true);
    } else if (kycNotStarted(info?.kycStatus) && info?.accountType === AccountType.BUSINESS) {
      setShowsKycStartDialog(true);
    } else if (kycNotStarted(info?.kycStatus)) {
      startKyc();
    } else if (kycInProgress(info?.kycStatus)) {
      if (!info?.sessionUrl) return NotificationService.error(t("feedback.load_failed"));

      setIsKycInProgress(true);

      if (info?.kycStatus !== KycStatus.CHATBOT) {
        startIdent(info);
      }
    }
  };

  const startIdent = (info: KycInfo) => {
    // load iframe
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);

    // poll for completion
    intervalRef.current = setInterval(() => {
      getKyc(info.kycHash)
        .then((i) => {
          if (!kycInProgress(i.kycStatus) || !kycStepInProgress(i.kycState)) {
            setIsKycInProgress(false);

            // clear the interval
            intervalRef.current && clearInterval(intervalRef.current);
          }
          if (kycInReview(i.kycStatus, i.kycState)) setShowsReviewHint(true);

          setKycInfo(i);
        })
        .catch(console.error);
    }, 1000);
  };

  const startKyc = async () => {
    if (hasToUploadFounderDocument()) {
      if (!(await uploadFounderCertificate())) return;
    }

    setShowsKycStartDialog(false);

    // start KYC
    setIsLoading(true);
    postKyc(kycInfo?.kycHash)
      .then((result) => {
        setKycInfo(result);
        continueKyc(result);
      })
      .catch(onLoadFailed)
      .finally(() => {
        setIsLoading(false);
      });
  };

  const onLoadFailed = () => {
    NotificationService.error(t("feedback.load_failed"));
  };

  const onError = () => {
    nav.navigate(Routes.NotFound);
  };

  const onKycDataSubmit = (newKycData: KycData, info: KycInfo) => {
    setKycInfo(info);
    setKycData(newKycData);

    setKycDataEdit(false);

    continueKyc(info);
  };

  const uploadFounderCertificate = (): Promise<boolean> => {
    return pickDocuments({ type: "public.item", multiple: false })
      .then((files) => {
        setIsFileUploading(true);
        return postFounderCertificate(files, kycInfo?.kycHash);
      })
      .then(() => true)
      .catch(() => {
        NotificationService.error(t("feedback.file_error"));
        return false;
      })
      .finally(() => setIsFileUploading(false));
  };

  const onComplete = () => openUrl((route.params as any)?.redirect_uri ?? "https://lock.space", false);

  const continueLabel = (): string => {
    if (kycNotStarted(kycInfo?.kycStatus)) return "action.start";
    else return "action.next";
  };

  const hasToUploadFounderDocument = () => kycInfo?.accountType === AccountType.BUSINESS;

  return (
    <AppLayout
      preventScrolling={kycInfo?.kycStatus === KycStatus.CHATBOT}
      removeHeaderSpace={kycInfo?.kycStatus === KycStatus.CHATBOT}
    >
      <KycInit isVisible={isLoading} setIsVisible={setIsLoading} />

      {kycInfo?.kycHash && (
        <DeFiModal
          isVisible={isKycDataEdit}
          setIsVisible={setKycDataEdit}
          title={t("model.user.edit")}
          style={{ width: 500 }}
        >
          <KycDataEdit code={kycInfo.kycHash} kycData={kycData} kycInfo={kycInfo} onChanged={onKycDataSubmit} />
        </DeFiModal>
      )}

      {kycInfo &&
        (isKycInProgress && kycInfo.sessionUrl ? (
          <View style={styles.container}>
            {kycInfo.setupUrl && (
              <View style={styles.hiddenIframe}>
                <Iframe src={kycInfo.setupUrl} />
              </View>
            )}
            <Iframe src={kycInfo.sessionUrl} />
          </View>
        ) : showsReviewHint ? (
          <>
            <View>
              {!settings?.isIframe && <SpacerV height={30} />}

              <H2 text={t("model.kyc.review_title")} />
              <SpacerV />

              <Paragraph>{t(`model.kyc.review_text`)}</Paragraph>

              <SpacerV />
              <ButtonContainer>
                <DeFiButton mode="contained" onPress={onComplete}>
                  {t("action.ok")}
                </DeFiButton>
              </ButtonContainer>
            </View>
          </>
        ) : (
          <>
            <Portal>
              <Dialog
                visible={showsKycStartDialog}
                onDismiss={() => setShowsKycStartDialog(false)}
                style={AppStyles.dialog}
              >
                <Dialog.Content>
                  <Paragraph>{t("model.kyc.request_business")}</Paragraph>
                </Dialog.Content>
                <Dialog.Actions>
                  <DeFiButton onPress={() => setShowsKycStartDialog(false)} color={Colors.Primary}>
                    {t("action.abort")}
                  </DeFiButton>
                  <DeFiButton onPress={startKyc} loading={isFileUploading}>
                    {t("action.upload")}
                  </DeFiButton>
                </Dialog.Actions>
              </Dialog>
            </Portal>

            <View>
              {!settings?.isIframe && <SpacerV height={30} />}

              <H2 text={t("model.kyc.title")} style={styles.tableHeader} />
              <SpacerV />
              <DataTable>
                {!kycNotStarted(kycInfo.kycStatus) && (
                  <CompactRow first>
                    <CompactCell title>{t("model.kyc.status")}</CompactCell>
                    <CompactCell multiLine>{getKycStatusString(kycInfo)}</CompactCell>
                  </CompactRow>
                )}
                {kycInfo.blankedMail && (
                  <CompactRow>
                    <CompactCell title>{t("model.user.mail")}</CompactCell>
                    <CompactCell>{kycInfo.blankedMail}</CompactCell>
                  </CompactRow>
                )}
                {kycInfo.blankedPhone && (
                  <CompactRow last>
                    <CompactCell title>{t("model.user.mobile_number")}</CompactCell>
                    <CompactCell>{kycInfo.blankedPhone}</CompactCell>
                  </CompactRow>
                )}
              </DataTable>
              <SpacerV height={20} />
              {continueAllowed(kycInfo) && (
                <ButtonContainer>
                  <DeFiButton mode="contained" onPress={() => continueKyc(kycInfo, inputParams)}>
                    {t(continueLabel())}
                  </DeFiButton>
                </ButtonContainer>
              )}
            </View>
          </>
        ))}
    </AppLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    justifyContent: "space-between",
    flex: 1,
  },
  tableHeader: {
    color: Colors.Primary,
    marginBottom: 0,
  },
  hiddenIframe: {
    height: 0,
    overflow: "hidden",
  },
  chatbotButton: {
    fontSize: 18,
  },
});

export default withSettings(KycScreen);
