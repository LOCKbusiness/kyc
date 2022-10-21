import { DefaultTheme } from "react-native-paper";
import Colors from "../config/Colors";

const AppTheme = DefaultTheme;
AppTheme.colors = {
  ...DefaultTheme.colors,
  ...{
    primary: Colors.Primary,
    accent: Colors.Primary,
    text: Colors.Black,
    background: Colors.Grey100,
    placeholder: Colors.Grey400,
    surface: Colors.Grey400,
    onSurface: Colors.Grey400,
  },
};
AppTheme.fonts = {
  regular: { fontFamily: "Poppins, Helvetica, Arial", fontWeight: "normal" },
  medium: { fontFamily: "Poppins, Helvetica, Arial", fontWeight: "normal" },
  light: { fontFamily: "Poppins, Helvetica, Arial", fontWeight: "normal" },
  thin: { fontFamily: "Poppins, Helvetica, Arial", fontWeight: "normal" },
};

export default AppTheme;
