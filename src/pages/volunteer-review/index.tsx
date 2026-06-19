import React, { useState, useMemo } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useAppContext } from '@/store/AppContext';
import type { Volunteer, VolunteerStatus } from '@/types';

type TabType = 'pending' | 'approved' | 'rejected';

const TABS: { value: TabType; label: string }[] = [
  { value: 'pending', label: '待审核' },
  { value: 'approved', label: '已通过' },
  { value: 'rejected', label: '已拒绝' },
];

const VolunteerReviewPage: React.FC = () => {
  const { pendingVolunteers, setPendingVolunteers } = useAppContext();
  const [activeTab, setActiveTab] = useState<TabType>('pending');

  const stats = useMemo(() => {
    return {
      pending: pendingVolunteers.filter((v) => v.status === 'pending').length,
      approved: pendingVolunteers.filter((v) => v.status === 'approved').length,
      rejected: pendingVolunteers.filter((v) => v.status === 'rejected').length,
      total: pendingVolunteers.length,
    };
  }, [pendingVolunteers]);

  const filteredList = useMemo(() => {
    return pendingVolunteers.filter((v) => v.status === activeTab);
  }, [pendingVolunteers, activeTab]);

  const handleApprove = (volunteer: Volunteer) => {
    Taro.showModal({
      title: '确认通过',
      content: `确定通过志愿者「${volunteer.name}」的申请吗？`,
      confirmColor: '#FF7A45',
      success: (res) => {
        if (res.confirm) {
          const updated = pendingVolunteers.map((v) =>
            v.id === volunteer.id ? { ...v, status: 'approved' as VolunteerStatus } : v
          );
          setPendingVolunteers(updated);
          Taro.showToast({ title: '已通过审核', icon: 'success' });
        }
      },
    });
  };

  const handleReject = (volunteer: Volunteer) => {
    Taro.showModal({
      title: '确认拒绝',
      content: `确定拒绝志愿者「${volunteer.name}」的申请吗？`,
      confirmColor: '#F53F3F',
      success: (res) => {
        if (res.confirm) {
          const updated = pendingVolunteers.map((v) =>
            v.id === volunteer.id ? { ...v, status: 'rejected' as VolunteerStatus } : v
          );
          setPendingVolunteers(updated);
          Taro.showToast({ title: '已拒绝申请', icon: 'none' });
        }
      },
    });
  };

  const getStatusClass = (status: VolunteerStatus) => {
    switch (status) {
      case 'pending':
        return styles.statusPending;
      case 'approved':
        return styles.statusApproved;
      case 'rejected':
        return styles.statusRejected;
      default:
        return '';
    }
  };

  const getStatusText = (status: VolunteerStatus) => {
    switch (status) {
      case 'pending':
        return '待审核';
      case 'approved':
        return '已通过';
      case 'rejected':
        return '已拒绝';
      default:
        return '';
    }
  };

  const renderCard = (volunteer: Volunteer) => (
    <View key={volunteer.id} className={styles.card}>
      <View className={styles.cardHeader}>
        <Image className={styles.avatar} src={volunteer.avatar} mode="aspectFill" />
        <View className={styles.headerInfo}>
          <View className={styles.nameRow}>
            <Text className={styles.name}>{volunteer.name}</Text>
            <View className={classnames(styles.statusBadge, getStatusClass(volunteer.status))}>
              {getStatusText(volunteer.status)}
            </View>
          </View>
          <Text className={styles.phone}>📞 {volunteer.phone}</Text>
        </View>
      </View>

      <View className={styles.infoGrid}>
        <View className={styles.infoBox}>
          <Text className={styles.infoLabel}>服务区域</Text>
          <Text className={styles.infoValue}>{volunteer.area}</Text>
        </View>
        <View className={styles.infoBox}>
          <Text className={styles.infoLabel}>申请日期</Text>
          <Text className={styles.infoValue}>{volunteer.joinDate}</Text>
        </View>
      </View>

      <View className={styles.skillsSection}>
        <Text className={styles.skillsTitle}>擅长技能</Text>
        <View className={styles.skillsList}>
          {volunteer.skills.map((skill) => (
            <View key={skill} className={styles.skillTag}>
              {skill}
            </View>
          ))}
        </View>
      </View>

      {volunteer.status === 'pending' && (
        <View className={styles.actionRow}>
          <View className={classnames(styles.btn, styles.btnReject)} onClick={() => handleReject(volunteer)}>
            拒绝
          </View>
          <View className={classnames(styles.btn, styles.btnApprove)} onClick={() => handleApprove(volunteer)}>
            通过审核
          </View>
        </View>
      )}

      {volunteer.status === 'rejected' && (
        <View className={styles.rejectNote}>
          ⚠️ 该志愿者申请已被拒绝，可联系管理员了解详情
        </View>
      )}
    </View>
  );

  return (
    <View className={styles.pageContainer}>
      <View className={styles.statsRow}>
        <View className={styles.statItem}>
          <Text className={classnames(styles.statValue, styles.statPending)}>{stats.pending}</Text>
          <Text className={styles.statLabel}>待审核</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={classnames(styles.statValue, styles.statApproved)}>{stats.approved}</Text>
          <Text className={styles.statLabel}>已通过</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statValue} style={{ color: '#86909C' }}>{stats.rejected}</Text>
          <Text className={styles.statLabel}>已拒绝</Text>
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
          <View className={styles.emptyIcon}>📭</View>
          <Text className={styles.emptyText}>暂无{activeTab === 'pending' ? '待审核' : activeTab === 'approved' ? '已通过' : '已拒绝'}的志愿者</Text>
        </View>
      ) : (
        filteredList.map(renderCard)
      )}
    </View>
  );
};

export default VolunteerReviewPage;
