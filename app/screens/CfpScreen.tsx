import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { StackedBarChart } from "react-native-chart-kit";
import { AbstractChartConfig } from "react-native-chart-kit/dist/AbstractChart";
import { StackedBarChartData } from "react-native-chart-kit/dist/StackedBarChart";
import { DataTable, Text } from "react-native-paper";
import Colors from "../config/Colors";
import { CfpResult } from "../models/CfpResult";
import { CfpVote, CfpVotes } from "../models/User";
import { getCfpResults } from "../services/KycApiService";
import NotificationService from "../services/NotificationService";
import AppStyles from "../styles/AppStyles";
import { openUrl } from "../utils/Utils";
import { getVotes, putVotes } from "../services/LockApiService";
import AppLayout from "../components/AppLayout";
import { H1, H3 } from "../elements/Texts";
import { SpacerV } from "../elements/Spacers";
import Loading from "../components/util/Loading";
import { RadioButton } from "../elements/RadioButton";
import { DeFiButton } from "../elements/Buttons";
import { CompactCell, CompactRow } from "../elements/Tables";
import { useNavigation, useRoute } from "@react-navigation/native";
import Routes from "../config/Routes";

const CfpScreen = () => {
  const route = useRoute();
  const nav = useNavigation();

  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [cfpResults, setCfpResults] = useState<CfpResult[]>();
  const [token, setToken] = useState();
  const [isVotingOpen, setIsVotingOpen] = useState(false);
  const [votes, setVotes] = useState<CfpVotes | undefined>();
  const [isSaving, setIsSaving] = useState<{ number: Number; vote: CfpVote } | undefined>();

  useEffect(() => {
    // store and reset params
    const params = route.params as any;
    if (!params?.token) return nav.navigate(Routes.NotFound);

    setToken(params.token);
    nav.navigate(Routes.Cfp, { token: undefined });

    Promise.all([getCfpResults("latest"), getVotes(params.token)])
      .then(([results, votes]) => {
        setCfpResults(results);
        setIsVotingOpen(votingOpen(results));
        setVotes(votes);
      })
      .catch(onLoadFailed)
      .finally(() => setIsLoading(false));
  }, []);

  const votingOpen = (results: CfpResult[]): boolean => {
    if (results.length == 0) return false;

    const startDate = new Date(results[0].startDate);
    const endDate = new Date(results[0].endDate);
    endDate.setDate(endDate.getDate() - 1);

    return new Date() > startDate && new Date() < endDate;
  };

  const getData = (result: CfpResult): StackedBarChartData => {
    return {
      labels: [],
      legend: [
        `${t("cfp.yes")} (${Math.round((result.totalVotes.yes / result.totalVotes.total) * 100)}%)`,
        `${t("cfp.neutral")} (${Math.round((result.totalVotes.neutral / result.totalVotes.total) * 100)}%)`,
        `${t("cfp.no")} (${Math.round((result.totalVotes.no / result.totalVotes.total) * 100)}%)`,
      ],
      data: [[], [result.totalVotes.yes, result.totalVotes.neutral, result.totalVotes.no]],
      barColors: [Colors.Primary, Colors.White, Colors.Grey400],
    };
  };

  const onLoadFailed = () => {
    NotificationService.error(t("feedback.load_failed"));
  };

  const onVote = (number: number, vote: CfpVote) => {
    if (!token) return;

    setVotes((votes) => {
      votes = { ...(votes ?? {}), [number]: votes?.[number] === vote ? undefined : vote };

      setIsSaving({ number, vote });
      putVotes(votes, token).finally(() => setIsSaving(undefined));

      return votes;
    });
  };

  const config: AbstractChartConfig = {
    backgroundColor: Colors.Grey100,
    backgroundGradientFrom: Colors.Grey100,
    backgroundGradientTo: Colors.Grey100,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0,  0,  0,  ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0,  0,  0,  ${opacity})`,
    propsForBackgroundLines: {
      stroke: Colors.Grey100,
    },
  };

  return (
    <AppLayout>
      <View style={[AppStyles.container, AppStyles.alignCenter]}>
        <H1 text={t("cfp.title")} />
        <SpacerV height={30} />

        {isLoading ? (
          <Loading size="large" />
        ) : (
          <>
            {cfpResults
              ?.sort((a, b) => a.number - b.number)
              .map((result) => (
                <View key={result.number} style={{ width: "100%" }}>
                  <H3 text={result.title} style={AppStyles.center} />

                  <DeFiButton onPress={() => openUrl(result.htmlUrl)} compact>
                    {t("cfp.read_proposal")}
                  </DeFiButton>

                  <View style={styles.cfpContainer}>
                    <View>
                      <DataTable style={{ width: 300 }}>
                        <CompactRow>
                          <CompactCell>ID</CompactCell>
                          <CompactCell>#{result.number}</CompactCell>
                        </CompactRow>
                        <CompactRow>
                          <CompactCell>{t("cfp.voting")}</CompactCell>
                          <CompactCell>
                            {result.totalVotes.yes} / {result.totalVotes.neutral} / {result.totalVotes.no}
                          </CompactCell>
                        </CompactRow>
                        <CompactRow>
                          <CompactCell>#{t("cfp.votes")}</CompactCell>
                          <CompactCell>{result.totalVotes.total}</CompactCell>
                        </CompactRow>
                        <CompactRow>
                          <CompactCell>{t("cfp.vote_turnout")}</CompactCell>
                          <CompactCell>{result.totalVotes.turnout}%</CompactCell>
                        </CompactRow>
                        <CompactRow>
                          <CompactCell>{t("cfp.current_result")}</CompactCell>
                          <CompactCell>{t(`cfp.${result.currentResult.toLowerCase()}`)}</CompactCell>
                        </CompactRow>
                      </DataTable>
                    </View>
                    {result.totalVotes.total > 0 && (
                      <View style={styles.chartContainer}>
                        <StackedBarChart
                          data={getData(result)}
                          width={350}
                          height={200}
                          chartConfig={config}
                          hideLegend={false}
                          withHorizontalLabels={false}
                          style={{ marginTop: 5 }}
                        />
                      </View>
                    )}
                  </View>
                  <SpacerV />
                  <Text style={[AppStyles.center, AppStyles.b]}>{t("cfp.your_vote")}</Text>
                  <View style={[AppStyles.containerHorizontalWrap, styles.voteContainer]}>
                    <RadioButton
                      label={t("cfp.yes")}
                      onPress={() => onVote(result.number, CfpVote.YES)}
                      checked={votes?.[result.number] === CfpVote.YES}
                      disabled={!isVotingOpen}
                      loading={isSaving?.number === result.number && isSaving.vote === CfpVote.YES}
                    />
                    <RadioButton
                      label={t("cfp.no")}
                      onPress={() => onVote(result.number, CfpVote.NO)}
                      checked={votes?.[result.number] === CfpVote.NO}
                      disabled={!isVotingOpen}
                      loading={isSaving?.number === result.number && isSaving.vote === CfpVote.NO}
                    />
                    <RadioButton
                      label={t("cfp.neutral")}
                      onPress={() => onVote(result.number, CfpVote.NEUTRAL)}
                      checked={votes?.[result.number] === CfpVote.NEUTRAL}
                      disabled={!isVotingOpen}
                      loading={isSaving?.number === result.number && isSaving.vote === CfpVote.NEUTRAL}
                    />
                  </View>
                  <SpacerV height={50} />
                </View>
              ))}
          </>
        )}
      </View>
    </AppLayout>
  );
};

const styles = StyleSheet.create({
  cfpContainer: {
    flexDirection: "row",
    flexWrap: "wrap-reverse",
    justifyContent: "center",
    alignItems: "center",
  },
  chartContainer: {
    width: 250,
    height: 180,
    alignItems: "flex-end",
    overflow: "hidden",
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  voteContainer: {
    justifyContent: "center",
  },
});

export default CfpScreen;
