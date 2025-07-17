// src/components/FooterNav.tsx
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Համոզվեք, որ այս ուղիները ճիշտ են ձեր նախագծում
import HomeIcon from '../../assets/icons/home.svg';
import NewsIcon from '../../assets/icons/news.svg';
import VideoIcon from '../../assets/icons/video.svg';
import InterwIcon from '../../assets/icons/interw.svg';
import DoctorIcon from '../../assets/icons/doctor.svg';

// Սահմանում ենք StackParamList-ը
type RootStackParamList = {
  Home: undefined;
  NewsScreen: undefined; // Նոր էջ
  Videos: undefined;
  InterviewScreen: undefined; // Նոր էջ
  Doctors: undefined;
  ArticleScreen: { id: string };
};

const FooterNav = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute();

  return (
    <View style={styles.footerContainer}>
      <View style={styles.footer}>
        <NavIcon
          Icon={HomeIcon}
          label="Գլխավոր"
          routeName="Home"
          currentRouteName={route.name}
          onPress={() => navigation.navigate('Home')}
        />
        <NavIcon
          Icon={NewsIcon}
          label="Լրահոս"
          routeName="NewsScreen" // Ուղղորդում դեպի NewsScreen
          currentRouteName={route.name}
          onPress={() => navigation.navigate('NewsScreen')}
        />
        <NavIcon
          Icon={VideoIcon}
          label="Տեսանյութեր"
          routeName="Videos"
          currentRouteName={route.name}
          onPress={() => navigation.navigate('Videos')} // Եթե ունեք Videos էջ
        />
        <NavIcon
          Icon={InterwIcon}
          label="Հարցազրույցներ"
          routeName="InterviewScreen" // Ուղղորդում դեպի InterviewScreen
          currentRouteName={route.name}
          onPress={() => navigation.navigate('InterviewScreen')}
        />
        <NavIcon
          Icon={DoctorIcon}
          label="Բժիշկներ"
          routeName="Doctors"
          currentRouteName={route.name}
          onPress={() => navigation.navigate('Doctors')} // Եթե ունեք Doctors էջ
        />
      </View>
    </View>
  );
};

interface NavIconProps {
  Icon: React.FC<any>;
  label: string;
  routeName: keyof RootStackParamList;
  currentRouteName: string;
  onPress: () => void;
}

const NavIcon = ({ Icon, label, routeName, currentRouteName, onPress }: NavIconProps) => {
  const isSelected = currentRouteName === routeName;

  return (
    <TouchableOpacity style={styles.item} onPress={onPress}>
      <Icon width={67} height={42} opacity={isSelected ? 1 : 0.5} />
      {/* <Text style={[styles.iconLabel, isSelected && styles.iconLabelSelected]}>{label}</Text> */}
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#833F6D',
    paddingVertical: 17,
    paddingHorizontal: 14,
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
  },
  iconLabel: {
    fontSize: 10,
    color: '#fff',
    marginTop: 2,
  },
  iconLabelSelected: {
    fontWeight: 'bold',
  },
});