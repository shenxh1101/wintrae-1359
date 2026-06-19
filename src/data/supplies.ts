import type { Supply, SupplyRecord, SupplyCategory } from '@/types';

export const mockSupplies: Supply[] = [
  {
    id: 'sup_1',
    name: '医用外科口罩',
    category: '防护用品',
    unit: '只',
    totalStock: 500,
    availableStock: 320,
    description: '一次性医用外科口罩，三层防护'
  },
  {
    id: 'sup_2',
    name: 'N95防护口罩',
    category: '防护用品',
    unit: '只',
    totalStock: 200,
    availableStock: 85,
    description: 'N95级防护口罩'
  },
  {
    id: 'sup_3',
    name: '医用手套',
    category: '防护用品',
    unit: '副',
    totalStock: 300,
    availableStock: 180,
    description: '一次性医用检查手套'
  },
  {
    id: 'sup_4',
    name: '免洗手消毒液',
    category: '防护用品',
    unit: '瓶',
    totalStock: 100,
    availableStock: 45,
    description: '500ml装免洗手消毒凝胶'
  },
  {
    id: 'sup_5',
    name: '降压药（代文）',
    category: '药品',
    unit: '盒',
    totalStock: 50,
    availableStock: 23,
    description: '缬沙坦胶囊 80mg*28粒'
  },
  {
    id: 'sup_6',
    name: '感冒药（泰诺）',
    category: '药品',
    unit: '盒',
    totalStock: 80,
    availableStock: 52,
    description: '对乙酰氨基酚缓释片'
  },
  {
    id: 'sup_7',
    name: '创可贴',
    category: '药品',
    unit: '盒',
    totalStock: 100,
    availableStock: 78,
    description: '无菌创可贴100片装'
  },
  {
    id: 'sup_8',
    name: '体温计',
    category: '便民工具',
    unit: '支',
    totalStock: 30,
    availableStock: 18,
    description: '电子体温计'
  },
  {
    id: 'sup_9',
    name: '东北大米',
    category: '生活物资',
    unit: '袋',
    totalStock: 40,
    availableStock: 25,
    description: '10kg装优质东北大米'
  },
  {
    id: 'sup_10',
    name: '食用油',
    category: '生活物资',
    unit: '桶',
    totalStock: 30,
    availableStock: 17,
    description: '5L装非转基因食用油'
  },
  {
    id: 'sup_11',
    name: '面粉',
    category: '生活物资',
    unit: '袋',
    totalStock: 25,
    availableStock: 12,
    description: '5kg装特制一等面粉'
  },
  {
    id: 'sup_12',
    name: '工具箱套装',
    category: '便民工具',
    unit: '套',
    totalStock: 10,
    availableStock: 6,
    description: '家用维修基础工具箱'
  }
];

export const categories: SupplyCategory[] = ['防护用品', '药品', '生活物资', '便民工具'];

const today = new Date();

export const mockSupplyRecords: SupplyRecord[] = Array.from({ length: 12 }, (_, i) => {
  const recordDate = new Date(today);
  recordDate.setDate(today.getDate() - i);
  const isReceive = i % 3 !== 0;
  const supply = mockSupplies[i % mockSupplies.length];
  
  return {
    id: `sup_rec_${i + 1}`,
    supplyId: supply.id,
    supplyName: supply.name,
    type: isReceive ? 'receive' : 'return',
    quantity: isReceive ? (1 + (i % 5)) : 1,
    volunteerId: i % 2 === 0 ? 'vol_1' : 'vol_2',
    volunteerName: i % 2 === 0 ? '李明' : '王芳',
    taskId: `task_${(i % 15) + 1}`,
    createdAt: recordDate.toISOString()
  };
});
