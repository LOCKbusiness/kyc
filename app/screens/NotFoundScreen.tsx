import React from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import AppLayout from "../components/AppLayout";
import { SpacerV } from "../elements/Spacers";
import { H1 } from "../elements/Texts";
import AppStyles from "../styles/AppStyles";

const NotFoundScreen = () => {
  const { t } = useTranslation();

  return (
    <AppLayout>
      <View style={[AppStyles.container, AppStyles.alignCenter]}>
        <H1 text={t("feedback.page_not_found")} />
        <SpacerV height={30} />
      </View>
    </AppLayout>
  );
};

export default NotFoundScreen;
