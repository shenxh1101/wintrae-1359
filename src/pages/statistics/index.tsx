import React, { useState, useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useAppContext } from '@/store/AppContext';
import type { ServiceType, AreaType } from '@/types';

const SERVICE_ICONS: Record<ServiceType, string> = {
  '生活照料': '🛏️',
  '医疗陪护': '💊',
  '代购代办': '🛒',
  '心理疏导': '💬',
  '家政清洁': '🧹',
  '送餐服务': '🍱',
  '便民维修': '🔧',
};

const MONTH_NAMES = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

const StatisticsPage: React.FC = () => {
  const { tasks, records, pendingVolunteers } = useAppContext();
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState((now.getMonth()).toString());

  const currentMonthData = useMemo(() => {
    const year = parseInt(selectedYear);
    const month = parseInt(selectedMonth);

    const monthTasks = tasks.filter((t) => {
      const d = new Date(t.scheduledDate);
      return d.getFullYear() === year && d.getMonth() === month;
    });

    const monthRecords = records.filter((r) => {
      const d = new Date(r.arrivalTime);
      return d.getFullYear() === year && d.getMonth() === month;
    });

    const completedTasks = monthTasks.filter((t) => t.status === 'completed').length;
    const totalHours = monthRecords.reduce((sum, r) => sum + r.serviceDuration, 0);
    const activeVolunteers = new Set(monthRecords.map((r) => r.volunteerId)).size;

    return {
      totalTasks: monthTasks.length,
      completedTasks,
      totalHours: Math.round(totalHours / 60),
      activeVolunteers,
    };
  }, [tasks, records, selectedYear, selectedMonth]);

  const monthlyTrend = useMemo(() => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.getMonth();
      const year = date.getFullYear();

      const monthTasks = tasks.filter((t) => {
        const d = new Date(t.scheduledDate);
        return d.getFullYear() === year && d.getMonth() === month;
      });

      const monthRecords = records.filter((r) => {
        const d = new Date(r.arrivalTime);
        return d.getFullYear() === year && d.getMonth() === month;
      });

      const hours = Math.round(monthRecords.reduce((sum, r) => sum + r.serviceDuration, 0) / 60);

      data.push({
        month: MONTH_NAMES[month],
        tasks: monthTasks.length,
        hours,
      });
    }
    return data;
  }, [tasks, records]);

  const maxTasks = Math.max(...monthlyTrend.map((d) => d.tasks), 1);
  const maxHours = Math.max(...monthlyTrend.map((d) => d.hours), 1);

  const serviceTypeStats = useMemo(() => {
    const counts = new Map<ServiceType, number>();
    tasks.forEach((t) => {
      counts.set(t.serviceType, (counts.get(t.serviceType) || 0) + 1);
    });
    const result = Array.from(counts.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
    const max = Math.max(...result.map((r) => r.count), 1);
    return result.map((r) => ({ ...r, percentage: (r.count / max) * 100 }));
  }, [tasks]);

  const areaStats = useMemo(() => {
    const counts = new Map<AreaType, number>();
    tasks.forEach((t) => {
      counts.set(t.area, (counts.get(t.area) || 0) + 1);
    });
    const result = Array.from(counts.entries())
      .map(([area, count]) => ({ area, count }))
      .sort((a, b) => b.count - a.count);
    const max = Math.max(...result.map((r) => r.count), 1);
    return result.map((r) => ({ ...r, percentage: (r.count / max) * 100 }));
  }, [tasks]);

  const volunteerRank = useMemo(() => {
    const hoursMap = new Map<string, { name: string; hours: number; tasks: number }>();
    records.forEach((r) => {
      const existing = hoursMap.get(r.volunteerId) || { name: r.volunteerName, hours: 0, tasks: 0 };
      existing.hours += r.serviceDuration;
      existing.tasks += 1;
      hoursMap.set(r.volunteerId, existing);
    });
    const result = Array.from(hoursMap.values())
      .map((v) => ({ ...v, hours: Math.round(v.hours / 60) }))
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 5);
    const max = Math.max(...result.map((r) => r.hours), 1);
    return result.map((r) => ({ ...r, percentage: (r.hours / max) * 100 }));
  }, [records]);

  const handleYearChange = (e: any) => setSelectedYear(e.detail.value);
  const handleMonthChange = (e: any) => setSelectedMonth(e.detail.value);

  const handleExport = () => {
    Taro.showLoading({ title: '正在生成...' });
    setTimeout(() => {
      Taro.hideLoading();
      Taro.showModal({
        title: '导出成功',
        content: `${selectedYear}年${parseInt(selectedMonth) + 1}月度汇总已生成\n\n📊 任务总数：${currentMonthData.totalTasks}件\n✅ 已完成：${currentMonthData.completedTasks}件\n⏱️ 服务时长：${currentMonthData.totalHours}小时\n👥 参与志愿者：${currentMonthData.activeVolunteers}人\n\n文件已保存到系统下载目录`,
        showCancel: false,
        confirmColor: '#FF7A45',
      });
    }, 1500);
  };

  const getRankClass = (idx: number) => {
    if (idx === 0) return styles.rankNum1;
    if (idx === 1) return styles.rankNum2;
    if (idx === 2) return styles.rankNum3;
    return '';
  };

  const yearOptions = Array.from({ length: 5 }, (_, i) => (now.getFullYear() - i).toString());

  return (
    <View className={styles.pageContainer}>
      <View className={styles.pageHeader}>
        <View className={styles.headerTitle}>
          <Text className={styles.titleText}>📈 数据概览</Text>
          <View style={{ display: 'flex', gap: '16rpx' }}>
            <picker range={yearOptions} value={yearOptions.indexOf(selectedYear)} onChange={handleYearChange}>
              <View className={styles.monthPicker}>{selectedYear}年</View>
            </picker>
            <picker range={MONTH_NAMES} value={parseInt(selectedMonth)} onChange={handleMonthChange}>
              <View className={styles.monthPicker}>{MONTH_NAMES[parseInt(selectedMonth)]}</View>
            </picker>
          </View>
        </View>
        <View className={styles.statsGrid}>
          <View className={styles.statCard}>
            <Text className={styles.statValue}>{currentMonthData.totalTasks}</Text>
            <Text className={styles.statLabel}>任务总数</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statValue}>{currentMonthData.completedTasks}</Text>
            <Text className={styles.statLabel}>已完成</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statValue}>{currentMonthData.totalHours}</Text>
            <Text className={styles.statLabel}>服务时长(h)</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statValue}>{currentMonthData.activeVolunteers}</Text>
            <Text className={styles.statLabel}>参与志愿者</Text>
          </View>
        </View>
      </View>

      <View className={styles.card}>
        <View className={styles.cardHeader}>
          <View className={styles.cardTitle}>
            <Text className={styles.cardIcon}>📊</Text>
            <Text className={styles.cardTitleText}>月度趋势</Text>
          </View>
          <View className={styles.exportBtn} onClick={handleExport}>
            📥 导出汇总
          </View>
        </View>

        <View className={styles.chartContainer}>
          <View className={styles.chartBars}>
            {monthlyTrend.map((item) => (
              <View key={item.month} className={styles.barGroup}>
                <View className={styles.barWrapper}>
                  <Text className={styles.barValue}>{item.tasks}</Text>
                  <View
                    className={styles.bar}
                    style={{ height: `${(item.tasks / maxTasks) * 180 + 20}rpx` }}
                  />
                </View>
                <View className={styles.barWrapper}>
                  <Text className={styles.barValue}>{item.hours}</Text>
                  <View
                    className={styles.barHours}
                    style={{ height: `${(item.hours / maxHours) * 180 + 20}rpx` }}
                  />
                </View>
                <Text className={styles.barLabel}>{item.month}</Text>
              </View>
            ))}
          </View>

          <View className={styles.legend}>
            <View className={styles.legendItem}>
              <View className={classnames(styles.legendDot, styles.legendTasks)} />
              <Text>任务数</Text>
            </View>
            <View className={styles.legendItem}>
              <View className={classnames(styles.legendDot, styles.legendHours)} />
              <Text>服务时长(h)</Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.card}>
        <View className={styles.cardHeader}>
          <View className={styles.cardTitle}>
            <Text className={styles.cardIcon}>🏆</Text>
            <Text className={styles.cardTitleText}>志愿者排行</Text>
          </View>
        </View>

        {volunteerRank.length === 0 ? (
          <View style={{ textAlign: 'center', padding: '32rpx', color: '#86909C' }}>
            暂无排行数据
          </View>
        ) : (
          <View className={styles.rankList}>
            {volunteerRank.map((item, idx) => (
              <View key={idx} className={styles.rankItem}>
                <View className={classnames(styles.rankNum, getRankClass(idx))}>
                  {idx + 1}
                </View>
                <View className={styles.rankInfo}>
                  <Text className={styles.rankName}>{item.name}</Text>
                  <View className={styles.rankBar}>
                    <View
                      className={styles.rankFill}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </View>
                </View>
                <Text className={styles.rankValue}>{item.hours}h</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View className={styles.card}>
        <View className={styles.cardHeader}>
          <View className={styles.cardTitle}>
            <Text className={styles.cardIcon}>🎯</Text>
            <Text className={styles.cardTitleText}>服务类型分布</Text>
          </View>
        </View>

        {serviceTypeStats.map((item) => (
          <View key={item.type} className={styles.statRow}>
            <View className={styles.statRowLabel}>
              <Text className={styles.typeIcon}>{SERVICE_ICONS[item.type]}</Text>
              <Text>{item.type}</Text>
            </View>
            <View className={styles.statRowValue}>
              <View className={styles.progressMini}>
                <View
                  className={styles.progressFill}
                  style={{ width: `${item.percentage}%` }}
                />
              </View>
              <Text className={styles.countText}>{item.count}</Text>
            </View>
          </View>
        ))}
      </View>

      <View className={styles.card}>
        <View className={styles.cardHeader}>
          <View className={styles.cardTitle}>
            <Text className={styles.cardIcon}>📍</Text>
            <Text className={styles.cardTitleText}>区域任务分布</Text>
          </View>
        </View>

        {areaStats.map((item) => (
          <View key={item.area} className={styles.statRow}>
            <View className={styles.statRowLabel}>
              <Text className={styles.typeIcon}>🏘️</Text>
              <Text>{item.area}</Text>
            </View>
            <View className={styles.statRowValue}>
              <View className={styles.progressMini}>
                <View
                  className={styles.progressFill}
                  style={{ width: `${item.percentage}%` }}
                />
              </View>
              <Text className={styles.countText}>{item.count}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default StatisticsPage;
