import React, { useState } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import StatusTag from '@/components/StatusTag';
import { useAppContext } from '@/store/AppContext';
import { formatDate } from '@/utils';
import type { Task } from '@/types';

const TaskDetailPage: React.FC = () => {
  const router = useRouter();
  const taskId = router.params.id;
  const { tasks, setTasks, currentVolunteer } = useAppContext();
  const [task, setTask] = useState<Task | undefined>(tasks.find(t => t.id === taskId));

  useDidShow(() => {
    const fresh = tasks.find(t => t.id === taskId);
    setTask(fresh);
    console.log('[TaskDetail] show, taskId:', taskId);
  });

  if (!task) {
    return (
      <View className={styles.pageContainer}>
        <View className={styles.sectionCard}>
          <Text style={{ color: '#86909C' }}>任务不存在</Text>
        </View>
      </View>
    );
  }

  const isMyTask = task.volunteerId === currentVolunteer.id || task.volunteerName === currentVolunteer.name;

  const handleSignup = () => {
    Taro.showModal({
      title: '确认报名',
      content: `确定要报名「${task.title}」任务吗？`,
      confirmText: '确认报名',
      confirmColor: '#FF7A45',
      success: (res) => {
        if (res.confirm) {
          const updated = tasks.map(t =>
            t.id === task.id
              ? { ...t, status: 'assigned' as const, volunteerId: currentVolunteer.id, volunteerName: currentVolunteer.name }
              : t
          );
          setTasks(updated);
          setTask(updated.find(t => t.id === task.id));
          Taro.showToast({ title: '报名成功', icon: 'success' });
        }
      }
    });
  };

  const handleCancel = () => {
    Taro.showModal({
      title: '取消任务',
      content: '确定要取消此任务吗？取消后将重新开放报名。',
      confirmText: '确认取消',
      confirmColor: '#F5222D',
      success: (res) => {
        if (res.confirm) {
          const updated = tasks.map(t =>
            t.id === task.id
              ? { ...t, status: 'pending' as const, volunteerId: undefined, volunteerName: undefined }
              : t
          );
          setTasks(updated);
          setTask(updated.find(t => t.id === task.id));
          Taro.showToast({ title: '已取消', icon: 'success' });
        }
      }
    });
  };

  const handleExchange = () => {
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

  const handleNavigate = () => {
    Taro.showModal({
      title: '导航路线',
      content: `路线提示：${task.routeHint}\n\n是否打开地图导航？`,
      confirmText: '打开导航',
      confirmColor: '#1890FF',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '正在打开地图...', icon: 'loading' });
        }
      }
    });
  };

  const handleStart = () => {
    const updated = tasks.map(t =>
      t.id === task.id ? { ...t, status: 'in_progress' as const } : t
    );
    setTasks(updated);
    setTask(updated.find(t => t.id === task.id));
    Taro.showToast({ title: '任务已开始', icon: 'success' });
  };

  const handleComplete = () => {
    Taro.navigateTo({ url: '/pages/records/index' });
  };

  return (
    <View>
      <View className={styles.pageContainer}>
        <View className={styles.detailHeader}>
          <View className={styles.titleRow}>
            <Text className={styles.taskTitle}>{task.title}</Text>
            <StatusTag type="task" value={task.status} />
          </View>
          <View className={styles.tagRow}>
            <View className={styles.tagItem}>
              <Text>🎯 {task.serviceType}</Text>
            </View>
            <StatusTag type="urgency" value={task.urgency} />
            <View className={styles.tagItem}>
              <Text>📍 {task.area}</Text>
            </View>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>服务对象</Text>
            <Text className={styles.infoValue}>{task.residentName} · {task.residentPhone}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>详细地址</Text>
            <Text className={styles.infoValue}>{task.address}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>服务时间</Text>
            <Text className={styles.infoValue}>{formatDate(task.scheduledDate)} {task.scheduledTime}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>预计时长</Text>
            <Text className={styles.infoValue}>约 {task.estimatedDuration} 分钟</Text>
          </View>
        </View>

        <View className={styles.sectionCard}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>📝</Text>
            <Text className={styles.sectionTitleText}>任务描述</Text>
          </View>
          <Text className={styles.descText}>{task.description}</Text>
        </View>

        <View className={styles.sectionCard}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>🧭</Text>
            <Text className={styles.sectionTitleText}>路线提示</Text>
          </View>
          <View className={styles.routeBox}>
            <Text className={styles.routeLabel}>推荐路线</Text>
            <Text className={styles.routeText}>{task.routeHint || '暂无路线信息，请使用地图导航'}</Text>
          </View>
        </View>

        {task.volunteerName && (
          <View className={styles.sectionCard}>
            <View className={styles.sectionTitle}>
              <Text className={styles.sectionIcon}>👤</Text>
              <Text className={styles.sectionTitleText}>
                {isMyTask ? '我的信息' : '志愿者信息'}
              </Text>
            </View>
            <View className={styles.volunteerCard}>
              <View className={styles.volunteerAvatar}>
                <Image
                  className={styles.avatarImg}
                  src={isMyTask ? currentVolunteer.avatar : `https://picsum.photos/id/1027/200/200`}
                  mode="aspectFill"
                />
              </View>
              <View className={styles.volunteerInfo}>
                <Text className={styles.volunteerName}>
                  {task.volunteerName}
                  {isMyTask && '（我）'}
                </Text>
                <Text className={styles.volunteerMeta}>志愿者 · 已报名</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      <View className={styles.bottomBar}>
        {(task.status === 'pending') && (
          <>
            <View className={`${styles.bottomBtn} ${styles.secondaryBtn}`} onClick={handleNavigate}>
              <Text className={styles.secondaryBtnText}>🧭 查看路线</Text>
            </View>
            <View className={`${styles.bottomBtn} ${styles.primaryBtn}`} onClick={handleSignup}>
              <Text className={styles.primaryBtnText}>立即报名</Text>
            </View>
          </>
        )}
        {isMyTask && (task.status === 'assigned') && (
          <>
            <View className={`${styles.bottomBtn} ${styles.secondaryBtn}`} onClick={handleCancel}>
              <Text className={styles.secondaryBtnText}>取消任务</Text>
            </View>
            <View className={`${styles.bottomBtn} ${styles.secondaryBtn}`} onClick={handleExchange}>
              <Text className={styles.secondaryBtnText}>申请换班</Text>
            </View>
            <View className={`${styles.bottomBtn} ${styles.successBtn}`} onClick={handleStart}>
              <Text className={styles.primaryBtnText}>开始任务</Text>
            </View>
          </>
        )}
        {isMyTask && (task.status === 'in_progress') && (
          <>
            <View className={`${styles.bottomBtn} ${styles.secondaryBtn}`} onClick={handleNavigate}>
              <Text className={styles.secondaryBtnText}>🧭 导航</Text>
            </View>
            <View className={`${styles.bottomBtn} ${styles.primaryBtn}`} onClick={handleComplete}>
              <Text className={styles.primaryBtnText}>填写探访记录</Text>
            </View>
          </>
        )}
        {!isMyTask && task.status !== 'pending' && task.status !== 'completed' && (
          <View className={`${styles.bottomBtn} ${styles.primaryBtn}`} onClick={handleNavigate}>
            <Text className={styles.primaryBtnText}>🧭 查看路线</Text>
          </View>
        )}
        {task.status === 'completed' && (
          <View className={`${styles.bottomBtn} ${styles.secondaryBtn}`} style={{ flex: 1 }}>
            <Text className={styles.secondaryBtnText}>✓ 任务已完成</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default TaskDetailPage;
