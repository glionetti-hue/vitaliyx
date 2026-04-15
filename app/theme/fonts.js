// Font di sistema Android/iOS — nessun caricamento necessario
import { Platform } from 'react-native';

export const fonts = {
  regular:  Platform.OS === 'ios' ? 'System' : 'Roboto',
  medium:   Platform.OS === 'ios' ? 'System' : 'Roboto',
  semiBold: Platform.OS === 'ios' ? 'System' : 'Roboto',
  bold:     Platform.OS === 'ios' ? 'System' : 'Roboto',
};

export const fontSize = {
  xs:   11,
  sm:   13,
  base: 15,
  md:   17,
  lg:   20,
  xl:   24,
  xxl:  30,
  hero: 42,
};
