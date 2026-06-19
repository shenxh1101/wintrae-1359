import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import type { VisitRecord } from '@/types';
import { formatDateTime, formatDuration } from '@/utils';

interface RecordCardProps {
  record: VisitRecord;
  onClick?: (record: VisitRecord) => void;
}

const RecordCard: React.FC<RecordCardProps> = ({ record, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(record);
    } else {
      Taro.navigateTo({
        url: `/pages/record-detail/index?id=${record.id}`
      });
    }
  };

  return (
    <View className={styles.card} onClick={handleClick}>
      <View className={styles.header}>
        <View className={styles.userInfo}>
          <View className={styles.avatar}>
            <Text className={styles.avatarIcon}>👴</Text>
          </View>
          <View className={styles.info}>
            <Text className={styles.name}>{record.residentName}</Text>
            <Text className={styles.address}>{record.address}</Text>
          </View>
        </View>
        <View className={styles.timeBox}>
          <Text className={styles.timeText}>{formatDateTime(record.arrivalTime)}</Text>
        </View>
      </View>

      <View className={styles.content}>
        <Text className={styles.contentText}>{record.serviceContent}</Text>
      </View>

      {record.photos.length > 0 && (
        <View className={styles.photoRow}>
          {record.photos.slice(0, 3).map((photo, idx) => (
            <Image
              key={idx}
              src={photo}
              mode="aspectFill"
              className={styles.photo}
            />
          ))}
          {record.photos.length > 3 && (
            <View className={styles.morePhoto}>
              <Text className={styles.moreText}>+{record.photos.length - 3}</Text>
            </View>
          )}
        </View>
      )}

      {record.abnormalSituation && (
        <View className={styles.abnormalBox}>
          <Text className={styles.abnormalLabel}>⚠️ 异常情况</Text>
          <Text className={styles.abnormalText}>{record.abnormalSituation}</Text>
        </View>
      )}

      <View className={styles.footer}>
        <View className={styles.meta}>
          <Text className={styles.volunteer}>志愿者：{record.volunteerName}</Text>
          <View className={styles.divider}></View>
          <Text className={styles.duration}>服务时长：{formatDuration(record.serviceDuration)}</Text>
        </View>
        <Text className={styles.detailLink}>详情 →</Text>
      </View>
    </View>
  );
};

export default RecordCard;
