import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import ScheduleCalendar from '@/components/ScheduleCalendar';
import TaskCard from '@/components/TaskCard';
import { useAppContext } from '@/store/AppContext';
import { formatDate, generateFlowRecord } from '@/utils';
import type { Task, ShiftType, TaskStatus } from '@/types';
import classnames from 'classnames';

const SHIFT_ORDER: ShiftType[] = ['上午', '下午', '全天'];

const SHIFT_INFO: Record<ShiftType, { icon: string; desc: string }> = {
  '上午': { icon: '🌅', desc: '06:00 - 12:00' },
  '下午': { icon: '🌆', desc: '12:00 - 18:00' },
  '全天': { icon: '🌞', desc: '18:00以后或跨时段' },
};

type StatusFilter = 'all' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';

const STATUS_FILTERS: { value: StatusFilter; label: string; icon: string }[] = [
  { value: 'all', label: '全部', icon: '📋' },
  { value: 'assigned', label: '待执行', icon: '⏰' },
  { value: 'in_progress', label: '进行中', icon: '🚀' },
  { value: 'completed', label: '已完成', icon: '✅' },
  { value: 'cancelled', label: '已取消', icon: '❌' },
];

const SchedulePage: React.FC = () => {
  const { tasks, setTasks, currentVolunteer } = useAppContext();

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [refreshKey, setRefreshKey] = useState(0);

  useDidShow(() => {
    setRefreshKey(k => k + 1);
  });

  const myTasks = useMemo(() => {
    return tasks.filter((t) => t.volunteerId === currentVolunteer.id || t.volunteerName === currentVolunteer.name);
  }, [tasks, currentVolunteer, refreshKey]);

  const markedDates = useMemo(() => {
    if (statusFilter === 'all') {
      return myTasks.map((t) => t.scheduledDate);
    }
    return myTasks.filter(t => t.status === statusFilter).map((t) => t.scheduledDate);
  }, [myTasks, statusFilter]);

  const selectedTasks = useMemo(() => {
    let filtered = myTasks.filter((t) => t.scheduledDate === selectedDate);
    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.status === statusFilter);
    }
    return filtered.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
  }, [myTasks, selectedDate, statusFilter]);

  const groupedTasks = useMemo(() => {
    const groups: Record<ShiftType, Task[]> = {
      '上午': [],
      '下午': [],
      '全天': [],
    };
    selectedTasks.forEach(task => {
      groups[task.shiftType || '全天'].push(task);
    });
    return groups;
  }, [selectedTasks]);

  const summary = useMemo(() => {
    const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    const monthTasks = myTasks.filter((t) => t.scheduledDate.startsWith(monthPrefix));
    const total = monthTasks.length;
    const completed = monthTasks.filter((t) => t.status === 'completed').length;
    const assigned = monthTasks.filter((t) => t.status === 'assigned').length;
    const inProgress = monthTasks.filter((t) => t.status === 'in_progress').length;
    const totalHours = monthTasks.reduce((sum, t) => sum + (t.status === 'completed' ? t.estimatedDuration : 0), 0);
    return { total, completed, assigned, inProgress, totalHours: Math.round(totalHours / 60) };
  }, [myTasks, year, month]);

  const handlePrevMonth = () => {
    if (month === 0) {
      setYear(year - 1);
      setMonth(11);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setYear(year + 1);
      setMonth(0);
    } else {
      setMonth(month + 1);
    }
  };

  const handleTaskClick = (task: Task) => {
    Taro.navigateTo({ url: `/pages/task-detail/index?id=${task.id}` });
  };

  const handleCancel = (task: Task) => {
    Taro.showModal({
      title: '取消任务',
      content: `确定要取消「${task.title}」任务吗？取消后将重新开放报名。`,
      confirmText: '确认取消',
      confirmColor: '#F5222D',
      success: (res) => {
        if (res.confirm) {
          const operator = { id: currentVolunteer.id, name: currentVolunteer.name, role: currentVolunteer.role as 'admin' | 'volunteer' };
          const cancelRecord = generateFlowRecord(task.id, 'cancelled', operator, {
            remark: '志愿者取消任务，重新开放报名',
            previousVolunteerId: task.volunteerId,
            previousVolunteerName: task.volunteerName,
          });
          const reopenRecord = generateFlowRecord(task.id, 'reopened', operator, {
            remark: '任务重新开放报名',
          });
          const updated = tasks.map((t) =>
            t.id === task.id
              ? { 
                  ...t, 
                  status: 'pending' as const, 
                  volunteerId: undefined, 
                  volunteerName: undefined,
                  flowRecords: [...t.flowRecords, cancelRecord, reopenRecord]
                }
              : t
          );
          setTasks(updated);
          setRefreshKey(k => k + 1);
          Taro.showToast({ title: '已取消任务', icon: 'success' });
        }
      }
    });
  };

  const handleExchange = (task: Task) => {
    Taro.showActionSheet({
      itemList: ['与其他志愿者换班', '调整到其他时间'],
      success: (res) => {
        if (res.tapIndex === 0) {
          const operator = { id: currentVolunteer.id, name: currentVolunteer.name, role: currentVolunteer.role as 'admin' | 'volunteer' };
          const exchangeRecord = generateFlowRecord(task.id, 'exchange', operator, {
            remark: '志愿者申请换班，等待新志愿者接手',
            previousVolunteerId: task.volunteerId,
            previousVolunteerName: task.volunteerName,
          });
          const updated = tasks.map((t) =>
            t.id === task.id
              ? { ...t, flowRecords: [...t.flowRecords, exchangeRecord] }
              : t
          );
          setTasks(updated);
          setRefreshKey(k => k + 1);
          Taro.showToast({ title: '换班申请已提交', icon: 'success' });
        } else {
          Taro.showToast({ title: '请联系管理员调整', icon: 'none' });
        }
      }
    });
  };

  const handleStart = (task: Task) => {
    Taro.showModal({
      title: '开始任务',
      content: `确定要开始「${task.title}」任务吗？开始后将记录服务时长。`,
      confirmText: '开始',
      confirmColor: '#52C41A',
      success: (res) => {
        if (res.confirm) {
          const operator = { id: currentVolunteer.id, name: currentVolunteer.name, role: currentVolunteer.role as 'admin' | 'volunteer' };
          const startRecord = generateFlowRecord(task.id, 'started', operator, {
            remark: '志愿者开始服务',
          });
          const updated = tasks.map((t) =>
            t.id === task.id 
              ? { 
                  ...t, 
                  status: 'in_progress' as const,
                  flowRecords: [...t.flowRecords, startRecord]
                } 
              : t
          );
          setTasks(updated);
          setRefreshKey(k => k + 1);
          Taro.showToast({ title: '任务进行中', icon: 'success' });
        }
      }
    });
  };

  const renderTaskAction = (task: Task) => {
    if (task.status === 'cancelled' || task.status === 'completed') return null;
    return (
      <View className={styles.actionBtns}>
        <View className={`${styles.actionBtn} ${styles.cancelBtn}`} onClick={(e) => { e.stopPropagation(); handleCancel(task); }}>
          <Text className={styles.cancelBtnText}>取消任务</Text>
        </View>
        {task.status === 'assigned' && (
          <>
            <View className={`${styles.actionBtn} ${styles.exchangeBtn}`} onClick={(e) => { e.stopPropagation(); handleExchange(task); }}>
              <Text className={styles.exchangeBtnText}>申请换班</Text>
            </View>
            <View className={`${styles.actionBtn} ${styles.startBtn}`} onClick={(e) => { e.stopPropagation(); handleStart(task); }}>
              <Text className={styles.startBtnText}>开始任务</Text>
            </View>
          </>
        )}
        {task.status === 'in_progress' && (
          <View className={`${styles.actionBtn} ${styles.startBtn}`} onClick={(e) => { e.stopPropagation(); Taro.navigateTo({ url: `/pages/records/index?taskId=${task.id}` }); }}>
            <Text className={styles.startBtnText}>填写记录</Text>
          </View>
        )}
      </View>
    );
  };

  const hasTasks = selectedTasks.length > 0;

  return (
    <ScrollView scrollY className={styles.pageContainer} enhanced showScrollbar={false}>
      <View className={styles.monthHeader}>
        <View className={styles.navBtn} onClick={handlePrevMonth}>
          <Text className={styles.navIcon}>‹</Text>
        </View>
        <Text className={styles.monthTitle}>{year}年{month + 1}月</Text>
        <View className={styles.navBtn} onClick={handleNextMonth}>
          <Text className={styles.navIcon}>›</Text>
        </View>
      </View>

      <View className={styles.summaryRow}>
        <View className={styles.summaryItem}>
          <Text className={styles.summaryValue}>{summary.total}</Text>
          <Text className={styles.summaryLabel}>本月排班</Text>
        </View>
        <View className={styles.summaryItem}>
          <Text className={styles.summaryValue}>{summary.assigned}</Text>
          <Text className={styles.summaryLabel}>待执行</Text>
        </View>
        <View className={styles.summaryItem}>
          <Text className={styles.summaryValue}>{summary.inProgress}</Text>
          <Text className={styles.summaryLabel}>进行中</Text>
        </View>
        <View className={styles.summaryItem}>
          <Text className={styles.summaryValue}>{summary.completed}</Text>
          <Text className={styles.summaryLabel}>已完成</Text>
        </View>
      </View>

      <ScheduleCalendar
        year={year}
        month={month}
        selectedDate={selectedDate}
        markedDates={markedDates}
        onSelectDate={setSelectedDate}
      />

      <View className={styles.statusFilterBar}>
        <ScrollView scrollX enhanced showScrollbar={false} className={styles.filterScroll}>
          {STATUS_FILTERS.map(filter => (
            <View
              key={filter.value}
              className={classnames(
                styles.statusFilterItem,
                statusFilter === filter.value && styles.statusFilterItemActive
              )}
              onClick={() => setStatusFilter(filter.value)}
            >
              <Text className={styles.filterIcon}>{filter.icon}</Text>
              <Text className={styles.filterLabel}>{filter.label}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <View className={styles.listHeader}>
        <View className={styles.listTitle}>
          <Text className={styles.titleIcon}>📅</Text>
          <Text className={styles.titleText}>当日排班</Text>
        </View>
        <Text className={styles.dateText}>{formatDate(selectedDate)}</Text>
      </View>

      {!hasTasks ? (
        <View className={styles.emptySchedule}>
          <Text className={styles.emptyIcon}>🌴</Text>
          <Text className={styles.emptyText}>当日暂无排班任务</Text>
          <View className={styles.goBtn} onClick={() => Taro.switchTab({ url: '/pages/task-hall/index' })}>
            <Text className={styles.goBtnText}>去任务大厅报名</Text>
          </View>
        </View>
      ) : (
        <View>
          {SHIFT_ORDER.map(shiftType => {
            const shiftTasks = groupedTasks[shiftType];
            if (shiftTasks.length === 0) return null;
            const info = SHIFT_INFO[shiftType];
            return (
              <View key={shiftType} className={styles.shiftGroup}>
                <View className={styles.shiftHeader}>
                  <Text className={styles.shiftIcon}>{info.icon}</Text>
                  <Text className={styles.shiftName}>{shiftType}</Text>
                  <Text className={styles.shiftDesc}>{info.desc}</Text>
                  <View className={styles.shiftCount}>
                    <Text className={styles.shiftCountText}>{shiftTasks.length}项</Text>
                  </View>
                </View>
                {shiftTasks.map((task) => (
                  <View key={task.id} onClick={() => handleTaskClick(task)}>
                    <TaskCard task={task} showAction={false} />
                    {renderTaskAction(task)}
                  </View>
                ))}
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
};

export default SchedulePage;
