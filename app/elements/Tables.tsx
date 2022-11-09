import React, { ReactNode } from "react";
import { StyleSheet, StyleProp, TextStyle, View } from "react-native";
import { DataTable, Text } from "react-native-paper";
import Colors from "../config/Colors";
import { DefaultCursor } from "../styles/AppStyles";

interface Props {
  multiLine?: boolean;
  title?: boolean;
  first?: boolean;
  last?: boolean;
  children: ReactNode;
  style?: StyleProp<TextStyle>;
}

export const CompactHeader = ({ children, style, ...props }: Props) => (
  <DataTable.Header style={[styles.header, style]} {...props}>
    <>{children}</>
  </DataTable.Header>
);

export const CompactTitle = ({ children, style, ...props }: Props) => (
  <DataTable.Title style={[styles.title, style]} {...props}>
    {children}
  </DataTable.Title>
);

export const CompactRow = ({ first, last, children, style, ...props }: Props) => (
  <DataTable.Row
    style={[styles.row, style].concat(first ? [styles.firstRow] : []).concat(last ? [styles.lastRow] : [])}
    {...props}
  >
    {children}
  </DataTable.Row>
);

export const CompactCell = ({ multiLine = false, title = false, children, style, ...props }: Props) =>
  multiLine ? (
    <View style={[styles.multiLineCell, style]}>
      <Text style={title ? [styles.cellTitle] : []}>{children}</Text>
    </View>
  ) : (
    <DataTable.Cell style={[styles.cell, style]} {...props}>
      <Text style={title ? [styles.cellTitle] : []}>{children}</Text>
    </DataTable.Cell>
  );

const styles = StyleSheet.create({
  header: {
    height: "unset",
  },
  title: {
    paddingVertical: 0,
  },
  row: {
    minHeight: 30,
    backgroundColor: Colors.White,
    borderBottomColor: Colors.Grey100,
    ...DefaultCursor,
  },
  firstRow: {
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },

  lastRow: {
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  cell: DefaultCursor,
  multiLineCell: {
    flex: 1,
    justifyContent: "center",
    marginVertical: 3,
  },
  cellTitle: {
    color: Colors.Grey400,
  },
});
