import React, { useState } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useAppContext } from '@/store/AppContext';
import { formatDateTime, formatDuration } from '@/utils';
import type { VisitRecord } from '@/types';

const RecordDetailPage: React.FC = () => {
  const router = useRouter();
  const recordId = router.params.id;
  const { records } = useAppContext();
  const [record, setRecord] = useState<VisitRecord | undefined>(records.find(r => r.id === recordId));

  useDidShow(() => {
    setRecord(records.find(r => r.id === recordId));
  });

  if (!record) {
    return (
      <View className={styles.pageContainer}>
        <View className={styles.sectionCard}>
          <Text style={{ color: '#86909C' }}>记录不存在</Text>
        </View>
      </View>
    );
  }

  const handlePhotoPreview = (idx: number) => {
    Taro.previewImage({
      urls: record.photos,
      current: record.photos[idx],
    });
  };

  return (
    <View className={styles.pageContainer}>
      <View className={styles.residentCard}>
        <View className={styles.residentHeader}>
          <View className={styles.avatarBox}>
            <Text className={styles.avatarIcon}>👴</Text>
          </View>
          <View className={styles.residentInfo}>
            <Text className={styles.residentName}>{record.residentName}</Text>
            <Text className={styles.residentAddr}>📍 {record.address}</Text>
          </View>
        </View>
        <View className={styles.timeRow}>
          <View className={styles.timeBox}>
            <Text className={styles.timeLabel}>到达时间</Text>
            <Text className={styles.timeValue}>{formatDateTime(record.arrivalTime)}</Text>
          </View>
          <View className={styles.timeBox}>
            <Text className={styles.timeLabel}>离开时间</Text>
            <Text className={styles.timeValue}>
              {record.departureTime ? formatDateTime(record.departureTime) : '未填写'}
            </Text>
          </View>
        </View>
      </View>

      <View className={styles.sectionCard}>
        <View className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>📝</Text>
          <Text className={styles.sectionTitleText}>服务内容</Text>
        </View>
        <Text className={styles.contentText}>{record.serviceContent}</Text>
      </View>

      {record.photos.length > 0 && (
        <View className={styles.sectionCard}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>📷</Text>
            <Text className={styles.sectionTitleText}>现场照片</Text>
          </View>
          <View className={styles.photoGrid}>
            {record.photos.map((photo, idx) => (
              <View
                key={idx}
                className={styles.photoItem}
                onClick={() => handlePhotoPreview(idx)}
              >
                <Image className={styles.photoImg} src={photo} mode="aspectFill" />
              </View>
            ))}
          </View>
        </View>
      )}

      {record.abnormalSituation && (
        <View className={styles.sectionCard}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>⚠️</Text>
            <Text className={styles.sectionTitleText}>异常情况</Text>
          </View>
          <View className={styles.abnormalCard}>
            <Text className={styles.labelText}>发现异常</Text>
            <Text className={styles.bodyText}>{record.abnormalSituation}</Text>
          </View>
        </View>
      )}

      {record.nextSuggestion && (
        <View className={styles.sectionCard}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>💡</Text>
            <Text className={styles.sectionTitleText}>下次跟进建议</Text>
          </View>
          <View className={styles.suggestCard}>
            <Text className={classnames(styles.labelText, styles.suggestLabel)}>跟进建议</Text>
            <Text className={styles.bodyText}>{record.nextSuggestion}</Text>
          </View>
        </View>
      )}

      <View className={styles.sectionCard}>
        <View className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>👤</Text>
          <Text className={styles.sectionTitleText}>服务信息</Text>
        </View>
        <View className={styles.volunteerRow}>
          <View className={styles.volunteerInfo}>
            <Text>✅</Text>
            <Text className={styles.volunteerName}>志愿者：{record.volunteerName}</Text>
          </View>
          <Text className={styles.durationText}>
            服务时长：{formatDuration(record.serviceDuration)}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default RecordDetailPage;
