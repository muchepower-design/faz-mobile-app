// src/navigation/DrawerToggleButton.jsx
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import { colors } from '../theme/colors';

export function DrawerToggleButton() {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      onPress={() => navigation.getParent()?.openDrawer?.()}
      style={{ paddingHorizontal: 12 }}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Feather name="menu" size={22} color={colors.primary} />
    </TouchableOpacity>
  );
}