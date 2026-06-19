import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import classnames from 'classnames';

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  unit?: string;
  color?: 'primary' | 'success' | 'warning' | 'info';
  onClick?: () => void;
}

const colorMap = {
  primary: { bg: '#FFECE4', color: '#FF7A45' },
  success: { bg: '#E8F8E4', color: '#52C41A' },
  warning: { bg: '#FFF4D9', color: '#FAAD14' },
  info: { bg: '#E6F4FF', color: '#1890FF' },
};

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, unit, color = 'primary', onClick }) => {
  const colors = colorMap[color];

  return (
    <View className={styles.card} onClick={onClick}>
      <View className={styles.iconWrap} style={{ background: colors.bg }}>
        <Text className={styles.icon}>{icon}</Text>
      </View>
      <View className={styles.info}>
        <View className={styles.valueRow}>
          <Text className={styles.value} style={{ color: colors.color }}>{value}</Text>
          {unit && <Text className={styles.unit}>{unit}</Text>}
        </View>
        <Text className={styles.label}>{label}</Text>
      </View>
    </View>
  );
};

export default StatCard;
