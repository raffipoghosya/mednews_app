// src/components/FooterNav.tsx
import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';

import HomeIcon from '../../assets/icons/home.svg';
import NewsIcon from '../../assets/icons/news.svg';
import VideoIcon from '../../assets/icons/video.svg';
import InterwIcon from '../../assets/icons/interw.svg';
import DoctorIcon from '../../assets/icons/doctor.svg';

const FooterNav = (props: any) => {
  const { state, navigation } = props;
  const currentRouteName = state.routeNames[state.index];

  
  return (
    <View style={styles.footerContainer}>
      <View style={styles.footer}>
        <NavIcon
          Icon={HomeIcon}
          label="Գլխավոր"
          // ✅ Փոփոխված է՝ համապատասխանեցնելով AppNavigator-ին
          routeName="HomeStack"
          currentRouteName={currentRouteName}
          onPress={() => navigation.navigate('HomeStack')}
        />
        <NavIcon
          Icon={NewsIcon}
          label="Լրահոս"
          // ✅ Փոփոխված է
          routeName="NewsStack"
          currentRouteName={currentRouteName}
          onPress={() => navigation.navigate('NewsStack')}
        />
        <NavIcon
          Icon={VideoIcon}
          label="Տեսանյութեր"
          // ✅ Փոփոխված է
          routeName="VideosStack"
          currentRouteName={currentRouteName}
          onPress={() => navigation.navigate('VideosStack')}
        />
        <NavIcon
          Icon={InterwIcon}
          label="Հարցազրույցներ"
          // ✅ Փոփոխված է
          routeName="InterviewStack"
          currentRouteName={currentRouteName}
          onPress={() => navigation.navigate('InterviewStack')}
        />
        <NavIcon
          Icon={DoctorIcon}
          label="Բժիշկներ"
          // ✅ Այս անունը ճիշտ էր՝ Doctors
          routeName="Doctors"
          currentRouteName={currentRouteName}
          onPress={() => navigation.navigate('Doctors')}
        />
      </View>
    </View>
  );
};

interface NavIconProps {
  Icon: React.FC<any>;
  label: string;
  routeName: string;
  currentRouteName: string;
  onPress: () => void;
}

const NavIcon = ({ Icon, label, routeName, currentRouteName, onPress }: NavIconProps) => {
  // Այժմ ընտրված լինելու ստուգումը ճիշտ կաշխատի
  const isSelected = currentRouteName === routeName;

  return (
    <TouchableOpacity style={styles.item} onPress={onPress}>
      <Icon width={67} height={42} opacity={isSelected ? 1 : 0.5} />
    </TouchableOpacity>
  );
};

export default FooterNav;

const styles = StyleSheet.create({
  footerContainer: {
    backgroundColor: '#833F6D',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    overflow: 'hidden',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#833F6D',
    paddingVertical: 17,
    paddingHorizontal: 14,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
  },
});