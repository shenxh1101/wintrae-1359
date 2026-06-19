import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import ScheduleCalendar from '@/components/ScheduleCalendar';
import TaskCard from '@/components/TaskCard';
import { useAppContext } from '@/store/AppContext';
import { formatDate } from '@/utils';
import type { Task } from '@/types';

const SchedulePage: React.FC = () => {
  const { tasks, currentVolunteer, setTasks } = useAppContext();

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const [selectedDate, setSelectedDate] = useState(todayStr);

  useDidShow(() => {
    console.log('[Schedule] page show');
  });

  const myTasks = useMemo(() => {
    return tasks.filter((t) => t.volunteerId === currentVolunteer.id || t.volunteerName === currentVolunteer.name);
  }, [tasks, currentVolunteer]);

  const markedDates = useMemo(() => {
    return myTasks.map((t) => t.scheduledDate);
  }, [myTasks]);

  const selectedTasks = useMemo(() => {
    return myTasks
      .filter((t) => t.scheduledDate === selectedDate)
      .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
  }, [myTasks, selectedDate]);

  const summary = useMemo(() => {
    const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    const monthTasks = myTasks.filter((t) => t.scheduledDate.startsWith(monthPrefix));
    const total = monthTasks.length;
    const completed = monthTasks.filter((t) => t.status === 'completed').length;
    const pending = monthTasks.filter((t) => t.status === 'assigned' || t.status === 'in_progress').length;
    const totalHours = monthTasks.reduce((sum, t) => sum + (t.status === 'completed' ? t.estimatedDuration : 0), 0);
    return { total, completed, pending, totalHours: Math.round(totalHours / 60) };
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

  const handleCancel = (task: Task) => {
    Taro.showModal({
      title: '取消任务',
      content: `确定要取消「${task.title}」任务吗？取消后将重新开放报名。`,
      confirmText: '确认取消',
      confirmColor: '#F5222D',
      success: (res) => {
        if (res.confirm) {
          const updated = tasks.map((t) =>
            t.id === task.id
              ? { ...t, status: 'pending' as const, volunteerId: undefined, volunteerName: undefined }
              : t
          );
          setTasks(updated);
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
          const updated = tasks.map((t) =>
            t.id === task.id ? { ...t, status: 'in_progress' as const } : t
          );
          setTasks(updated);
          Taro.showToast({ title: '任务进行中', icon: 'success' });
        }
      }
    });
  };

  const renderTaskAction = (task: Task) => {
    if (task.status === 'cancelled' || task.status === 'completed') return null;
    return (
      <View className={styles.actionBtns}>
        <View className={`${styles.actionBtn} ${styles.cancelBtn}`} onClick={() => handleCancel(task)}>
          <Text className={styles.cancelBtnText}>取消任务</Text>
        </View>
        {task.status === 'assigned' && (
          <>
            <View className={`${styles.actionBtn} ${styles.exchangeBtn}`} onClick={() => handleExchange(task)}>
              <Text className={styles.exchangeBtnText}>申请换班</Text>
            </View>
            <View className={`${styles.actionBtn} ${styles.startBtn}`} onClick={() => handleStart(task)}>
              <Text className={styles.startBtnText}>开始任务</Text>
            </View>
          </>
        )}
        {task.status === 'in_progress' && (
          <View className={`${styles.actionBtn} ${styles.startBtn}`} onClick={() => Taro.navigateTo({ url: '/pages/records/index' })}>
            <Text className={styles.startBtnText}>填写记录</Text>
          </View>
        )}
      </View>
    );
  };

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
          <Text className={styles.summaryValue}>{summary.pending}</Text>
          <Text className={styles.summaryLabel}>待执行</Text>
        </View>
        <View className={styles.summaryItem}>
          <Text className={styles.summaryValue}>{summary.completed}</Text>
          <Text className={styles.summaryLabel}>已完成</Text>
        </View>
        <View className={styles.summaryItem}>
          <Text className={styles.summaryValue}>{summary.totalHours}</Text>
          <Text className={styles.summaryLabel}>服务小时</Text>
        </View>
      </View>

      <ScheduleCalendar
        year={year}
        month={month}
        selectedDate={selectedDate}
        markedDates={markedDates}
        onSelectDate={setSelectedDate}
      />

      <View className={styles.listHeader}>
        <View className={styles.listTitle}>
          <Text className={styles.titleIcon}>📅</Text>
          <Text className={styles.titleText}>当日排班</Text>
        </View>
        <Text className={styles.dateText}>{formatDate(selectedDate)}</Text>
      </View>

      {selectedTasks.length === 0 ? (
        <View className={styles.emptySchedule}>
          <Text className={styles.emptyIcon}>🌴</Text>
          <Text className={styles.emptyText}>当日暂无排班任务</Text>
          <View className={styles.goBtn} onClick={() => Taro.switchTab({ url: '/pages/task-hall/index' })}>
            <Text className={styles.goBtnText}>去任务大厅报名</Text>
          </View>
        </View>
      ) : (
        selectedTasks.map((task) => (
          <View key={task.id}>
            <TaskCard task={task} showAction={false} />
            {renderTaskAction(task)}
          </View>
        ))
      )}
    </ScrollView>
  );
};

export default SchedulePage;
