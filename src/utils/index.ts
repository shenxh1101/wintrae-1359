import type { UrgencyLevel, TaskStatus, ServiceType } from '@/types';

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}月${day}日`;
};

export const formatDateTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${month}/${day} ${hours}:${minutes}`;
};

export const formatTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const getUrgencyText = (level: UrgencyLevel): string => {
  const map: Record<UrgencyLevel, string> = {
    high: '紧急',
    medium: '一般',
    low: '普通'
  };
  return map[level];
};

export const getUrgencyColor = (level: UrgencyLevel): string => {
  const map: Record<UrgencyLevel, string> = {
    high: '#F5222D',
    medium: '#FAAD14',
    low: '#52C41A'
  };
  return map[level];
};

export const getStatusText = (status: TaskStatus): string => {
  const map: Record<TaskStatus, string> = {
    pending: '待报名',
    assigned: '已分配',
    in_progress: '进行中',
    completed: '已完成',
    cancelled: '已取消'
  };
  return map[status];
};

export const getStatusColor = (status: TaskStatus): string => {
  const map: Record<TaskStatus, string> = {
    pending: '#FF7A45',
    assigned: '#1890FF',
    in_progress: '#FAAD14',
    completed: '#52C41A',
    cancelled: '#86909C'
  };
  return map[status];
};

export const getServiceTypeColor = (_type: ServiceType): string => {
  const colors = ['#FF7A45', '#1890FF', '#52C41A', '#722ED1', '#13C2C2', '#EB2F96', '#FA8C16'];
  const index = Math.floor(Math.random() * colors.length);
  return colors[index];
};

export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

export const getFirstDayOfMonth = (year: number, month: number): number => {
  return new Date(year, month, 1).getDay();
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes}分钟`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
};
