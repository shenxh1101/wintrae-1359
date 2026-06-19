import type { Task, AreaType, ServiceType, UrgencyLevel, TaskStatus } from '@/types';

const areas: AreaType[] = ['东区', '西区', '南区', '北区', '中心区'];
const serviceTypes: ServiceType[] = ['生活照料', '医疗陪护', '代购代办', '心理疏导', '家政清洁', '送餐服务', '便民维修'];
const urgencies: UrgencyLevel[] = ['high', 'medium', 'low'];
const statuses: TaskStatus[] = ['pending', 'assigned', 'in_progress', 'completed'];

const titles = [
  '独居老人日常探访',
  '帮助购买降压药品',
  '上门送餐服务',
  '陪同就医检查',
  '家电维修协助',
  '心理疏导陪伴',
  '家政清洁服务',
  '代缴水电费',
  '康复训练辅助',
  '节日关怀探访',
  '代购生活物资',
  '打扫卫生整理家务'
];

const residents = [
  { name: '王奶奶', phone: '138****1234', addr: '幸福小区12号楼3单元502' },
  { name: '李爷爷', phone: '139****5678', addr: '阳光花园8号楼2单元301' },
  { name: '张阿姨', phone: '137****9012', addr: '和谐家园5号楼1单元203' },
  { name: '刘大爷', phone: '136****3456', addr: '安康社区3号楼4单元601' },
  { name: '陈奶奶', phone: '135****7890', addr: '乐园小区15号楼2单元402' },
  { name: '赵爷爷', phone: '131****2345', addr: '新华里小区7号楼3单元102' },
  { name: '孙阿姨', phone: '132****6789', addr: '建设小区2号楼5单元303' },
  { name: '周大爷', phone: '133****0123', addr: '胜利路小区18号楼1单元505' }
];

const descriptions = [
  '老人行动不便，需要协助购买日常用品并陪伴聊天',
  '定期上门测量血压，了解身体状况',
  '需要帮忙去医院代开常用药品',
  '家中电灯损坏，需要协助联系维修',
  '孤寡老人，节日期间需要上门送关怀',
  '需要帮忙代购蔬菜水果等生活物资',
  '协助打扫房间，整理衣物',
  '陪同去社区医院进行例行体检',
  '老人独居，每日探访确认安全',
  '协助代缴水电费和燃气费'
];

const routeHints = [
  '从东门进入，直行约200米，左侧第3栋楼',
  '小区南门进入右转，停车场旁边的楼',
  '乘坐地铁1号线B出口，步行500米',
  '公交站下车后沿主路直行300米',
  '北门进入后第一个路口左转'
];

const today = new Date();

export const mockTasks: Task[] = Array.from({ length: 15 }, (_, i) => {
  const resident = residents[i % residents.length];
  const area = areas[i % areas.length];
  const status = statuses[i % statuses.length];
  const dateOffset = Math.floor(i / 3);
  const taskDate = new Date(today);
  taskDate.setDate(today.getDate() + dateOffset - 1);
  
  const hours = ['08:00', '09:30', '10:00', '14:00', '15:30', '16:00', '09:00', '11:00'];
  const duration = [30, 45, 60, 90, 120];

  return {
    id: `task_${i + 1}`,
    title: titles[i % titles.length],
    residentName: resident.name,
    residentPhone: resident.phone,
    address: `${area}${resident.addr}`,
    area,
    serviceType: serviceTypes[i % serviceTypes.length],
    urgency: urgencies[i % urgencies.length],
    scheduledDate: taskDate.toISOString().split('T')[0],
    scheduledTime: hours[i % hours.length],
    estimatedDuration: duration[i % duration.length],
    description: descriptions[i % descriptions.length],
    status,
    volunteerId: status === 'pending' ? undefined : i % 2 === 0 ? 'vol_1' : 'vol_2',
    volunteerName: status === 'pending' ? undefined : i % 2 === 0 ? '李明' : '王芳',
    createdAt: new Date(today.getTime() - i * 3600000).toISOString(),
    routeHint: routeHints[i % routeHints.length]
  };
});
