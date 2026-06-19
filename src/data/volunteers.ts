import type { Volunteer, AreaType, ServiceType } from '@/types';

const serviceSkills: ServiceType[] = ['生活照料', '医疗陪护', '代购代办', '心理疏导', '家政清洁', '送餐服务', '便民维修'];
const areas: AreaType[] = ['东区', '西区', '南区', '北区', '中心区'];

export const mockCurrentVolunteer: Volunteer = {
  id: 'vol_1',
  name: '李明',
  phone: '138****8888',
  avatar: 'https://picsum.photos/id/64/200/200',
  role: 'admin',
  status: 'approved',
  area: '东区',
  skills: ['生活照料', '医疗陪护', '代购代办'],
  totalServiceHours: 186,
  totalTasks: 62,
  joinDate: '2024-03-15'
};

const volunteerNames = ['张伟', '刘洋', '陈静', '杨帆', '赵磊', '黄丽', '周涛', '吴敏'];

export const mockPendingVolunteers: Volunteer[] = Array.from({ length: 8 }, (_, i) => ({
  id: `pending_${i + 1}`,
  name: volunteerNames[i % volunteerNames.length],
  phone: `13${8 + i}****${(1000 + i * 123).toString().slice(-4)}`,
  avatar: `https://picsum.photos/id/${177 + i}/200/200`,
  role: 'volunteer',
  status: 'pending',
  area: areas[i % areas.length],
  skills: [serviceSkills[i % serviceSkills.length], serviceSkills[(i + 2) % serviceSkills.length]],
  totalServiceHours: 0,
  totalTasks: 0,
  joinDate: new Date(Date.now() - i * 86400000).toISOString().split('T')[0]
}));

export const mockAllVolunteers: Volunteer[] = [
  mockCurrentVolunteer,
  {
    id: 'vol_2',
    name: '王芳',
    phone: '139****6666',
    avatar: 'https://picsum.photos/id/91/200/200',
    role: 'volunteer',
    status: 'approved',
    area: '西区',
    skills: ['心理疏导', '家政清洁', '送餐服务'],
    totalServiceHours: 142,
    totalTasks: 48,
    joinDate: '2024-04-20'
  },
  {
    id: 'vol_3',
    name: '张伟',
    phone: '137****2222',
    avatar: 'https://picsum.photos/id/338/200/200',
    role: 'volunteer',
    status: 'approved',
    area: '南区',
    skills: ['便民维修', '代购代办', '家政清洁'],
    totalServiceHours: 98,
    totalTasks: 32,
    joinDate: '2024-05-10'
  }
];
