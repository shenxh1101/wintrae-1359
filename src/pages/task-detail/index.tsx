import React, { useState } from 'react';
import { View, Text, Image, Textarea } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import StatusTag from '@/components/StatusTag';
import { useAppContext } from '@/store/AppContext';
import { formatDate, getTaskFlowActionText, getTaskFlowActionIcon, generateFlowRecord, formatDateTime } from '@/utils';
import type { Task, TaskFlowRecord } from '@/types';

const TaskDetailPage: React.FC = () => {
  const router = useRouter();
  const taskId = router.params.id;
  const { tasks, setTasks, currentVolunteer } = useAppContext();
  const [task, setTask] = useState<Task | undefined>(tasks.find(t => t.id === taskId));
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteText, setNoteText] = useState('');

  useDidShow(() => {
    const fresh = tasks.find(t => t.id === taskId);
    setTask(fresh);
  });

  if (!task) {
    return (
      <View className={styles.pageContainer}>
        <View className={styles.sectionCard}>
          <Text style={{ color: '#86909C' }}>任务不存在</Text>
        </View>
      </View>
    );
  }

  const isMyTask = task.volunteerId === currentVolunteer.id || task.volunteerName === currentVolunteer.name;
  const operator = { id: currentVolunteer.id, name: currentVolunteer.name, role: currentVolunteer.role as 'admin' | 'volunteer' };

  const addFlowRecord = (newRecord: TaskFlowRecord) => {
    const updated = tasks.map(t =>
      t.id === task.id
        ? { ...t, flowRecords: [...t.flowRecords, newRecord] }
        : t
    );
    setTasks(updated);
    setTask(updated.find(t => t.id === task.id));
  };

  const handleSignup = () => {
    Taro.showModal({
      title: '确认报名',
      content: `确定要报名「${task.title}」任务吗？`,
      confirmText: '确认报名',
      confirmColor: '#FF7A45',
      success: (res) => {
        if (res.confirm) {
          const signupRecord = generateFlowRecord(task.id, 'signup', operator, {
            remark: '志愿者自主报名',
            newVolunteerId: currentVolunteer.id,
            newVolunteerName: currentVolunteer.name,
          });
          const updated = tasks.map(t =>
            t.id === task.id
              ? { 
                  ...t, 
                  status: 'assigned' as const, 
                  volunteerId: currentVolunteer.id, 
                  volunteerName: currentVolunteer.name,
                  flowRecords: [...t.flowRecords, signupRecord]
                }
              : t
          );
          setTasks(updated);
          setTask(updated.find(t => t.id === task.id));
          Taro.showToast({ title: '报名成功', icon: 'success' });
        }
      }
    });
  };

  const handleCancel = () => {
    Taro.showModal({
      title: '取消任务',
      content: '确定要取消此任务吗？取消后将重新开放报名。',
      confirmText: '确认取消',
      confirmColor: '#F5222D',
      success: (res) => {
        if (res.confirm) {
          const cancelRecord = generateFlowRecord(task.id, 'cancelled', operator, {
            remark: '志愿者取消任务，重新开放报名',
            previousVolunteerId: task.volunteerId,
            previousVolunteerName: task.volunteerName,
          });
          const reopenRecord = generateFlowRecord(task.id, 'reopened', operator, {
            remark: '任务重新开放报名',
          });
          const updated = tasks.map(t =>
            t.id === task.id
              ? { 
                  ...t, 
                  status: 'pending' as const, 
                  volunteerId: undefined, 
                  volunteerName: undefined,
                  flowRecords: [...t.flowRecords, cancelRecord, reopenRecord]
                }
              : t
          );
          setTasks(updated);
          setTask(updated.find(t => t.id === task.id));
          Taro.showToast({ title: '已取消', icon: 'success' });
        }
      }
    });
  };

  const handleExchange = () => {
    Taro.showActionSheet({
      itemList: ['与其他志愿者换班', '调整到其他时间'],
      success: (res) => {
        if (res.tapIndex === 0) {
          const exchangeRecord = generateFlowRecord(task.id, 'exchange', operator, {
            remark: '志愿者申请换班，等待新志愿者接手',
            previousVolunteerId: task.volunteerId,
            previousVolunteerName: task.volunteerName,
          });
          const updated = tasks.map(t =>
            t.id === task.id
              ? { ...t, flowRecords: [...t.flowRecords, exchangeRecord] }
              : t
          );
          setTasks(updated);
          setTask(updated.find(t => t.id === task.id));
          Taro.showToast({ title: '换班申请已提交', icon: 'success' });
        } else {
          Taro.showToast({ title: '请联系管理员调整', icon: 'none' });
        }
      }
    });
  };

  const handleNavigate = () => {
    Taro.showModal({
      title: '导航路线',
      content: `路线提示：${task.routeHint}\n\n是否打开地图导航？`,
      confirmText: '打开导航',
      confirmColor: '#1890FF',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '正在打开地图...', icon: 'loading' });
        }
      }
    });
  };

  const handleStart = () => {
    const startRecord = generateFlowRecord(task.id, 'started', operator, {
      remark: '志愿者开始服务',
    });
    const updated = tasks.map(t =>
      t.id === task.id 
        ? { 
            ...t, 
            status: 'in_progress' as const,
            flowRecords: [...t.flowRecords, startRecord]
          } 
        : t
    );
    setTasks(updated);
    setTask(updated.find(t => t.id === task.id));
    Taro.showToast({ title: '任务已开始', icon: 'success' });
  };

  const handleComplete = () => {
    Taro.navigateTo({ url: `/pages/records/index?taskId=${task.id}` });
  };

  const sortedFlowRecords = [...task.flowRecords].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const handleAddNote = () => {
    if (!noteText.trim()) {
      Taro.showToast({ title: '请输入备注内容', icon: 'none' });
      return;
    }
    const operator = { id: currentVolunteer.id, name: currentVolunteer.name, role: currentVolunteer.role as 'admin' | 'volunteer' };
    const noteRecord = generateFlowRecord(task.id, 'note', operator, {
      remark: noteText.trim(),
    });
    const updated = tasks.map(t =>
      t.id === task.id
        ? { ...t, flowRecords: [...t.flowRecords, noteRecord] }
        : t
    );
    setTasks(updated);
    setTask(updated.find(t => t.id === task.id));
    setNoteText('');
    setShowNoteInput(false);
    Taro.showToast({ title: '备注已添加', icon: 'success' });
  };

  return (
    <View>
      <View className={styles.pageContainer}>
        <View className={styles.detailHeader}>
          <View className={styles.titleRow}>
            <Text className={styles.taskTitle}>{task.title}</Text>
            <StatusTag type="task" value={task.status} />
          </View>
          <View className={styles.tagRow}>
            <View className={styles.tagItem}>
              <Text>🎯 {task.serviceType}</Text>
            </View>
            <StatusTag type="urgency" value={task.urgency} />
            <View className={styles.tagItem}>
              <Text>📍 {task.area}</Text>
            </View>
            <View className={styles.tagItem}>
              <Text>🕐 {task.shiftType}</Text>
            </View>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>发布人</Text>
            <Text className={styles.infoValue}>{task.publisherName}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>服务对象</Text>
            <Text className={styles.infoValue}>{task.residentName} · {task.residentPhone}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>详细地址</Text>
            <Text className={styles.infoValue}>{task.address}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>服务时间</Text>
            <Text className={styles.infoValue}>{formatDate(task.scheduledDate)} {task.scheduledTime} · {task.shiftType}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>预计时长</Text>
            <Text className={styles.infoValue}>约 {task.estimatedDuration} 分钟</Text>
          </View>
        </View>

        <View className={styles.sectionCard}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>📝</Text>
            <Text className={styles.sectionTitleText}>任务描述</Text>
          </View>
          <Text className={styles.descText}>{task.description}</Text>
        </View>

        <View className={styles.sectionCard}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>🧭</Text>
            <Text className={styles.sectionTitleText}>路线提示</Text>
          </View>
          <View className={styles.routeBox}>
            <Text className={styles.routeLabel}>推荐路线</Text>
            <Text className={styles.routeText}>{task.routeHint || '暂无路线信息，请使用地图导航'}</Text>
          </View>
        </View>

        {task.volunteerName && (
          <View className={styles.sectionCard}>
            <View className={styles.sectionTitle}>
              <Text className={styles.sectionIcon}>👤</Text>
              <Text className={styles.sectionTitleText}>
                {isMyTask ? '我的信息' : '志愿者信息'}
              </Text>
            </View>
            <View className={styles.volunteerCard}>
              <View className={styles.volunteerAvatar}>
                <Image
                  className={styles.avatarImg}
                  src={isMyTask ? currentVolunteer.avatar : `https://picsum.photos/id/1027/200/200`}
                  mode="aspectFill"
                />
              </View>
              <View className={styles.volunteerInfo}>
                <Text className={styles.volunteerName}>
                  {task.volunteerName}
                  {isMyTask && '（我）'}
                </Text>
                <Text className={styles.volunteerMeta}>志愿者 · 已报名</Text>
              </View>
            </View>
          </View>
        )}

        <View className={styles.sectionCard}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>📜</Text>
            <Text className={styles.sectionTitleText}>流转记录</Text>
            <Text className={styles.sectionCount}>{sortedFlowRecords.length}条</Text>
            {currentVolunteer.role === 'admin' && !showNoteInput && (
              <View className={styles.addNoteBtn} onClick={() => setShowNoteInput(true)}>
                <Text className={styles.addNoteIcon}>＋</Text>
                <Text className={styles.addNoteText}>追加备注</Text>
              </View>
            )}
          </View>
          {currentVolunteer.role === 'admin' && showNoteInput && (
            <View className={styles.noteInputBox}>
              <Textarea
                className={styles.noteTextarea}
                placeholder="请输入备注内容，如：电话确认、临时调整时间、上门前提醒等"
                value={noteText}
                onInput={(e) => setNoteText(e.detail.value)}
                maxlength={200}
                autoHeight
              />
              <View className={styles.noteInputActions}>
                <View className={styles.noteCancelBtn} onClick={() => { setShowNoteInput(false); setNoteText(''); }}>
                  <Text className={styles.noteCancelText}>取消</Text>
                </View>
                <View className={styles.noteSubmitBtn} onClick={handleAddNote}>
                  <Text className={styles.noteSubmitText}>提交备注</Text>
                </View>
              </View>
            </View>
          )}
          <View className={styles.flowTimeline}>
            {sortedFlowRecords.map((record, index) => (
              <View key={record.id} className={`${styles.flowItem} ${record.action === 'note' ? styles.flowItemNote : ''}`}>
                <View className={`${styles.flowDot} ${record.action === 'note' ? styles.flowDotNote : ''}`}>
                  <Text className={styles.flowIcon}>{getTaskFlowActionIcon(record.action)}</Text>
                </View>
                {index < sortedFlowRecords.length - 1 && <View className={`${styles.flowLine} ${record.action === 'note' ? styles.flowLineNote : ''}`} />}
                <View className={styles.flowContent}>
                  <View className={styles.flowHeader}>
                    <Text className={`${styles.flowAction} ${record.action === 'note' ? styles.flowActionNote : ''}`}>
                      {getTaskFlowActionText(record.action)}
                    </Text>
                    <Text className={styles.flowTime}>{formatDateTime(record.timestamp)}</Text>
                  </View>
                  {record.operatorName && (
                    <Text className={styles.flowOperator}>
                      操作人：{record.operatorName}
                      {record.operatorRole === 'admin' && '（管理员）'}
                    </Text>
                  )}
                  {record.remark && (
                    <Text className={record.action === 'note' ? styles.flowNoteRemark : styles.flowRemark}>
                      {record.remark}
                    </Text>
                  )}
                  {record.newVolunteerName && (
                    <Text className={styles.flowVolunteer}>
                      分配给：{record.newVolunteerName}
                    </Text>
                  )}
                  {record.previousVolunteerName && (
                    <Text className={styles.flowVolunteer}>
                      原志愿者：{record.previousVolunteerName}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View className={styles.bottomBar}>
        {(task.status === 'pending') && (
          <>
            <View className={`${styles.bottomBtn} ${styles.secondaryBtn}`} onClick={handleNavigate}>
              <Text className={styles.secondaryBtnText}>🧭 查看路线</Text>
            </View>
            <View className={`${styles.bottomBtn} ${styles.primaryBtn}`} onClick={handleSignup}>
              <Text className={styles.primaryBtnText}>立即报名</Text>
            </View>
          </>
        )}
        {isMyTask && (task.status === 'assigned') && (
          <>
            <View className={`${styles.bottomBtn} ${styles.secondaryBtn}`} onClick={handleCancel}>
              <Text className={styles.secondaryBtnText}>取消任务</Text>
            </View>
            <View className={`${styles.bottomBtn} ${styles.secondaryBtn}`} onClick={handleExchange}>
              <Text className={styles.secondaryBtnText}>申请换班</Text>
            </View>
            <View className={`${styles.bottomBtn} ${styles.successBtn}`} onClick={handleStart}>
              <Text className={styles.primaryBtnText}>开始任务</Text>
            </View>
          </>
        )}
        {isMyTask && (task.status === 'in_progress') && (
          <>
            <View className={`${styles.bottomBtn} ${styles.secondaryBtn}`} onClick={handleNavigate}>
              <Text className={styles.secondaryBtnText}>🧭 导航</Text>
            </View>
            <View className={`${styles.bottomBtn} ${styles.primaryBtn}`} onClick={handleComplete}>
              <Text className={styles.primaryBtnText}>填写探访记录</Text>
            </View>
          </>
        )}
        {!isMyTask && task.status !== 'pending' && task.status !== 'completed' && (
          <View className={`${styles.bottomBtn} ${styles.primaryBtn}`} onClick={handleNavigate}>
            <Text className={styles.primaryBtnText}>🧭 查看路线</Text>
          </View>
        )}
        {task.status === 'completed' && (
          <View className={`${styles.bottomBtn} ${styles.secondaryBtn}`} style={{ flex: 1 }}>
            <Text className={styles.secondaryBtnText}>✓ 任务已完成</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default TaskDetailPage;
