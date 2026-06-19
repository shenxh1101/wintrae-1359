import React, { useState, useMemo } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { usePullDownRefresh } from '@tarojs/taro';
import styles from './index.module.scss';
import TaskCard from '@/components/TaskCard';
import FilterBar from '@/components/FilterBar';
import { useAppContext } from '@/store/AppContext';
import type { Task, AreaType, ServiceType, UrgencyLevel } from '@/types';

type AreaFilter = AreaType | 'all';
type TimeFilter = 'all' | 'today' | 'tomorrow' | 'week';
type UrgencyFilter = UrgencyLevel | 'all';
type ServiceFilter = ServiceType | 'all';

const areaOptions: { key: AreaFilter; label: string }[] = [
  { key: 'all', label: '全部区域' },
  { key: '东区', label: '东区' },
  { key: '西区', label: '西区' },
  { key: '南区', label: '南区' },
  { key: '北区', label: '北区' },
  { key: '中心区', label: '中心区' },
];

const timeOptions: { key: TimeFilter; label: string }[] = [
  { key: 'all', label: '全部时间' },
  { key: 'today', label: '今天' },
  { key: 'tomorrow', label: '明天' },
  { key: 'week', label: '本周' },
];

const urgencyOptions: { key: UrgencyFilter; label: string }[] = [
  { key: 'all', label: '全部等级' },
  { key: 'high', label: '紧急' },
  { key: 'medium', label: '一般' },
  { key: 'low', label: '普通' },
];

const serviceOptions: { key: ServiceFilter; label: string }[] = [
  { key: 'all', label: '全部类型' },
  { key: '生活照料', label: '生活照料' },
  { key: '医疗陪护', label: '医疗陪护' },
  { key: '代购代办', label: '代购代办' },
  { key: '心理疏导', label: '心理疏导' },
  { key: '家政清洁', label: '家政清洁' },
  { key: '送餐服务', label: '送餐服务' },
  { key: '便民维修', label: '便民维修' },
];

const TaskHallPage: React.FC = () => {
  const { tasks, currentVolunteer, setTasks } = useAppContext();

  const [areaFilter, setAreaFilter] = useState<AreaFilter>('all');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<UrgencyFilter>('all');
  const [serviceFilter, setServiceFilter] = useState<ServiceFilter>('all');

  usePullDownRefresh(() => {
    console.log('[TaskHall] pull down refresh');
    setTimeout(() => {
      Taro.stopPullDownRefresh();
      Taro.showToast({ title: '刷新成功', icon: 'success' });
    }, 800);
  });

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  const weekEnd = new Date(today);
  weekEnd.setDate(today.getDate() + 7);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (areaFilter !== 'all' && task.area !== areaFilter) return false;
      if (urgencyFilter !== 'all' && task.urgency !== urgencyFilter) return false;
      if (serviceFilter !== 'all' && task.serviceType !== serviceFilter) return false;
      if (timeFilter !== 'all') {
        const taskDate = task.scheduledDate;
        if (timeFilter === 'today' && taskDate !== todayStr) return false;
        if (timeFilter === 'tomorrow' && taskDate !== tomorrowStr) return false;
        if (timeFilter === 'week') {
          const tDate = new Date(taskDate);
          if (tDate < today || tDate > weekEnd) return false;
        }
      }
      return true;
    }).sort((a, b) => {
      const urgencyOrder = { high: 0, medium: 1, low: 2 };
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    });
  }, [tasks, areaFilter, timeFilter, urgencyFilter, serviceFilter]);

  const stats = useMemo(() => {
    const pending = tasks.filter(t => t.status === 'pending').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress' || t.status === 'assigned').length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    return { pending, inProgress, completed };
  }, [tasks]);

  const handleSignup = (task: Task) => {
    console.log('[TaskHall] signup task:', task.id);
    Taro.showModal({
      title: '确认报名',
      content: `确定要报名「${task.title}」任务吗？`,
      confirmText: '确认报名',
      confirmColor: '#FF7A45',
      success: (res) => {
        if (res.confirm) {
          const updatedTasks = tasks.map(t => {
            if (t.id === task.id) {
              return {
                ...t,
                status: 'assigned' as const,
                volunteerId: currentVolunteer.id,
                volunteerName: currentVolunteer.name
              };
            }
            return t;
          });
          setTasks(updatedTasks);
          Taro.showToast({ title: '报名成功', icon: 'success' });
        }
      }
    });
  };

  return (
    <ScrollView scrollY className={styles.pageContainer} enhanced showScrollbar={false}>
      <View className={styles.header}>
        <View className={styles.headerTop}>
          <View className={styles.greeting}>
            <View className={styles.avatar}>
              <Image className={styles.avatarImg} src={currentVolunteer.avatar} mode="aspectFill" />
            </View>
            <View className={styles.greetingText}>
              <Text className={styles.hello}>你好，志愿者</Text>
              <Text className={styles.userName}>{currentVolunteer.name}</Text>
            </View>
          </View>
          <View className={styles.headerBadge}>
            <Text className={styles.badgeText}>
              {currentVolunteer.role === 'admin' ? '🛡️ 管理员' : '❤️ 志愿者'}
            </Text>
          </View>
        </View>

        <View className={styles.statRow}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{stats.pending}</Text>
            <Text className={styles.statLabel}>待报名任务</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{stats.inProgress}</Text>
            <Text className={styles.statLabel}>进行中</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{stats.completed}</Text>
            <Text className={styles.statLabel}>已完成</Text>
          </View>
        </View>
      </View>

      <View className={styles.filterSection}>
        <View className={styles.filterCard}>
          <FilterBar
            title="📍 服务区域"
            options={areaOptions}
            value={areaFilter}
            onChange={(v) => setAreaFilter(v as AreaFilter)}
          />
          <FilterBar
            title="⏰ 时间范围"
            options={timeOptions}
            value={timeFilter}
            onChange={(v) => setTimeFilter(v as TimeFilter)}
          />
          <FilterBar
            title="🚨 紧急程度"
            options={urgencyOptions}
            value={urgencyFilter}
            onChange={(v) => setUrgencyFilter(v as UrgencyFilter)}
          />
          <FilterBar
            title="🎯 服务类型"
            options={serviceOptions}
            value={serviceFilter}
            onChange={(v) => setServiceFilter(v as ServiceFilter)}
            scrollable
          />
        </View>
      </View>

      <View className={styles.sectionTitle}>
        <View className={styles.titleLeft}>
          <Text className={styles.titleIcon}>📋</Text>
          <Text className={styles.titleText}>任务列表</Text>
        </View>
        <Text className={styles.titleCount}>共 {filteredTasks.length} 条</Text>
      </View>

      <View className={styles.taskList}>
        {filteredTasks.length === 0 ? (
          <View className={styles.emptyBox}>
            <Text className={styles.emptyIcon}>📭</Text>
            <Text className={styles.emptyText}>暂无符合条件的任务</Text>
          </View>
        ) : (
          filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
};

export default TaskHallPage;
