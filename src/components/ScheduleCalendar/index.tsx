import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import classnames from 'classnames';
import { getDaysInMonth, getFirstDayOfMonth } from '@/utils';

interface ScheduleCalendarProps {
  year: number;
  month: number;
  selectedDate: string;
  markedDates: string[];
  onSelectDate: (dateStr: string) => void;
}

const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({
  year,
  month,
  selectedDate,
  markedDates,
  onSelectDate,
}) => {
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const isMarked = (day: number): boolean => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return markedDates.includes(dateStr);
  };

  const isSelected = (day: number): boolean => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return selectedDate === dateStr;
  };

  const isToday = (day: number): boolean => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return dateStr === todayStr;
  };

  const handleDayClick = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onSelectDate(dateStr);
  };

  const emptyDays = Array.from({ length: firstDay }, (_, i) => (
    <View key={`empty-${i}`} className={styles.dayCell}></View>
  ));

  const dayCells = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const marked = isMarked(day);
    const selected = isSelected(day);
    const todayFlag = isToday(day);

    return (
      <View
        key={day}
        className={classnames(
          styles.dayCell,
          selected && styles.selected,
          todayFlag && !selected && styles.today
        )}
        onClick={() => handleDayClick(day)}
      >
        <Text className={classnames(
          styles.dayText,
          selected && styles.selectedText
        )}>{day}</Text>
        {marked && !selected && <View className={styles.markDot}></View>}
        {marked && selected && <View className={styles.markDotWhite}></View>}
      </View>
    );
  });

  return (
    <View className={styles.container}>
      <View className={styles.weekHeader}>
        {weekDays.map((day) => (
          <View key={day} className={styles.weekDay}>
            <Text className={styles.weekDayText}>{day}</Text>
          </View>
        ))}
      </View>
      <View className={styles.daysGrid}>
        {emptyDays}
        {dayCells}
      </View>
    </View>
  );
};

export default ScheduleCalendar;
