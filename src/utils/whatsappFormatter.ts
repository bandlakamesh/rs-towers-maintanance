import type { MonthMaintenanceRecord, FlatReading } from '../types';

export function generateWhatsAppFlatBillText(
  flat: FlatReading,
  record: MonthMaintenanceRecord
): string {
  const isWM = flat.flatNo === 'WM';

  if (isWM || !flat.isOccupied) {
    return `🏢 *RS TOWERS MAINTENANCE - ${record.monthTitle}*\nFlat: *#${flat.flatNo} (${flat.residentName})*\nStatus: Vacant / No Bill Due.`;
  }

  return `🏢 *RS TOWERS APARTMENT MAINTENANCE*
📅 *Period*: ${record.monthTitle}
🏠 *Flat*: *#${flat.flatNo} - ${flat.residentName}* (${flat.residentType})

📊 *BILL BREAKDOWN*:
----------------------------------------
💧 *Water Consumption*: ${flat.previousReading} ➔ ${flat.currentReading} = *${flat.consumedUnits} Units*
💵 *Water Meter Cost* (${flat.consumedUnits} units @ ₹${record.calculatedUnitRate}/unit): *₹${flat.waterCost.toLocaleString('en-IN')}*
🚰 *Panchayat Water Share*: *₹${flat.panchayatShare.toFixed(2)}*
⚡ *Common Maintenance Share*: *₹${flat.commonMaintenanceShare.toFixed(2)}*
----------------------------------------
💰 *TOTAL MAINTENANCE DUE*: *₹${flat.roundedValue.toLocaleString('en-IN')}*
----------------------------------------
📌 *Payment Status*: *${flat.status === 'Received' ? '✅ PAID' : '⏳ PENDING'}*
${flat.notes ? `📝 *Note*: ${flat.notes}\n` : ''}
📲 *UPI Payment*: 9876543210@upi (Flat 302 - Kamesh)

*Ganpati Bappa Morya!* 🙏`;
}

export function generateWhatsAppMonthlySummary(record: MonthMaintenanceRecord): string {
  const occupiedCount = record.flatReadings.filter((f) => f.flatNo !== 'WM' && f.isOccupied).length;
  const paidCount = record.flatReadings.filter((f) => f.status === 'Received' && f.isOccupied).length;
  const pendingCount = occupiedCount - paidCount;

  return `🏢 *RS TOWERS MONTHLY MAINTENANCE SUMMARY*
📅 *${record.monthTitle}*

📊 *BUILDING TOTALS*:
• Total Water Units Consumed: *${record.totalUnitsConsumed} Units*
• Billable Units (Excl Watchman 8 units): *${record.netBillableWaterUnits} Units*
• Water Rate: *₹${record.calculatedUnitRate} / Unit*
• Total Water Expense: *₹${record.totalWaterCost.toLocaleString('en-IN')}*
• Total Common Maintenance: *₹${record.totalCommonMaintenance.toLocaleString('en-IN')}*
----------------------------------------
💰 *Grand Collection Target*: *₹${record.totalGrandCollectionTarget.toLocaleString('en-IN')}*
✅ *Flats Paid*: ${paidCount} / ${occupiedCount}
⏳ *Flats Pending*: ${pendingCount}
----------------------------------------
🔗 *View Live Monthly Maintenance Tracker*:
https://bandlakamesh.github.io/rs-towers-maintanance/

Thank you! 🙏`;
}

export function openWhatsAppShareLink(text: string): void {
  const encodedText = encodeURIComponent(text);
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
  window.open(whatsappUrl, '_blank');
}
