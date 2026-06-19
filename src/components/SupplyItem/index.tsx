import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import classnames from 'classnames';
import type { Supply } from '@/types';

interface SupplyItemProps {
  supply: Supply;
  onReceive?: (supply: Supply) => void;
  onReturn?: (supply: Supply) => void;
}

const SupplyItem: React.FC<SupplyItemProps> = ({ supply, onReceive, onReturn }) => {
  const stockPercent = Math.round((supply.availableStock / supply.totalStock) * 100);
  const isLow = stockPercent < 30;

  return (
    <View className={styles.card}>
      <View className={styles.header}>
        <View className={styles.iconBox}>
          <Text className={styles.icon}>
            {supply.category === '防护用品' ? '😷' : 
             supply.category === '药品' ? '💊' :
             supply.category === '生活物资' ? '🛒' : '🔧'}
          </Text>
        </View>
        <View className={styles.info}>
          <Text className={styles.name}>{supply.name}</Text>
          <Text className={styles.category}>{supply.category}</Text>
        </View>
      </View>

      {supply.description && (
        <Text className={styles.desc}>{supply.description}</Text>
      )}

      <View className={styles.stockSection}>
        <View className={styles.stockHeader}>
          <Text className={styles.stockLabel}>库存状态</Text>
          <Text className={classnames(styles.stockNum, isLow && styles.lowText)}>
            剩余 {supply.availableStock}/{supply.totalStock} {supply.unit}
          </Text>
        </View>
        <View className={styles.progressBar}>
          <View
            className={classnames(styles.progressFill, isLow && styles.lowFill)}
            style={{ width: `${stockPercent}%` }}
          ></View>
        </View>
      </View>

      <View className={styles.actions}>
        <View className={classnames(styles.btn, styles.returnBtn)} onClick={() => onReturn?.(supply)}>
          <Text className={styles.returnText}>归还</Text>
        </View>
        <View
          className={classnames(styles.btn, styles.receiveBtn, isLow && styles.disabledBtn)}
          onClick={() => {
            if (supply.availableStock > 0) onReceive?.(supply);
          }}
        >
          <Text className={styles.receiveText}>领取</Text>
        </View>
      </View>
    </View>
  );
};

export default SupplyItem;
