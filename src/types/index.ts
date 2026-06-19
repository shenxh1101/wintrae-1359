// 区域类型
export type AreaType = '东区' | '西区' | '南区' | '北区' | '中心区';

// 紧急程度
export type UrgencyLevel = 'high' | 'medium' | 'low';

// 服务类型
export type ServiceType = 
  | '生活照料'
  | '医疗陪护'
  | '代购代办'
  | '心理疏导'
  | '家政清洁'
  | '送餐服务'
  | '便民维修';

// 任务状态
export type TaskStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';

// 任务接口
export interface Task {
  id: string;
  title: string;
  residentName: string;
  residentPhone: string;
  address: string;
  area: AreaType;
  serviceType: ServiceType;
  urgency: UrgencyLevel;
  scheduledDate: string;
  scheduledTime: string;
  estimatedDuration: number;
  description: string;
  status: TaskStatus;
  volunteerId?: string;
  volunteerName?: string;
  createdAt: string;
  routeHint?: string;
}

// 志愿者角色
export type VolunteerRole = 'volunteer' | 'admin';

// 志愿者状态
export type VolunteerStatus = 'pending' | 'approved' | 'rejected';

// 志愿者接口
export interface Volunteer {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  role: VolunteerRole;
  status: VolunteerStatus;
  area: AreaType;
  skills: ServiceType[];
  totalServiceHours: number;
  totalTasks: number;
  joinDate: string;
}

// 探访记录接口
export interface VisitRecord {
  id: string;
  taskId: string;
  volunteerId: string;
  volunteerName: string;
  residentName: string;
  address: string;
  arrivalTime: string;
  departureTime?: string;
  serviceContent: string;
  photos: string[];
  abnormalSituation?: string;
  nextSuggestion?: string;
  serviceDuration: number;
  createdAt: string;
  abnormalHandled?: boolean;
  abnormalHandleNote?: string;
  abnormalHandledAt?: string;
  abnormalHandledBy?: string;
}

// 物资类型
export type SupplyCategory = '防护用品' | '药品' | '生活物资' | '便民工具';

// 物资接口
export interface Supply {
  id: string;
  name: string;
  category: SupplyCategory;
  unit: string;
  totalStock: number;
  availableStock: number;
  image?: string;
  description?: string;
}

// 物资领取/归还记录类型
export type SupplyRecordType = 'receive' | 'return';

// 物资领取/归还记录接口
export interface SupplyRecord {
  id: string;
  supplyId: string;
  supplyName: string;
  type: SupplyRecordType;
  quantity: number;
  volunteerId: string;
  volunteerName: string;
  taskId?: string;
  createdAt: string;
}

// 排班项接口
export interface ScheduleItem {
  id: string;
  date: string;
  tasks: Task[];
  shiftType?: '上午' | '下午' | '全天';
}

// 统计数据接口
export interface StatisticsData {
  totalTasks: number;
  completedTasks: number;
  totalServiceHours: number;
  totalVolunteers: number;
  monthlyData: {
    month: string;
    tasks: number;
    hours: number;
  }[];
  serviceTypeStats: {
    type: ServiceType;
    count: number;
  }[];
  areaStats: {
    area: AreaType;
    count: number;
  }[];
}

// 全局应用状态
export interface AppState {
  currentVolunteer: Volunteer;
  setCurrentVolunteer: (v: Volunteer) => void;
  tasks: Task[];
  setTasks: (t: Task[]) => void;
  records: VisitRecord[];
  setRecords: (r: VisitRecord[]) => void;
  supplies: Supply[];
  setSupplies: (s: Supply[]) => void;
  supplyRecords: SupplyRecord[];
  setSupplyRecords: (sr: SupplyRecord[]) => void;
  pendingVolunteers: Volunteer[];
  setPendingVolunteers: (pv: Volunteer[]) => void;
}
