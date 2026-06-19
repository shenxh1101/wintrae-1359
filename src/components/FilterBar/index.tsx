import React from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import styles from './index.module.scss';
import classnames from 'classnames';

interface FilterOption {
  key: string;
  label: string;
}

interface FilterBarProps {
  title: string;
  options: FilterOption[];
  value: string;
  onChange: (key: string) => void;
  scrollable?: boolean;
}

const FilterBar: React.FC<FilterBarProps> = ({ title, options, value, onChange, scrollable = false }) => {
  const renderOptions = () => (
    options.map((opt) => (
      <View
        key={opt.key}
        className={classnames(styles.option, value === opt.key && styles.active)}
        onClick={() => onChange(opt.key)}
      >
        <Text className={classnames(styles.optionText, value === opt.key && styles.activeText)}>
          {opt.label}
        </Text>
      </View>
    ))
  );

  return (
    <View className={styles.container}>
      <Text className={styles.title}>{title}</Text>
      {scrollable ? (
        <ScrollView scrollX className={styles.scroll} enhanced showScrollbar={false}>
          <View className={styles.optionsWrap}>
            {renderOptions()}
          </View>
        </ScrollView>
      ) : (
        <View className={styles.options}>
          {renderOptions()}
        </View>
      )}
    </View>
  );
};

export default FilterBar;
