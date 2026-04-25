import { Platform, StatusBar } from 'react-native';
import theme from './Theme';

export const StatusHeight = StatusBar.currentHeight;
export const HeaderHeight = (theme.SIZES.BASE * 3.5 + (StatusHeight || 0));
