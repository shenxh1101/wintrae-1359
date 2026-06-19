import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import classnames from 'classnames';
import type { TaskStatus, UrgencyLevel } from '@/types';
import { getStatusText, getStatusColor, getUrgencyText, getUrgencyColor } from '@/utils';

interface StatusTagProps {
  type: 'task' | 'urgency';
  value: TaskStatus | UrgencyLevel;
  size?: 'sm' | 'md';
}

const StatusTag: React.FC<StatusTagProps> = ({ type, value, size = 'md' }) => {
  const isTask = type === 'task';
  const text = isTask ? getStatusText(value as TaskStatus) : getUrgencyText(value as UrgencyLevel);
  const color = isTask ? getStatusColor(value as TaskStatus) : getUrgencyColor(value as UrgencyLevel);

  return (
    <View
      className={classnames(styles.tag, size === 'sm' && styles.tagSm)}
      style={{ backgroundColor: `${color}15`, color: color, borderColor: `${color}30` }}
    >
      <Text className={styles.dot} style={{ backgroundColor: color }}></Text>
      <Text className={styles.text}>{text}</Text>
    </View>
  );
};

export default StatusTag;
