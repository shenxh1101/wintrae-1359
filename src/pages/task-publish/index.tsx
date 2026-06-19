import React, { useState } from 'react';
import { View, Text, Input, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useAppContext } from '@/store/AppContext';
import { generateId, formatDateISO } from '@/utils';
import type { AreaType, ServiceType, UrgencyLevel, Task } from '@/types';

const AREAS: AreaType[] = ['东区', '西区', '南区', '北区', '中心区'];
const SERVICE_TYPES: ServiceType[] = ['生活照料', '医疗陪护', '代购代办', '心理疏导', '家政清洁', '送餐服务', '便民维修'];
const URGENCY_OPTIONS: { value: UrgencyLevel; label: string; className: string }[] = [
  { value: 'high', label: '紧急', className: styles.urgencyHigh },
  { value: 'medium', label: '普通', className: styles.urgencyMedium },
  { value: 'low', label: '一般', className: styles.urgencyLow },
];

const TaskPublishPage: React.FC = () => {
  const { tasks, setTasks } = useAppContext();

  const [title, setTitle] = useState('');
  const [residentName, setResidentName] = useState('');
  const [residentPhone, setResidentPhone] = useState('');
  const [address, setAddress] = useState('');
  const [area, setArea] = useState<AreaType>('东区');
  const [serviceType, setServiceType] = useState<ServiceType>('生活照料');
  const [urgency, setUrgency] = useState<UrgencyLevel>('medium');
  const [scheduledDate, setScheduledDate] = useState(formatDateISO(new Date()));
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [estimatedDuration, setEstimatedDuration] = useState('60');
  const [description, setDescription] = useState('');
  const [routeHint, setRouteHint] = useState('');

  const handleDateChange = (e: any) => setScheduledDate(e.detail.value);
  const handleTimeChange = (e: any) => setScheduledTime(e.detail.value);

  const validateForm = (): boolean => {
    if (!title.trim()) {
      Taro.showToast({ title: '请输入任务标题', icon: 'none' });
      return false;
    }
    if (!residentName.trim()) {
      Taro.showToast({ title: '请输入居民姓名', icon: 'none' });
      return false;
    }
    if (!residentPhone.trim()) {
      Taro.showToast({ title: '请输入联系电话', icon: 'none' });
      return false;
    }
    if (!address.trim()) {
      Taro.showToast({ title: '请输入详细地址', icon: 'none' });
      return false;
    }
    if (!description.trim()) {
      Taro.showToast({ title: '请输入任务描述', icon: 'none' });
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const newTask: Task = {
      id: generateId(),
      title: title.trim(),
      residentName: residentName.trim(),
      residentPhone: residentPhone.trim(),
      address: address.trim(),
      area,
      serviceType,
      urgency,
      scheduledDate,
      scheduledTime,
      estimatedDuration: parseInt(estimatedDuration) || 60,
      description: description.trim(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      routeHint: routeHint.trim() || undefined,
    };

    setTasks([newTask, ...tasks]);

    Taro.showModal({
      title: '发布成功',
      content: '任务已成功发布到任务大厅',
      showCancel: false,
      confirmColor: '#FF7A45',
      success: () => {
        Taro.navigateBack();
      },
    });
  };

  const handleCancel = () => {
    Taro.showModal({
      title: '确认取消',
      content: '取消后已填写的内容将丢失，是否继续？',
      confirmColor: '#FF7A45',
      success: (res) => {
        if (res.confirm) {
          Taro.navigateBack();
        }
      },
    });
  };

  return (
    <View className={styles.pageContainer}>
      <View className={styles.formSection}>
        <View className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>📋</Text>
          <Text className={styles.sectionTitleText}>基本信息</Text>
        </View>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>
            <Text className={styles.requiredMark}>*</Text>任务标题
          </Text>
          <Input
            className={styles.formInput}
            placeholder="请输入任务标题，如：帮助李奶奶购买药品"
            value={title}
            onInput={(e) => setTitle(e.detail.value)}
            maxlength={50}
          />
        </View>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>
            <Text className={styles.requiredMark}>*</Text>紧急程度
          </Text>
          <View className={styles.optionGroup}>
            {URGENCY_OPTIONS.map((opt) => (
              <View
                key={opt.value}
                className={classnames(
                  styles.optionItem,
                  urgency === opt.value && styles.optionItemActive,
                  urgency === opt.value && opt.className
                )}
                onClick={() => setUrgency(opt.value)}
              >
                {opt.label}
              </View>
            ))}
          </View>
        </View>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>
            <Text className={styles.requiredMark}>*</Text>服务类型
          </Text>
          <View className={styles.optionGroup}>
            {SERVICE_TYPES.map((type) => (
              <View
                key={type}
                className={classnames(
                  styles.optionItem,
                  serviceType === type && styles.optionItemActive
                )}
                onClick={() => setServiceType(type)}
              >
                {type}
              </View>
            ))}
          </View>
        </View>
      </View>

      <View className={styles.formSection}>
        <View className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>🏠</Text>
          <Text className={styles.sectionTitleText}>居民信息</Text>
        </View>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>
            <Text className={styles.requiredMark}>*</Text>居民姓名
          </Text>
          <Input
            className={styles.formInput}
            placeholder="请输入居民姓名"
            value={residentName}
            onInput={(e) => setResidentName(e.detail.value)}
          />
        </View>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>
            <Text className={styles.requiredMark}>*</Text>联系电话
          </Text>
          <Input
            className={styles.formInput}
            type="number"
            placeholder="请输入联系电话"
            value={residentPhone}
            onInput={(e) => setResidentPhone(e.detail.value)}
          />
        </View>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>
            <Text className={styles.requiredMark}>*</Text>所属区域
          </Text>
          <View className={styles.optionGroup}>
            {AREAS.map((a) => (
              <View
                key={a}
                className={classnames(
                  styles.optionItem,
                  area === a && styles.optionItemActive
                )}
                onClick={() => setArea(a)}
              >
                {a}
              </View>
            ))}
          </View>
        </View>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>
            <Text className={styles.requiredMark}>*</Text>详细地址
          </Text>
          <Input
            className={styles.formInput}
            placeholder="请输入详细地址，如：XX小区3栋2单元501"
            value={address}
            onInput={(e) => setAddress(e.detail.value)}
          />
        </View>
      </View>

      <View className={styles.formSection}>
        <View className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>🕐</Text>
          <Text className={styles.sectionTitleText}>时间安排</Text>
        </View>

        <View className={styles.timeRow}>
          <View className={classnames(styles.formItem, styles.timeItem)}>
            <Text className={styles.formLabel}>
              <Text className={styles.requiredMark}>*</Text>服务日期
            </Text>
            <picker mode="date" value={scheduledDate} onChange={handleDateChange}>
              <View className={styles.formInput} style={{ lineHeight: '80rpx' }}>
                {scheduledDate}
              </View>
            </picker>
          </View>

          <View className={classnames(styles.formItem, styles.timeItem)}>
            <Text className={styles.formLabel}>
              <Text className={styles.requiredMark}>*</Text>服务时间
            </Text>
            <picker mode="time" value={scheduledTime} onChange={handleTimeChange}>
              <View className={styles.formInput} style={{ lineHeight: '80rpx' }}>
                {scheduledTime}
              </View>
            </picker>
          </View>
        </View>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>
            <Text className={styles.requiredMark}>*</Text>预计时长（分钟）
          </Text>
          <Input
            className={styles.formInput}
            type="number"
            placeholder="请输入预计服务时长"
            value={estimatedDuration}
            onInput={(e) => setEstimatedDuration(e.detail.value)}
          />
        </View>
      </View>

      <View className={styles.formSection}>
        <View className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>📝</Text>
          <Text className={styles.sectionTitleText}>任务详情</Text>
        </View>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>
            <Text className={styles.requiredMark}>*</Text>任务描述
          </Text>
          <Textarea
            className={styles.formTextarea}
            placeholder="请详细描述任务内容、注意事项等"
            value={description}
            onInput={(e) => setDescription(e.detail.value)}
            maxlength={500}
          />
        </View>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>路线提示（选填）</Text>
          <Textarea
            className={styles.formTextarea}
            style={{ minHeight: '120rpx' }}
            placeholder="请输入路线提示，如：从东门进入，右转第三栋楼"
            value={routeHint}
            onInput={(e) => setRouteHint(e.detail.value)}
            maxlength={200}
          />
        </View>
      </View>

      <View className={styles.bottomBar}>
        <View className={styles.cancelBtn} onClick={handleCancel}>
          取消
        </View>
        <View className={styles.submitBtn} onClick={handleSubmit}>
          发布任务
        </View>
      </View>
    </View>
  );
};

export default TaskPublishPage;
