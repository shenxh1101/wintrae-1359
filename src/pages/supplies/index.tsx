import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import SupplyItem from '@/components/SupplyItem';
import { useAppContext } from '@/store/AppContext';
import { categories } from '@/data/supplies';
import { generateId, formatDateTime } from '@/utils';
import type { Supply, SupplyCategory, SupplyRecord } from '@/types';
import classnames from 'classnames';

type TabType = 'stock' | 'records';
type ActionType = 'receive' | 'return';

const SuppliesPage: React.FC = () => {
  const { supplies, setSupplies, supplyRecords, setSupplyRecords, currentVolunteer } = useAppContext();

  const [tab, setTab] = useState<TabType>('stock');
  const [categoryFilter, setCategoryFilter] = useState<SupplyCategory | 'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState<ActionType>('receive');
  const [selectedSupply, setSelectedSupply] = useState<Supply | null>(null);
  const [quantity, setQuantity] = useState(1);

  const totalStock = useMemo(() => supplies.reduce((s, sp) => s + sp.totalStock, 0), [supplies]);
  const lowStockCount = useMemo(() => {
    return supplies.filter(sp => (sp.availableStock / sp.totalStock) < 0.3).length;
  }, [supplies]);
  const receiveCount = useMemo(() => {
    return supplyRecords.filter(sr => sr.type === 'receive' && sr.volunteerId === currentVolunteer.id).length;
  }, [supplyRecords, currentVolunteer]);

  const filteredSupplies = useMemo(() => {
    if (categoryFilter === 'all') return supplies;
    return supplies.filter(sp => sp.category === categoryFilter);
  }, [supplies, categoryFilter]);

  const myRecords = useMemo(() => {
    return supplyRecords
      .filter(sr => sr.volunteerId === currentVolunteer.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [supplyRecords, currentVolunteer]);

  const openModal = (supply: Supply, action: ActionType) => {
    setSelectedSupply(supply);
    setActionType(action);
    setQuantity(1);
    setShowModal(true);
  };

  const handleConfirm = () => {
    if (!selectedSupply) return;

    let newAvailable = selectedSupply.availableStock;
    if (actionType === 'receive') {
      if (quantity > selectedSupply.availableStock) {
        Taro.showToast({ title: '库存不足', icon: 'none' });
        return;
      }
      newAvailable = selectedSupply.availableStock - quantity;
    } else {
      newAvailable = Math.min(selectedSupply.totalStock, selectedSupply.availableStock + quantity);
    }

    const updatedSupplies = supplies.map(sp =>
      sp.id === selectedSupply.id ? { ...sp, availableStock: newAvailable } : sp
    );
    setSupplies(updatedSupplies);

    const newRecord: SupplyRecord = {
      id: generateId(),
      supplyId: selectedSupply.id,
      supplyName: selectedSupply.name,
      type: actionType,
      quantity,
      volunteerId: currentVolunteer.id,
      volunteerName: currentVolunteer.name,
      createdAt: new Date().toISOString()
    };
    setSupplyRecords([newRecord, ...supplyRecords]);

    Taro.showToast({
      title: actionType === 'receive' ? '领取成功' : '归还成功',
      icon: 'success'
    });
    setShowModal(false);
  };

  const allCategories = [{ key: 'all' as const, label: '全部' }, ...categories.map(c => ({ key: c, label: c }))];

  return (
    <View>
      <ScrollView scrollY className={styles.pageContainer} enhanced showScrollbar={false}>
        <View className={styles.header}>
          <View className={styles.headerTop}>
            <View className={styles.titleWrap}>
              <Text className={styles.titleIcon}>📦</Text>
              <Text className={styles.titleText}>物资领取</Text>
            </View>
            <View
              className={styles.recordBtn}
              onClick={() => setTab(tab === 'stock' ? 'records' : 'stock')}
            >
              <Text className={styles.recordBtnText}>
                {tab === 'stock' ? '📜 查看记录' : '📦 返回库存'}
              </Text>
            </View>
          </View>
          <View className={styles.statRow}>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{totalStock}</Text>
              <Text className={styles.statLabel}>物资总数</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{lowStockCount}</Text>
              <Text className={styles.statLabel}>库存预警</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{receiveCount}</Text>
              <Text className={styles.statLabel}>我的领取</Text>
            </View>
          </View>
        </View>

        {tab === 'stock' ? (
          <>
            <View className={styles.categoryTabs}>
              {allCategories.map(cat => (
                <View
                  key={cat.key}
                  className={classnames(styles.tabItem, categoryFilter === cat.key && styles.tabActive)}
                  onClick={() => setCategoryFilter(cat.key)}
                >
                  <Text className={classnames(styles.tabText, categoryFilter === cat.key && styles.tabActiveText)}>
                    {cat.label}
                  </Text>
                </View>
              ))}
            </View>

            <View className={styles.sectionTitle}>
              <View className={styles.titleLeft}>
                <Text className={styles.titleIconSmall}>🛍️</Text>
                <Text className={styles.titleTextSmall}>物资列表</Text>
              </View>
            </View>

            <View className={styles.supplyList}>
              {filteredSupplies.map(supply => (
                <SupplyItem
                  key={supply.id}
                  supply={supply}
                  onReceive={(sp) => openModal(sp, 'receive')}
                  onReturn={(sp) => openModal(sp, 'return')}
                />
              ))}
            </View>
          </>
        ) : (
          <>
            <View className={styles.sectionTitle}>
              <View className={styles.titleLeft}>
                <Text className={styles.titleIconSmall}>📋</Text>
                <Text className={styles.titleTextSmall}>领取/归还记录</Text>
              </View>
            </View>
            <View className={styles.recordList}>
              {myRecords.length === 0 ? (
                <SupplyItem supply={supplies[0]} onReceive={() => {}} onReturn={() => {}} />
              ) : (
                myRecords.map(record => (
                  <View key={record.id} className={styles.recordCard}>
                    <View className={styles.recordHeader}>
                      <Text className={styles.recordName}>{record.supplyName}</Text>
                      <View className={classnames(
                        styles.recordTypeTag,
                        record.type === 'receive' ? styles.receiveTag : styles.returnTag
                      )}>
                        <Text>{record.type === 'receive' ? '领取' : '归还'}</Text>
                      </View>
                    </View>
                    <View className={styles.recordMeta}>
                      <View className={styles.recordInfo}>
                        <Text className={styles.infoText}>{formatDateTime(record.createdAt)}</Text>
                        <Text className={styles.infoText}>操作人：{record.volunteerName}</Text>
                      </View>
                      <Text className={classnames(
                        styles.quantity,
                        record.type === 'return' && styles.quantityReturn
                      )}>
                        {record.type === 'receive' ? '-' : '+'}{record.quantity} {supplies.find(s => s.id === record.supplyId)?.unit || ''}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>

      {showModal && selectedSupply && (
        <View className={styles.quantityModalOverlay} onClick={(e) => {
          if (e.target === e.currentTarget) setShowModal(false);
        }}>
          <View className={styles.quantityModal}>
            <View className={styles.quantityHeader}>
              <Text className={styles.quantityTitle}>
                {actionType === 'receive' ? '领取物资' : '归还物资'}
              </Text>
            </View>
            <View className={styles.quantityBody}>
              <Text className={styles.supplyNameText}>{selectedSupply.name}</Text>
              <View className={styles.quantityStepper}>
                <View className={styles.stepBtn} onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                  <Text className={styles.stepBtnText}>−</Text>
                </View>
                <View>
                  <Text className={styles.quantityNum}>{quantity}</Text>
                  <Text className={styles.unitText}> {selectedSupply.unit}</Text>
                </View>
                <View
                  className={styles.stepBtn}
                  onClick={() => {
                    const max = actionType === 'receive' ? selectedSupply.availableStock : 10;
                    setQuantity(Math.min(max, quantity + 1));
                  }}
                >
                  <Text className={styles.stepBtnText}>+</Text>
                </View>
              </View>
              <Text className={styles.supplyNameText} style={{ fontSize: 22 }}>
                {actionType === 'receive'
                  ? `当前可领取：${selectedSupply.availableStock} ${selectedSupply.unit}`
                  : `请确认归还数量正确`}
              </Text>
            </View>
            <View className={styles.quantityFooter}>
              <View className={`${styles.footerBtn} ${styles.cancelFooterBtn}`} onClick={() => setShowModal(false)}>
                <Text className={styles.cancelFooterText}>取消</Text>
              </View>
              <View className={`${styles.footerBtn} ${styles.confirmFooterBtn}`} onClick={handleConfirm}>
                <Text className={styles.confirmFooterText}>确认{actionType === 'receive' ? '领取' : '归还'}</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default SuppliesPage;
