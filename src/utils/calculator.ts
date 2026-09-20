import type { MonthMaintenanceRecord, FlatReading } from '../types';

export function recalculateMonthRecord(record: MonthMaintenanceRecord): MonthMaintenanceRecord {
  const { waterConfig, commonExpenses, flatReadings } = record;

  // 1. Calculate Consumed Units for each entry
  const updatedReadings: FlatReading[] = flatReadings.map((f) => {
    const consumed = Math.max(0, f.currentReading - f.previousReading);
    return {
      ...f,
      consumedUnits: consumed,
    };
  });

  // Find Watchman meter units
  const watchmanEntry = updatedReadings.find((f) => f.flatNo === 'WM');
  const watchmanUnits = watchmanEntry ? watchmanEntry.consumedUnits : (waterConfig.watchmanUnits || 8);

  // 2. Aggregate Total Units
  const totalUnitsConsumed = updatedReadings.reduce((sum, f) => sum + f.consumedUnits, 0);
  const netBillableWaterUnits = Math.max(1, totalUnitsConsumed - watchmanUnits);

  // 3. Tanker Water Costs
  const municipalTotal = waterConfig.municipalTankerCount * waterConfig.municipalTankerRate;
  const privateTotal = waterConfig.privateTankerCount * waterConfig.privateTankerRate;
  const tankersBillTotal = municipalTotal + privateTotal;

  // 4. Calculate Unit Rate
  const calculatedUnitRate =
    waterConfig.manualUnitRate && waterConfig.manualUnitRate > 0
      ? waterConfig.manualUnitRate
      : Math.round(tankersBillTotal / netBillableWaterUnits) || 105;

  const totalWaterCost = tankersBillTotal + waterConfig.panchayatWaterBill;

  // 5. Common Maintenance Total
  const totalCommonMaintenance = commonExpenses.reduce((sum, item) => sum + item.amount, 0);

  // 6. Occupied Flats Count (Flats excluding WM and vacant flats)
  const occupiedFlats = updatedReadings.filter((f) => f.flatNo !== 'WM' && f.isOccupied);
  const occupiedCount = Math.max(1, occupiedFlats.length);

  const panchayatPerFlat = waterConfig.panchayatWaterBill / occupiedCount;
  const commonPerFlat = totalCommonMaintenance / occupiedCount;

  // 7. Calculate per-flat shares and totals
  let grandTargetSum = 0;

  const finalReadings = updatedReadings.map((f) => {
    if (f.flatNo === 'WM' || !f.isOccupied) {
      return {
        ...f,
        waterCost: 0,
        panchayatShare: 0,
        commonMaintenanceShare: 0,
        totalValue: 0,
        roundedValue: 0,
      };
    }

    const waterCost = f.consumedUnits * calculatedUnitRate;
    const totalValue = waterCost + panchayatPerFlat + commonPerFlat;
    const roundedValue = Math.round(totalValue);

    grandTargetSum += roundedValue;

    // Evaluate payment status
    let status = f.status;
    if (f.paidAmount >= roundedValue && roundedValue > 0) {
      status = 'Received';
    } else if (f.paidAmount > 0) {
      status = 'Partial';
    } else if (roundedValue > 0) {
      status = 'Pending';
    }

    return {
      ...f,
      waterCost,
      panchayatShare: panchayatPerFlat,
      commonMaintenanceShare: commonPerFlat,
      totalValue,
      roundedValue,
      status,
    };
  });

  return {
    ...record,
    flatReadings: finalReadings,
    totalUnitsConsumed,
    netBillableWaterUnits,
    calculatedUnitRate,
    totalWaterCost,
    totalCommonMaintenance,
    totalGrandCollectionTarget: grandTargetSum,
  };
}
