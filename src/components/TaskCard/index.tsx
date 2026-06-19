import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import StatusTag from '@/components/StatusTag';
import type { Task } from '@/types';
import { formatDate } from '@/utils';

interface TaskCardProps {
  task: Task;
  onClick?: (task: Task) => void;
  showAction?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick, showAction = true }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(task);
    } else {
      Taro.navigateTo({
        url: `/pages/task-detail/index?id=${task.id}`
      });
    }
  };

  return (
    <View className={styles.card} onClick={handleClick}>
      <View className={styles.header}>
        <View className={styles.titleRow}>
          <Text className={styles.title}>{task.title}</Text>
          <StatusTag type="task" value={task.status} size="sm" />
        </View>
        <View className={styles.tagRow}>
          <View className={styles.typeTag}>{task.serviceType}</View>
          <StatusTag type="urgency" value={task.urgency} size="sm" />
        </View>
      </View>

      <View className={styles.infoList}>
        <View className={styles.infoItem}>
          <Text className={styles.label}>📍</Text>
          <Text className={styles.value}>{task.address}</Text>
        </View>
        <View className={styles.infoItem}>
          <Text className={styles.label}>👴</Text>
          <Text className={styles.value}>{task.residentName} · {task.residentPhone}</Text>
        </View>
        <View className={styles.infoRow}>
          <View className={styles.infoItem}>
            <Text className={styles.label}>📅</Text>
            <Text className={styles.value}>{formatDate(task.scheduledDate)} {task.scheduledTime}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.label}>⏱️</Text>
            <Text className={styles.value}>约{task.estimatedDuration}分钟</Text>
          </View>
        </View>
      </View>

      {showAction && (
        <View className={styles.footer}>
          {task.status === 'pending' && (
            <View className={styles.primaryBtn}>
              <Text className={styles.btnText}>立即报名</Text>
            </View>
          )}
          {task.status === 'assigned' && task.volunteerName && (
            <Text className={styles.assigned}>已分配：{task.volunteerName}</Text>
          )}
          {(task.status === 'in_progress' || task.status === 'completed') && task.volunteerName && (
            <Text className={styles.assigned}>志愿者：{task.volunteerName}</Text>
          )}
          <View className={styles.arrow}>
            <Text>查看详情 →</Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default TaskCard;
