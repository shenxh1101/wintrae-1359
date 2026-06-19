import React, { useState, useMemo } from 'react';
import { View, Text, Input, Textarea, Picker } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useAppContext } from '@/store/AppContext';
import { generateId, formatDateISO, getShiftTypeFromTime, generateFlowRecord } from '@/utils';
import { mockAllVolunteers } from '@/data/volunteers';
import type { AreaType, ServiceType, UrgencyLevel, Task, TaskAssignType, Volunteer } from '@/types';

const AREAS: AreaType[] = ['东区', '西区', '南区', '北区', '中心区'];
const SERVICE_TYPES: ServiceType[] = ['生活照料', '医疗陪护', '代购代办', '心理疏导', '家政清洁', '送餐服务', '便民维修'];
const URGENCY_OPTIONS: { value: UrgencyLevel; label: string; className: string }[] = [
  { value: 'high', label: '紧急', className: styles.urgencyHigh },
  { value: 'medium', label: '普通', className: styles.urgencyMedium },
  { value: 'low', label: '一般', className: styles.urgencyLow },
];

const ASSIGN_OPTIONS: { value: TaskAssignType; label: string; desc: string }[] = [
  { value: 'open', label: '开放报名', desc: '发布到任务大厅，志愿者自主报名' },
  { value: 'assigned', label: '直接指派', desc: '指定志愿者，立即加入其排班' },
];

