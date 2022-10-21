import React from "react";
import { StyleSheet, View, Image, TouchableOpacity } from "react-native";
import AppStyles from "../styles/AppStyles";
import { useNavigation } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { IconButton } from "react-native-paper";
import { useDevice } from "../hooks/useDevice";
import HeaderContent from "./HeaderContent";
import Sizes from "../config/Sizes";

const Header = () => {
  const device = useDevice();
  const nav = useNavigation<DrawerNavigationProp<any>>();

  return (
    <View style={[AppStyles.containerHorizontal, styles.container]}>
      {!device.SM && <IconButton icon="menu" onPress={() => nav.toggleDrawer()} style={AppStyles.mra} />}

      <TouchableOpacity activeOpacity={1} style={styles.logoTouch}>
        <Image style={styles.logo} source={require("../assets/logo.svg")} />
      </TouchableOpacity>

      <View style={[styles.container, !device.SM && AppStyles.noDisplay]}>
        <HeaderContent />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    maxWidth: Sizes.AppWidth,
  },
  logoTouch: {
    width: 80,
    height: 30,
  },
  logo: {
    flex: 1,
    resizeMode: "contain",
  },
});

export default Header;
