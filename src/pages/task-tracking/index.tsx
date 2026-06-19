import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import StatusTag from '@/components/StatusTag';
import { useAppContext } from '@/store/AppContext';
import { formatDate } from '@/utils';
import type { Task, TaskStatus } from '@/types';
import classnames from 'classnames';

type TabType = 'pending' | 'assigned' | 'in_progress' | 'abnormal' | 'completed' | 'cancelled';

const TABS: { value: TabType; label: string; icon: string; color: string }[] = [
  { value: 'pending', label: '待报名', icon: '📋', color: '#1890FF' },
  { value: 'assigned', label: '已指派', icon: '👥', color: '#722ED1' },
  { value: 'in_progress', label: '进行中', icon: '🚀', color: '#FA8C16' },
  { value: 'abnormal', label: '异常', icon: '⚠️', color: '#F5222D' },
  { value: 'completed', label: '已完成', icon: '✅', color: '#52C41A' },
  { value: 'cancelled', label: '已取消', icon: '❌', color: '#86909C' },
];

const TaskTrackingPage: React.FC = () => {
  const { tasks, records } = useAppContext();
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [refreshKey, setRefreshKey] = useState(0);

  useDidShow(() => {
    setRefreshKey(k => k + 1);
  });

  const abnormalTaskIds = useMemo(() => {
    const ids = new Set<string>();
    records.forEach(r => {
      if (r.abnormalSituation && r.abnormalSituation.length > 0 && r.taskId) {
        ids.add(r.taskId);
      }
    });
    return ids;
  }, [records, refreshKey]);

  const stats = useMemo(() => {
    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      assigned: tasks.filter(t => t.status === 'assigned').length,
      in_progress: tasks.filter(t => t.status === 'in_progress').length,
      abnormal: tasks.filter(t => abnormalTaskIds.has(t.id)).length,
      completed: tasks.filter(t => t.status === 'completed').length,
      cancelled: tasks.filter(t => t.status === 'cancelled').length,
    };
  }, [tasks, abnormalTaskIds, refreshKey]);

  const filteredTasks = useMemo(() => {
    if (activeTab === 'abnormal') {
      return tasks.filter(t => abnormalTaskIds.has(t.id));
    }
    return tasks.filter(t => t.status === activeTab);
  }, [tasks, activeTab, abnormalTaskIds, refreshKey]);

  const handleTaskClick = (task: Task) => {
    Taro.navigateTo({ url: `/pages/task-detail/index?id=${task.id}` });
  };

  const handleQuickNote = (task: Task, e: any) => {
    e.stopPropagation();
    Taro.navigateTo({ url: `/pages/task-detail/index?id=${task.id}&action=note` });
  };

  const handleQuickReassign = (task: Task, e: any) => {
    e.stopPropagation();
    Taro.navigateTo({ url: `/pages/task-detail/index?id=${task.id}&action=reassign` });
  };

  return (
    <View className={styles.pageContainer}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>任务追踪看板</Text>
        <Text className={styles.headerDesc}>共 {stats.total} 个任务</Text>
      </View>

      <View className={styles.statsRow}>
        {TABS.slice(0, 5).map(tab => (
          <View
            key={tab.value}
            className={classnames(
              styles.statCard,
              activeTab === tab.value && styles.statCardActive
            )}
            style={{ borderColor: activeTab === tab.value ? tab.color : 'transparent' }}
            onClick={() => setActiveTab(tab.value)}
          >
            <Text className={styles.statIcon}>{tab.icon}</Text>
            <Text className={styles.statValue} style={{ color: tab.color }}>
              {stats[tab.value as keyof typeof stats]}
            </Text>
            <Text className={styles.statLabel}>{tab.label}</Text>
          </View>
        ))}
      </View>

      <View className={styles.tabBar}>
        <ScrollView scrollX enhanced showScrollbar={false} className={styles.tabScroll}>
          {TABS.map(tab => (
            <View
              key={tab.value}
              className={classnames(
                styles.tabItem,
                activeTab === tab.value && styles.tabItemActive
              )}
              style={activeTab === tab.value ? { color: tab.color, borderColor: tab.color } : {}}
              onClick={() => setActiveTab(tab.value)}
            >
              <Text className={styles.tabIcon}>{tab.icon}</Text>
              <Text className={styles.tabLabel}>{tab.label}</Text>
              <View className={styles.tabBadge}>
                <Text className={styles.tabBadgeText}>
                  {stats[tab.value as keyof typeof stats]}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      <ScrollView scrollY className={styles.taskList} enhanced showScrollbar={false}>
        {filteredTasks.length === 0 ? (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📭</Text>
            <Text className={styles.emptyText}>暂无{TABS.find(t => t.value === activeTab)?.label}任务</Text>
          </View>
        ) : (
          filteredTasks.map(task => (
            <View key={task.id} className={styles.taskCard} onClick={() => handleTaskClick(task)}>
              <View className={styles.cardHeader}>
                <Text className={styles.taskTitle}>{task.title}</Text>
                <StatusTag type="task" value={task.status} />
              </View>

              <View className={styles.cardInfo}>
                <View className={styles.infoItem}>
                  <Text className={styles.infoIcon}>🏠</Text>
                  <Text className={styles.infoText}>{task.residentName} · {task.area}</Text>
                </View>
                <View className={styles.infoItem}>
                  <Text className={styles.infoIcon}>📅</Text>
                  <Text className={styles.infoText}>
                    {formatDate(task.scheduledDate)} {task.scheduledTime} · {task.shiftType}
                  </Text>
                </View>
                <View className={styles.infoItem}>
                  <Text className={styles.infoIcon}>🎯</Text>
                  <Text className={styles.infoText}>{task.serviceType}</Text>
                </View>
                {task.volunteerName && (
                  <View className={styles.infoItem}>
                    <Text className={styles.infoIcon}>👤</Text>
                    <Text className={styles.infoText}>志愿者：{task.volunteerName}</Text>
                  </View>
                )}
                {activeTab === 'abnormal' && (
                  <View className={styles.abnormalHint}>
                    <Text className={styles.abnormalHintIcon}>⚠️</Text>
                    <Text className={styles.abnormalHintText}>存在异常情况</Text>
                  </View>
                )}
              </View>

              <View className={styles.cardActions}>
                <View className={styles.actionBtn} onClick={(e) => handleQuickNote(task, e)}>
                  <Text className={styles.actionBtnIcon}>💬</Text>
                  <Text className={styles.actionBtnText}>追加备注</Text>
                </View>
                {(task.status === 'pending' || task.status === 'assigned' || task.status === 'in_progress') && (
                  <View className={`${styles.actionBtn} ${styles.actionBtnPrimary}`} onClick={(e) => handleQuickReassign(task, e)}>
                    <Text className={styles.actionBtnIconLight}>🔄</Text>
                    <Text className={styles.actionBtnTextLight}>调整志愿者</Text>
                  </View>
                )}
                <View className={styles.actionArrow}>
                  <Text className={styles.actionArrowText}>详情 ›</Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default TaskTrackingPage;