const TaskPublishPage: React.FC = () => {
  const { tasks, setTasks, currentVolunteer, pendingVolunteers } = useAppContext();

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
  const [assignType, setAssignType] = useState<TaskAssignType>('open');
  const [assignedVolunteerId, setAssignedVolunteerId] = useState<string>('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastPublishedTaskId, setLastPublishedTaskId] = useState<string>('');

  const volunteers: Volunteer[] = useMemo(() => {
    const allApproved = new Map<string, Volunteer>();
    
    mockAllVolunteers
      .filter(v => v.status === 'approved' && v.role === 'volunteer')
      .forEach(v => allApproved.set(v.id, v));
    
    pendingVolunteers
      .filter(v => v.status === 'approved' && v.role === 'volunteer')
      .forEach(v => allApproved.set(v.id, v));
    
    return Array.from(allApproved.values());
  }, [pendingVolunteers]);

  const volunteerNames = volunteers.map(v => `${v.name} · ${v.area}`);
  const selectedVolunteerIndex = volunteers.findIndex(v => v.id === assignedVolunteerId);

  const handleDateChange = (e: any) => setScheduledDate(e.detail.value);
  const handleTimeChange = (e: any) => setScheduledTime(e.detail.value);

  const handleVolunteerChange = (e: any) => {
    const idx = parseInt(e.detail.value);
    setAssignedVolunteerId(volunteers[idx]?.id || '');
  };

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
    if (assignType === 'assigned' && !assignedVolunteerId) {
      Taro.showToast({ title: '请选择指派的志愿者', icon: 'none' });
      return false;
    }
    return true;
  };

  const resetForm = () => {
    setTitle('');
    setResidentName('');
    setResidentPhone('');
    setAddress('');
    setArea('东区');
    setServiceType('生活照料');
    setUrgency('medium');
    setScheduledDate(formatDateISO(new Date()));
    setScheduledTime('09:00');
    setEstimatedDuration('60');
    setDescription('');
    setRouteHint('');
    setAssignType('open');
    setAssignedVolunteerId('');
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const taskId = generateId();
    const shiftType = getShiftTypeFromTime(scheduledTime);
    const assignedVolunteer = volunteers.find(v => v.id === assignedVolunteerId);

    const publisher = { 
      id: currentVolunteer.id, 
      name: currentVolunteer.name, 
      role: currentVolunteer.role as 'admin' | 'volunteer'
    };

    const flowRecords = [];
    flowRecords.push(generateFlowRecord(taskId, 'created', publisher, { remark: '任务信息录入' }));
    flowRecords.push(generateFlowRecord(taskId, 'published', publisher, { remark: '任务发布' }));

    if (assignType === 'assigned' && assignedVolunteer) {
      flowRecords.push(generateFlowRecord(taskId, 'assigned', publisher, {
        remark: '管理员直接指派任务',
        newVolunteerId: assignedVolunteer.id,
        newVolunteerName: assignedVolunteer.name,
      }));
    }

    const newTask: Task = {
      id: taskId,
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
      status: assignType === 'assigned' ? 'assigned' : 'pending',
      assignType,
      shiftType,
      publisherId: publisher.id,
      publisherName: publisher.name,
      volunteerId: assignedVolunteer?.id,
      volunteerName: assignedVolunteer?.name,
      createdAt: new Date().toISOString(),
      routeHint: routeHint.trim() || undefined,
      flowRecords,
    };

    setTasks([newTask, ...tasks]);
    setLastPublishedTaskId(taskId);
    setShowSuccessModal(true);
  };

  const handleViewTask = () => {
    setShowSuccessModal(false);
    Taro.redirectTo({ url: `/pages/task-detail/index?id=${lastPublishedTaskId}` });
  };

  const handleContinuePublish = () => {
    setShowSuccessModal(false);
    resetForm();
    Taro.pageScrollTo({ scrollTop: 0, duration: 300 });
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
            <Text className={styles.requiredMark}>*</Text>分配方式
          </Text>
          <View className={styles.assignGroup}>
            {ASSIGN_OPTIONS.map((opt) => (
              <View
                key={opt.value}
                className={classnames(
                  styles.assignItem,
                  assignType === opt.value && styles.assignItemActive
                )}
                onClick={() => setAssignType(opt.value)}
              >
                <View className={styles.assignItemHeader}>
                  <Text className={styles.assignItemIcon}>
                    {opt.value === 'open' ? '📢' : '👥'}
                  </Text>
                  <Text className={styles.assignItemLabel}>{opt.label}</Text>
                </View>
                <Text className={styles.assignItemDesc}>{opt.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {assignType === 'assigned' && (
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>
              <Text className={styles.requiredMark}>*</Text>指派志愿者
            </Text>
            <Picker
              mode="selector"
              range={volunteerNames}
              value={selectedVolunteerIndex >= 0 ? selectedVolunteerIndex : 0}
              onChange={handleVolunteerChange}
            >
              <View className={styles.formInput}>
                {assignedVolunteerId 
                  ? volunteers.find(v => v.id === assignedVolunteerId)?.name || '请选择志愿者'
                  : '请选择指派的志愿者'
                }
              </View>
            </Picker>
          </View>
        )}

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
            <Picker mode="date" value={scheduledDate} onChange={handleDateChange}>
              <View className={styles.formInput} style={{ lineHeight: '80rpx' }}>
                {scheduledDate}
              </View>
            </Picker>
          </View>

          <View className={classnames(styles.formItem, styles.timeItem)}>
            <Text className={styles.formLabel}>
              <Text className={styles.requiredMark}>*</Text>服务时间
            </Text>
            <Picker mode="time" value={scheduledTime} onChange={handleTimeChange}>
              <View className={styles.formInput} style={{ lineHeight: '80rpx' }}>
                {scheduledTime}
              </View>
            </Picker>
          </View>
        </View>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>
            班次类型（自动）
          </Text>
          <View className={styles.shiftBadge}>
            <Text className={styles.shiftBadgeText}>{getShiftTypeFromTime(scheduledTime)}</Text>
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

      {showSuccessModal && (
        <View className={styles.modalMask}>
          <View className={styles.modalContent}>
            <View className={styles.modalIcon}>✅</View>
            <Text className={styles.modalTitle}>发布成功</Text>
            <Text className={styles.modalDesc}>
              {assignType === 'assigned' 
                ? '任务已指派给志愿者并加入其排班' 
                : '任务已发布到任务大厅等待报名'
              }
            </Text>
            <View className={styles.modalButtons}>
              <View className={styles.modalBtnSecondary} onClick={handleContinuePublish}>
                继续发布
              </View>
              <View className={styles.modalBtnPrimary} onClick={handleViewTask}>
                查看任务
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default TaskPublishPage;
