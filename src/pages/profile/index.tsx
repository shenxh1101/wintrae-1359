import React from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppContext } from '@/store/AppContext';
import { mockAllVolunteers } from '@/data/volunteers';

const ProfilePage: React.FC = () => {
  const { currentVolunteer, setCurrentVolunteer, tasks, records, pendingVolunteers } = useAppContext();

  const completedCount = tasks.filter(
    t => (t.volunteerId === currentVolunteer.id) && t.status === 'completed'
  ).length;

  const abnormalCount = records.filter(r => r.abnormalSituation && r.abnormalSituation.length > 0 && !r.abnormalHandled).length;

  const handleSwitchVolunteer = () => {
    const otherVolunteers = mockAllVolunteers.filter(v => v.id !== currentVolunteer.id);
    Taro.showActionSheet({
      itemList: otherVolunteers.map(v => `${v.name} · ${v.role === 'admin' ? '管理员' : '志愿者'} · ${v.area}`),
      success: (res) => {
        const selected = otherVolunteers[res.tapIndex];
        if (selected) {
          setCurrentVolunteer(selected);
          Taro.showToast({ title: `已切换到「${selected.name}」`, icon: 'success' });
        }
      }
    });
  };

  const menus = [
    {
      section: '志愿者功能',
      items: [
        {
          icon: '📋',
          iconBg: '#FFECE4',
          title: '我的任务',
          desc: `进行中 ${tasks.filter(t => t.volunteerId === currentVolunteer.id && (t.status === 'assigned' || t.status === 'in_progress')).length} 个`,
          onClick: () => Taro.switchTab({ url: '/pages/schedule/index' })
        },
        {
          icon: '📝',
          iconBg: '#E8F8E4',
          title: '我的记录',
          desc: `已提交 ${records.filter(r => r.volunteerId === currentVolunteer.id).length} 条`,
          onClick: () => Taro.switchTab({ url: '/pages/records/index' })
        },
        {
          icon: '📦',
          iconBg: '#E6F4FF',
          title: '物资领取',
          desc: '口罩、药品、米油等',
          onClick: () => Taro.switchTab({ url: '/pages/supplies/index' })
        },
        {
          icon: '💬',
          iconBg: '#F3E8FF',
          title: '异常反馈',
          desc: abnormalCount > 0 ? `${abnormalCount} 条待处理` : '暂无待处理',
          badge: abnormalCount > 0 ? abnormalCount : undefined,
          onClick: () => Taro.switchTab({ url: '/pages/records/index' })
        }
      ]
    }
  ];

  const adminMenus = [
    {
      icon: '�',
      iconBg: '#E6F4FF',
      title: '任务追踪看板',
      desc: '全状态任务跟踪与管理',
      onClick: () => Taro.navigateTo({ url: '/pages/task-tracking/index' })
    },
    {
      icon: '�📢',
      iconBg: '#FFECE4',
      title: '发布任务',
      desc: '新建居民探访任务',
      onClick: () => Taro.navigateTo({ url: '/pages/task-publish/index' })
    },
    {
      icon: '✅',
      iconBg: '#E8F8E4',
      title: '志愿者审核',
      desc: pendingVolunteers.length > 0 ? `${pendingVolunteers.length} 人待审核` : '暂无待审核',
      badge: pendingVolunteers.length > 0 ? pendingVolunteers.length : undefined,
      onClick: () => Taro.navigateTo({ url: '/pages/volunteer-review/index' })
    },
    {
      icon: '⚠️',
      iconBg: '#FFF4D9',
      title: '异常处理',
      desc: abnormalCount > 0 ? `${abnormalCount} 条待跟进` : '暂无异常',
      badge: abnormalCount > 0 ? abnormalCount : undefined,
      onClick: () => Taro.navigateTo({ url: '/pages/abnormal-handle/index' })
    },
    {
      icon: '�',
      iconBg: '#F3E8FF',
      title: '数据统计',
      desc: '服务时长 & 月度汇总',
      onClick: () => Taro.navigateTo({ url: '/pages/statistics/index' })
    }
  ];

  return (
    <ScrollView scrollY className={styles.pageContainer} enhanced showScrollbar={false}>
      <View className={styles.profileHeader}>
        <View className={styles.profileInfo}>
          <View className={styles.avatarWrap}>
            <Image className={styles.avatarImg} src={currentVolunteer.avatar} mode="aspectFill" />
          </View>
          <View className={styles.infoWrap}>
            <View className={styles.nameRow}>
              <Text className={styles.nameText}>{currentVolunteer.name}</Text>
              <View className={styles.roleBadge}>
                <Text className={styles.roleText}>
                  {currentVolunteer.role === 'admin' ? '🛡️ 管理员' : '❤️ 志愿者'}
                </Text>
              </View>
            </View>
            <Text className={styles.phoneText}>{currentVolunteer.phone}</Text>
            <Text className={styles.areaText}>📍 服务区域：{currentVolunteer.area}</Text>
          </View>
        </View>
        <View className={styles.switchBtn} onClick={handleSwitchVolunteer}>
          <Text className={styles.switchIcon}>🔄</Text>
          <Text className={styles.switchText}>切换身份</Text>
        </View>
      </View>

      <View className={styles.statsCard}>
        <View className={styles.profileStat}>
          <Text className={styles.profileStatValue}>
            {currentVolunteer.totalTasks}
            <Text className={styles.profileStatUnit}>次</Text>
          </Text>
          <Text className={styles.profileStatLabel}>累计任务</Text>
        </View>
        <View className={`${styles.profileStat} ${styles.statDivider}`}>
          <Text className={styles.profileStatValue}>
            {currentVolunteer.totalServiceHours}
            <Text className={styles.profileStatUnit}>h</Text>
          </Text>
          <Text className={styles.profileStatLabel}>服务时长</Text>
        </View>
        <View className={styles.profileStat}>
          <Text className={styles.profileStatValue}>
            {completedCount}
            <Text className={styles.profileStatUnit}>个</Text>
          </Text>
          <Text className={styles.profileStatLabel}>已完成</Text>
        </View>
      </View>

      <View className={styles.skillSection}>
        <Text className={styles.skillTitle}>💪 擅长服务类型</Text>
        <View className={styles.skillsWrap}>
          {currentVolunteer.skills.map(skill => (
            <View key={skill} className={styles.skillTag}>
              <Text className={styles.skillTagText}>{skill}</Text>
            </View>
          ))}
        </View>
      </View>

      {menus.map(section => (
        <View key={section.section} className={styles.sectionGroup}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionTitleIcon}>🎯</Text>
            <Text className={styles.sectionTitleText}>{section.section}</Text>
          </View>
          <View className={styles.menuCard}>
            {section.items.map(item => (
              <View key={item.title} className={styles.menuItem} onClick={item.onClick}>
                <View className={styles.menuIcon} style={{ background: item.iconBg }}>
                  <Text className={styles.menuIconText}>{item.icon}</Text>
                </View>
                <View className={styles.menuContent}>
                  <Text className={styles.menuTitle}>{item.title}</Text>
                  <Text className={styles.menuDesc}>{item.desc}</Text>
                </View>
                <View className={styles.menuExtra}>
                  {item.badge && (
                    <View className={styles.menuBadge}>
                      <Text className={styles.menuBadgeText}>{item.badge}</Text>
                    </View>
                  )}
                  <Text className={styles.menuArrow}>›</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      ))}

      {currentVolunteer.role === 'admin' && (
        <View className={styles.sectionGroup}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionTitleIcon}>🛡️</Text>
            <Text className={styles.sectionTitleText}>管理员功能</Text>
          </View>
          <View className={styles.menuCard}>
            {adminMenus.map(item => (
              <View key={item.title} className={styles.menuItem} onClick={item.onClick}>
                <View className={styles.menuIcon} style={{ background: item.iconBg }}>
                  <Text className={styles.menuIconText}>{item.icon}</Text>
                </View>
                <View className={styles.menuContent}>
                  <Text className={styles.menuTitle}>{item.title}</Text>
                  <Text className={styles.menuDesc}>{item.desc}</Text>
                </View>
                <View className={styles.menuExtra}>
                  {item.badge && (
                    <View className={styles.menuBadge}>
                      <Text className={styles.menuBadgeText}>{item.badge}</Text>
                    </View>
                  )}
                  <Text className={styles.menuArrow}>›</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default ProfilePage;
