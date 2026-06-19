import React, { useState, useMemo } from 'react';
import { View, Text, Textarea } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useAppContext } from '@/store/AppContext';
import { formatDateTime } from '@/utils';
import type { VisitRecord } from '@/types';

type TabType = 'pending' | 'handled';

const TABS: { value: TabType; label: string }[] = [
  { value: 'pending', label: '待处理' },
  { value: 'handled', label: '已处理' },
];

const AbnormalHandlePage: React.FC = () => {
  const { records, setRecords, currentVolunteer } = useAppContext();
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [showModal, setShowModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<VisitRecord | null>(null);
  const [handleNote, setHandleNote] = useState('');

  useDidShow(() => {});

  const abnormalRecords = useMemo(() => {
    return records.filter(r => r.abnormalSituation && r.abnormalSituation.length > 0);
  }, [records]);

  const stats = useMemo(() => {
    return {
      pending: abnormalRecords.filter(r => !r.abnormalHandled).length,
      handled: abnormalRecords.filter(r => r.abnormalHandled).length,
      total: abnormalRecords.length,
    };
  }, [abnormalRecords]);

  const filteredList = useMemo(() => {
    return abnormalRecords
      .filter(r => activeTab === 'pending' ? !r.abnormalHandled : r.abnormalHandled)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [abnormalRecords, activeTab]);

  const openHandleModal = (record: VisitRecord) => {
    setSelectedRecord(record);
    setHandleNote('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRecord(null);
    setHandleNote('');
  };

  const handleSubmit = () => {
    if (!selectedRecord) return;
    if (!handleNote.trim()) {
      Taro.showToast({ title: '请填写处理备注', icon: 'none' });
      return;
    }

    const updated = records.map(r => {
      if (r.id === selectedRecord.id) {
        return {
          ...r,
          abnormalHandled: true,
          abnormalHandleNote: handleNote.trim(),
          abnormalHandledAt: new Date().toISOString(),
          abnormalHandledBy: currentVolunteer.name,
        };
      }
      return r;
    });

    setRecords(updated);
    Taro.showToast({ title: '处理成功', icon: 'success' });
    closeModal();
  };

  const goToDetail = (record: VisitRecord) => {
    Taro.navigateTo({ url: `/pages/record-detail/index?id=${record.id}` });
  };

  const renderCard = (record: VisitRecord) => (
    <View key={record.id} className={styles.card}>
      <View className={styles.cardHeader}>
        <View className={styles.residentInfo}>
          <Text className={styles.residentName}>{record.residentName}</Text>
          <Text className={styles.metaRow}>👤 志愿者：{record.volunteerName}</Text>
          <Text className={styles.metaRow}>📍 {record.address}</Text>
          <Text className={styles.metaRow}>🕐 到达：{formatDateTime(record.arrivalTime)}</Text>
        </View>
        <View
          className={classnames(
            styles.statusBadge,
            record.abnormalHandled ? styles.statusHandled : styles.statusPending
          )}
        >
          {record.abnormalHandled ? '已处理' : '待处理'}
        </View>
      </View>

      <View className={styles.serviceContent}>
        <Text className={styles.serviceLabel}>服务内容</Text>
        <Text className={styles.serviceText}>{record.serviceContent}</Text>
      </View>

      <View className={styles.abnormalBox}>
        <Text className={styles.abnormalLabel}>⚠️ 异常情况</Text>
        <Text className={styles.abnormalText}>{record.abnormalSituation}</Text>
      </View>

      {record.abnormalHandled && record.abnormalHandleNote && (
        <View className={styles.handledBox}>
          <Text className={styles.handledLabel}>✅ 处理备注</Text>
          <Text className={styles.handledNote}>{record.abnormalHandleNote}</Text>
          <Text className={styles.handledMeta}>
            处理人：{record.abnormalHandledBy} · {record.abnormalHandledAt ? formatDateTime(record.abnormalHandledAt) : ''}
          </Text>
        </View>
      )}

      <View className={styles.actionRow}>
        <View className={classnames(styles.btn, styles.btnDetail)} onClick={() => goToDetail(record)}>
          查看详情
        </View>
        {!record.abnormalHandled && (
          <View className={classnames(styles.btn, styles.btnHandle)} onClick={() => openHandleModal(record)}>
            标记已处理
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View className={styles.pageContainer}>
      <View className={styles.statsRow}>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{stats.pending}</Text>
          <Text className={styles.statLabel}>待处理</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={classnames(styles.statValue, styles.statValueGreen)}>{stats.handled}</Text>
          <Text className={styles.statLabel}>已处理</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={classnames(styles.statValue, styles.statValueGray)}>{stats.total}</Text>
          <Text className={styles.statLabel}>异常总计</Text>
        </View>
      </View>

      <View className={styles.tabBar}>
        {TABS.map((tab) => (
          <View
            key={tab.value}
            className={classnames(
              styles.tabItem,
              activeTab === tab.value && styles.tabItemActive
            )}
            onClick={() => setActiveTab(tab.value)}
          >
            {tab.label}
            {tab.value === 'pending' && stats.pending > 0 && (
              <Text style={{ marginLeft: '8rpx' }}>({stats.pending})</Text>
            )}
          </View>
        ))}
      </View>

      {filteredList.length === 0 ? (
        <View className={styles.emptyState}>
          <View className={styles.emptyIcon}>🎉</View>
          <Text className={styles.emptyText}>
            {activeTab === 'pending' ? '暂无待处理的异常记录' : '暂无已处理的异常记录'}
          </Text>
        </View>
      ) : (
        filteredList.map(renderCard)
      )}

      {showModal && selectedRecord && (
        <View className={styles.modalOverlay} onClick={(e) => {
          if (e.target === e.currentTarget) closeModal();
        }}>
          <View className={styles.modalSheet}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>处理异常记录</Text>
              <View className={styles.modalClose} onClick={closeModal}>
                <Text className={styles.modalCloseText}>×</Text>
              </View>
            </View>

            <View className={styles.modalGroup}>
              <Text className={styles.modalLabel}>异常情况</Text>
              <View className={styles.modalAbnormalBox}>
                <Text className={styles.modalAbnormalText}>{selectedRecord.abnormalSituation}</Text>
              </View>
            </View>

            <View className={styles.modalGroup}>
              <Text className={styles.modalLabel}>服务对象：{selectedRecord.residentName}</Text>
            </View>

            <View className={styles.modalGroup}>
              <Text className={classnames(styles.modalLabel)}>* 处理备注</Text>
              <Textarea
                className={styles.modalTextarea}
                placeholder="请填写处理措施、跟进结果等备注信息..."
                value={handleNote}
                onInput={(e) => setHandleNote(e.detail.value)}
                maxlength={500}
              />
            </View>

            <View className={styles.modalFooter}>
              <View className={classnames(styles.modalBtn, styles.modalBtnCancel)} onClick={closeModal}>
                取消
              </View>
              <View className={classnames(styles.modalBtn, styles.modalBtnSubmit)} onClick={handleSubmit}>
                确认处理
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default AbnormalHandlePage;
