import type { UrgencyLevel, TaskStatus, ServiceType, TaskFlowAction, ShiftType } from '@/types';

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}月${day}日`;
};

export const formatDateISO = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateTimeISO = (date: Date): string => {
  const dateStr = formatDateISO(date);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${dateStr} ${hours}:${minutes}`;
};

export const getShiftTypeFromTime = (timeStr: string): ShiftType => {
  const hour = parseInt(timeStr.split(':')[0]);
  if (hour < 12) return '上午';
  if (hour < 18) return '下午';
  return '全天';
};

export const getTaskFlowActionText = (action: TaskFlowAction): string => {
  const map: Record<TaskFlowAction, string> = {
    created: '任务创建',
    published: '任务发布',
    assigned: '直接指派',
    signup: '志愿者报名',
    started: '开始任务',
    completed: '完成任务',
    cancelled: '取消任务',
    exchange: '申请换班',
    exchanged: '换班成功',
    reopened: '重新开放报名',
    note: '管理员备注',
  };
  return map[action] || action;
};

export const getTaskFlowActionIcon = (action: TaskFlowAction): string => {
  const map: Record<TaskFlowAction, string> = {
    created: '📝',
    published: '📢',
    assigned: '👥',
    signup: '✅',
    started: '🚀',
    completed: '🏆',
    cancelled: '❌',
    exchange: '🔄',
    exchanged: '🔄',
    reopened: '🔓',
    note: '💬',
  };
  return map[action] || '📋';
};

export const generateFlowRecord = (
  taskId: string,
  action: TaskFlowAction,
  operator?: { id: string; name: string; role: 'admin' | 'volunteer' },
  options?: {
    remark?: string;
    previousVolunteerId?: string;
    previousVolunteerName?: string;
    newVolunteerId?: string;
    newVolunteerName?: string;
  }
) => ({
  id: generateId(),
  taskId,
  action,
  operatorId: operator?.id,
  operatorName: operator?.name,
  operatorRole: operator?.role,
  timestamp: new Date().toISOString(),
  remark: options?.remark,
  previousVolunteerId: options?.previousVolunteerId,
  previousVolunteerName: options?.previousVolunteerName,
  newVolunteerId: options?.newVolunteerId,
  newVolunteerName: options?.newVolunteerName,
});

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
