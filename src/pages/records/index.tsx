import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Input, Textarea, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import RecordCard from '@/components/RecordCard';
import { useAppContext } from '@/store/AppContext';
import { generateId } from '@/utils';
import type { VisitRecord } from '@/types';
import classnames from 'classnames';

type FilterType = 'all' | 'mine' | 'abnormal';

const RecordsPage: React.FC = () => {
  const { records, setRecords, currentVolunteer, tasks } = useAppContext();
  const [filter, setFilter] = useState<FilterType>('all');
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    residentName: '',
    address: '',
    serviceContent: '',
    abnormalSituation: '',
    nextSuggestion: '',
    taskId: ''
  });
  const [photos, setPhotos] = useState<string[]>([]);

  const myRecords = useMemo(() => {
    let list = records;
    if (filter === 'mine') {
      list = list.filter(r => r.volunteerId === currentVolunteer.id);
    } else if (filter === 'abnormal') {
      list = list.filter(r => r.abnormalSituation && r.abnormalSituation.length > 0);
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [records, filter, currentVolunteer]);

  const stats = useMemo(() => {
    const mine = records.filter(r => r.volunteerId === currentVolunteer.id);
    const total = mine.length;
    const totalHours = Math.round(mine.reduce((s, r) => s + r.serviceDuration, 0) / 60);
    const abnormal = records.filter(r => r.abnormalSituation && r.abnormalSituation.length > 0).length;
    return { total, totalHours, abnormal };
  }, [records, currentVolunteer]);

  const inProgressTasks = useMemo(() => {
    return tasks.filter(t =>
      (t.status === 'in_progress' || t.status === 'assigned') &&
      (t.volunteerId === currentVolunteer.id)
    );
  }, [tasks, currentVolunteer]);

  const resetForm = () => {
    setFormData({
      residentName: '',
      address: '',
      serviceContent: '',
      abnormalSituation: '',
      nextSuggestion: '',
      taskId: ''
    });
    setPhotos([]);
  };

  const handleAddPhoto = () => {
    Taro.chooseImage({
      count: 9 - photos.length,
      success: (res) => {
        const newPhotos = res.tempFilePaths || [];
        setPhotos([...photos, ...newPhotos]);
      },
      fail: () => {
        const mockPhoto = `https://picsum.photos/id/${300 + photos.length}/600/400`;
        setPhotos([...photos, mockPhoto]);
        Taro.showToast({ title: '已添加照片', icon: 'success' });
      }
    });
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!formData.residentName.trim()) {
      Taro.showToast({ title: '请输入居民姓名', icon: 'none' });
      return;
    }
    if (!formData.serviceContent.trim()) {
      Taro.showToast({ title: '请填写服务内容', icon: 'none' });
      return;
    }

    const now = new Date();
    const newRecord: VisitRecord = {
      id: generateId(),
      taskId: formData.taskId || undefined,
      volunteerId: currentVolunteer.id,
      volunteerName: currentVolunteer.name,
      residentName: formData.residentName,
      address: formData.address || '未填写地址',
      arrivalTime: now.toISOString(),
      departureTime: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
      serviceContent: formData.serviceContent,
      photos,
      abnormalSituation: formData.abnormalSituation,
      nextSuggestion: formData.nextSuggestion,
      serviceDuration: 60,
      createdAt: now.toISOString()
    };

    setRecords([newRecord, ...records]);
    Taro.showToast({ title: '记录提交成功', icon: 'success' });
    setShowForm(false);
    resetForm();
  };

  const fillFromTask = () => {
    if (inProgressTasks.length === 0) {
      Taro.showToast({ title: '暂无可关联任务', icon: 'none' });
      return;
    }
    const task = inProgressTasks[0];
    setFormData({
      ...formData,
      residentName: task.residentName,
      address: task.address,
      taskId: task.id
    });
    Taro.showToast({ title: '已自动填充', icon: 'success' });
  };

  const filterTabs = [
    { key: 'all' as const, label: '全部记录' },
    { key: 'mine' as const, label: '我的记录' },
    { key: 'abnormal' as const, label: '异常记录' },
  ];

  return (
    <View>
      <ScrollView scrollY className={styles.pageContainer} enhanced showScrollbar={false}>
        <View className={styles.header}>
          <View className={styles.headerTitle}>
            <Text className={styles.titleText}>探访记录</Text>
            <View className={styles.addBtn} onClick={() => setShowForm(true)}>
              <Text className={styles.addIcon}>✏️</Text>
              <Text className={styles.addText}>新建记录</Text>
            </View>
          </View>
          <View className={styles.statRow}>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>
                {stats.total}
                <Text className={styles.statUnit}>条</Text>
              </Text>
              <Text className={styles.statLabel}>我的记录</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>
                {stats.totalHours}
                <Text className={styles.statUnit}>h</Text>
              </Text>
              <Text className={styles.statLabel}>累计服务</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>
                {stats.abnormal}
                <Text className={styles.statUnit}>条</Text>
              </Text>
              <Text className={styles.statLabel}>异常情况</Text>
            </View>
          </View>
        </View>

        <View className={styles.filterTabs}>
          {filterTabs.map(tab => (
            <View
              key={tab.key}
              className={classnames(styles.tabItem, filter === tab.key && styles.tabActive)}
              onClick={() => setFilter(tab.key)}
            >
              <Text className={classnames(styles.tabText, filter === tab.key && styles.tabActiveText)}>
                {tab.label}
              </Text>
            </View>
          ))}
        </View>

        <View className={styles.recordList}>
          {myRecords.length === 0 ? (
            <View className={styles.emptyBox}>
              <Text className={styles.emptyIcon}>📝</Text>
              <Text className={styles.emptyText}>暂无探访记录</Text>
            </View>
          ) : (
            myRecords.map(record => (
              <RecordCard key={record.id} record={record} />
            ))
          )}
        </View>
      </ScrollView>

      {showForm && (
        <View className={styles.formOverlay} onClick={(e) => {
          if (e.target === e.currentTarget) setShowForm(false);
        }}>
          <View className={styles.formSheet}>
            <View className={styles.formHeader}>
              <Text className={styles.formTitle}>新建探访记录</Text>
              <View className={styles.closeBtn} onClick={() => { setShowForm(false); resetForm(); }}>
                <Text className={styles.closeText}>×</Text>
              </View>
            </View>
            <ScrollView scrollY className={styles.formBody} enhanced showScrollbar={false}>
              {inProgressTasks.length > 0 && (
                <View className={styles.formGroup}>
                  <View
                    className={styles.addBtn}
                    style={{ alignSelf: 'flex-start', padding: '12rpx 24rpx', background: '#E6F4FF' }}
                    onClick={fillFromTask}
                  >
                    <Text style={{ color: '#1890FF', fontSize: 24 }}>📋 从进行中任务自动填充</Text>
                  </View>
                </View>
              )}
              <View className={styles.formGroup}>
                <Text className={classnames(styles.formLabel, styles.formLabelRequired)}>居民姓名</Text>
                <Input
                  className={styles.formInput}
                  placeholder="请输入居民姓名"
                  value={formData.residentName}
                  onInput={(e) => setFormData({ ...formData, residentName: e.detail.value })}
                />
              </View>
              <View className={styles.formGroup}>
                <Text className={styles.formLabel}>探访地址</Text>
                <Input
                  className={styles.formInput}
                  placeholder="请输入探访地址"
                  value={formData.address}
                  onInput={(e) => setFormData({ ...formData, address: e.detail.value })}
                />
              </View>
              <View className={styles.formGroup}>
                <Text className={classnames(styles.formLabel, styles.formLabelRequired)}>服务内容</Text>
                <Textarea
                  className={styles.formTextarea}
                  placeholder="请详细记录本次服务内容..."
                  value={formData.serviceContent}
                  onInput={(e) => setFormData({ ...formData, serviceContent: e.detail.value })}
                />
              </View>
              <View className={styles.formGroup}>
                <Text className={styles.formLabel}>现场照片（最多9张）</Text>
                <View className={styles.photoGrid}>
                  {photos.map((photo, idx) => (
                    <View key={idx} className={styles.photoItem}>
                      <Image className={styles.photoImg} src={photo} mode="aspectFill" />
                      <View className={styles.photoRemove} onClick={() => handleRemovePhoto(idx)}>
                        <Text className={styles.removeIcon}>×</Text>
                      </View>
                    </View>
                  ))}
                  {photos.length < 9 && (
                    <View className={styles.photoAdd} onClick={handleAddPhoto}>
                      <Text className={styles.addPhotoIcon}>📷</Text>
                      <Text className={styles.addPhotoText}>添加照片</Text>
                    </View>
                  )}
                </View>
              </View>
              <View className={styles.formGroup}>
                <Text className={styles.formLabel}>异常情况（如有）</Text>
                <Textarea
                  className={styles.formTextarea}
                  placeholder="请记录发现的异常情况..."
                  value={formData.abnormalSituation}
                  onInput={(e) => setFormData({ ...formData, abnormalSituation: e.detail.value })}
                />
              </View>
              <View className={styles.formGroup}>
                <Text className={styles.formLabel}>下次跟进建议</Text>
                <Textarea
                  className={styles.formTextarea}
                  placeholder="请记录下次探访建议..."
                  value={formData.nextSuggestion}
                  onInput={(e) => setFormData({ ...formData, nextSuggestion: e.detail.value })}
                />
              </View>
            </ScrollView>
            <View className={styles.formFooter}>
              <View className={styles.submitBtn} onClick={handleSubmit}>
                <Text className={styles.submitBtnText}>提交记录</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default RecordsPage;
