import React, { SetStateAction, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { DeFiButton } from "../elements/Buttons";
import { Environment } from "../env/Environment";
import withSettings from "../hocs/withSettings";
import { useDevice } from "../hooks/useDevice";
import { Language } from "../models/Language";
import SettingsService, { AppSettings } from "../services/SettingsService";
import AppStyles from "../styles/AppStyles";
import { resolve, openUrl } from "../utils/Utils";
import DeFiDropdown from "./form/DeFiDropdown";

const HeaderContent = ({ settings, drawer }: { settings?: AppSettings; drawer?: boolean }) => {
  const { t } = useTranslation();
  const device = useDevice();

  const [selectedLanguage, setSelectedLanguage] = useState(Environment.defaultLanguage);

  useEffect(() => {
    if (settings) {
      setSelectedLanguage(settings.language);
    }
  }, [settings]);

  const getLanguage = (symbol: string): Language | undefined =>
    SettingsService.Languages.find((l) => l.symbol === symbol);
  const languageChanged = (update: SetStateAction<Language | undefined>) => {
    const language = resolve(update, getLanguage(selectedLanguage));
    if (language) {
      SettingsService.updateSettings({ language: language.symbol });
    }
  };

  const links = [
    { key: "general.homepage", url: "https://lock.space/" },
    { key: "general.telegram", url: t("general.telegram_link") },
  ];

  return (
    <View style={device.SM && [AppStyles.containerHorizontalWrap, styles.container]}>
      {links.map((link) => (
        <DeFiButton key={link.key} onPress={() => openUrl(link.url)} style={styles.button} compact header={!drawer}>
          {t(link.key)}
        </DeFiButton>
      ))}

      {SettingsService.Languages?.length > 0 && (
        <DeFiDropdown
          value={getLanguage(selectedLanguage)}
          setValue={languageChanged}
          items={SettingsService.Languages}
          idProp="symbol"
          labelProp="foreignName"
          title={t("general.select_language")}
          style={styles.button}
          header={!drawer}
        ></DeFiDropdown>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "flex-end",
  },
  button: {
    alignSelf: "flex-start",
  },
});

export default withSettings(HeaderContent);
