import React from "react";
import { Button } from "react-native-paper";
import Colors from "../config/Colors";
import AppStyles, { DefaultCursor } from "../styles/AppStyles";

// TODO: use the paper button props?
export const DeFiButton = ({ link, header, loading, disabled, style, ...props }: any) => {
  const isDisabled = loading || disabled;
  return (
    <Button
      loading={loading}
      disabled={isDisabled}
      contentStyle={[props.contentStyle, isDisabled && DefaultCursor]}
      labelStyle={[
        header && { color: Colors.White },
        link && AppStyles.buttonLink,
        props.mode === "contained" && { color: isDisabled ? Colors.Grey400 : Colors.White },
      ]}
      style={[style, { borderColor: header ? Colors.White : Colors.Primary }]}
      {...props}
    >
      {props.children}
    </Button>
  );
};
