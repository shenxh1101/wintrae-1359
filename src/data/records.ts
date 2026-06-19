import type { VisitRecord } from '@/types';

const today = new Date();

export const mockRecords: VisitRecord[] = Array.from({ length: 10 }, (_, i) => {
  const recordDate = new Date(today);
  recordDate.setDate(today.getDate() - i);
  recordDate.setHours(9 + (i % 6), (i * 15) % 60);
  
  const departureDate = new Date(recordDate);
  departureDate.setHours(recordDate.getHours() + 1, recordDate.getMinutes() + 30);

  const residents = ['王奶奶', '李爷爷', '张阿姨', '刘大爷', '陈奶奶', '赵爷爷', '孙阿姨', '周大爷'];
  const addresses = [
    '东区幸福小区12号楼3单元502',
    '西区阳光花园8号楼2单元301',
    '南区和谐家园5号楼1单元203',
    '北区安康社区3号楼4单元601',
    '中心区乐园小区15号楼2单元402'
  ];
  const contents = [
    '协助老人测量血压，血压正常。帮助打扫房间，更换床单被罩。陪老人聊天30分钟，心情愉快。',
    '陪同前往社区医院进行体检，各项指标正常。帮助取回体检报告并讲解注意事项。',
    '代为购买降压药、感冒药等常用药品。帮助整理药盒，标注服用时间。',
    '上门送餐，饭菜保温良好。协助用餐，确认老人饮食正常。',
    '检查家中水电设施，更换损坏灯泡。协助调试电视信号。',
    '协助缴纳水电费、燃气费。帮助整理月度账单，讲解消费明细。',
    '陪伴老人进行康复训练，活动关节。协助散步20分钟，状态良好。',
    '节日期间上门慰问，赠送礼品。帮助准备节日饭菜，共度佳节。',
    '协助购买米面油等生活物资，搬运上楼。检查冰箱食材存量。',
    '心理疏导服务，倾听老人讲述往事。引导积极情绪，预约下周探访。'
  ];
  const suggestions = [
    '建议下周继续探访，关注血压变化',
    '提醒按时服药，下次带点水果',
    '建议增加探访频次，老人比较孤独',
    '下次帮忙检查门窗安全',
    '协助预约下月体检',
    '需要购买冬季保暖用品',
    '',
    '建议家人多联系',
    '下次带些常用药品备用',
    ''
  ];
  const abnormals = [
    '',
    '',
    '老人反映最近睡眠不太好',
    '',
    '',
    '家中热水器出水温度偏低，建议检修',
    '',
    '',
    '',
    '老人情绪有些低落，需要多陪伴'
  ];

  return {
    id: `record_${i + 1}`,
    taskId: `task_${(i % 15) + 1}`,
    volunteerId: i % 2 === 0 ? 'vol_1' : 'vol_2',
    volunteerName: i % 2 === 0 ? '李明' : '王芳',
    residentName: residents[i % residents.length],
    address: addresses[i % addresses.length],
    arrivalTime: recordDate.toISOString(),
    departureTime: departureDate.toISOString(),
    serviceContent: contents[i % contents.length],
    photos: i % 3 === 0 
      ? [
          `https://picsum.photos/id/${100 + i}/600/400`,
          `https://picsum.photos/id/${101 + i}/600/400`
        ]
      : i % 3 === 1
        ? [`https://picsum.photos/id/${200 + i}/600/400`]
        : [],
    abnormalSituation: abnormals[i % abnormals.length],
    nextSuggestion: suggestions[i % suggestions.length],
    serviceDuration: 60 + (i % 3) * 30,
    createdAt: recordDate.toISOString()
  };
});
