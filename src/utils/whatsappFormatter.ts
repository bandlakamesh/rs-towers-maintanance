import type { MonthMaintenanceRecord, FlatReading } from '../types';

export function generateWhatsAppFlatBillText(
  flat: FlatReading,
  record: MonthMaintenanceRecord,
  treasurerUpiId: string = '9963275455@upi',
  treasurerName: string = 'Bobby (Flat 101 - Maintenance Lead)'
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
📲 *UPI Payment*: ${treasurerUpiId} (${treasurerName})

Thank you! 🙏
*RS TOWERS APARTMENT ASSOCIATION*`;
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

export function generateWhatsAppOverdueReminderText(
  flat: FlatReading,
  record: MonthMaintenanceRecord,
  dueDateDay: number = 10,
  treasurerUpiId: string = '9963275455@upi',
  treasurerName: string = 'Bobby (Flat 101 - Maintenance Lead)'
): string {
  const pendingAmount = Math.max(0, flat.roundedValue - flat.paidAmount);

  return `⚠️ *RS TOWERS MAINTENANCE - OVERDUE REMINDER* ⚠️
📅 *Period*: ${record.monthTitle}
🏠 *Flat*: *#${flat.flatNo} - ${flat.residentName}*

Dear Resident,
Friendly reminder that your monthly maintenance payment of *₹${pendingAmount.toLocaleString('en-IN')}* was due on the *${dueDateDay}th of the month*.

----------------------------------------
💰 *Total Amount Due*: *₹${pendingAmount.toLocaleString('en-IN')}*
📲 *UPI ID*: ${treasurerUpiId} (${treasurerName})
----------------------------------------

Please complete the transfer at your earliest convenience to assist in uninterrupted building services (Lift, Water Tanker & Watchman). If already paid, please ignore this notice.

Thank you! 🙏
*RS TOWERS APARTMENT ASSOCIATION*`;
}

export function generateWhatsAppNoticeText(notice: { title: string; content: string; date: string; postedBy: string }): string {
  return `📢 *RS TOWERS APARTMENT ANNOUNCEMENT* 📢
📌 *${notice.title}*
📅 *Date*: ${notice.date}
👤 *Posted By*: ${notice.postedBy}

${notice.content}

----------------------------------------
🔗 *Live App*: https://bandlakamesh.github.io/rs-towers-maintanance/
Thank you! 🙏`;
}

export function maskPhoneNumber(phone?: string): string {
  if (!phone) return 'N/A';
  const clean = phone.replace(/\D/g, '');
  if (clean.length >= 10) {
    return `${clean.slice(0, 5)}*****${clean.slice(-2)}`;
  }
  return phone;
}

export function openWhatsAppShareLink(text: string): void {
  const encodedText = encodeURIComponent(text);
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
  window.open(whatsappUrl, '_blank');
}


