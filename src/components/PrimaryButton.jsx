import React from 'react';
import {TouchableOpacity, Text, ActivityIndicator} from 'react-native';
export function PrimaryButton({title,onPress,loading=false,disabled=false}) {
  return <TouchableOpacity onPress={onPress} disabled={disabled || loading} className={`rounded-xl bg-brand-500 py-4 px-5 items-center justify-center ${disabled || loading ? 'opacity-50' : 'active:bg-brand-700'}`}>
    {loading ? <ActivityIndicator color="#fff"/> : <Text className="text-white font-bold text-base">{title}</Text>}
  </TouchableOpacity>;
}
