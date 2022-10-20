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
    surface: Colors.Primary,
    onSurface: Colors.Primary,
  },
};

export default AppTheme;
