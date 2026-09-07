import { getCurrency } from './currencies.js'
import { formatPersianDate, isoToJalaali } from './date.js'
import { eventTransferAiPrompt, validateEventTransfer } from './eventTransfer.js'

const HEADER_ROW = 4
const COLORS = { navy: '25245D', purple: '4F46E5', lavender: 'EEF2FF', ink: '172033', muted: '68738A', line: 'E5E9F2', white: 'FFFFFF', green: '059669' }

async function getExcelJs() {
  const module = await import('exceljs')
  return module.default || module
}

function persianNumericDate(iso) {
  const { jy, jm, jd } = isoToJalaali(iso)
  return `${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}`
}

function excelDate(iso) { return new Date(`${iso}T00:00:00Z`) }

function setupSheet(sheet, title, subtitle, widths) {
  sheet.views = [{ state: 'frozen', ySplit: HEADER_ROW, rightToLeft: true, showGridLines: false }]
  sheet.properties.defaultRowHeight = 22
  sheet.getCell('A1').value = title
  sheet.getCell('A1').font = { name: 'Arial', size: 16, bold: true, color: { argb: COLORS.navy } }
  sheet.getCell('A2').value = subtitle
  sheet.getCell('A2').font = { name: 'Arial', size: 10, italic: true, color: { argb: COLORS.muted } }
  sheet.getCell('A2').alignment = { wrapText: true, vertical: 'middle', horizontal: 'right', readingOrder: 'rtl' }
  sheet.getRow(2).height = 30
  sheet.columns = widths.map((width) => ({ width }))
  sheet.pageSetup = { orientation: widths.length > 5 ? 'landscape' : 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0 }
  sheet.pageSetup.margins = { left: 0.35, right: 0.35, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 }
}

function styleTable(sheet, lastRow, moneyColumns = [], dateColumns = [], moneyFormat = '#,##0') {
  const lastColumn = sheet.columnCount
  const header = sheet.getRow(HEADER_ROW)
  header.height = 30
  header.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.navy } }
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: COLORS.white } }
    cell.alignment = { horizontal: 'center', vertical: 'middle', readingOrder: 'rtl', wrapText: true }
    cell.border = { bottom: { style: 'thin', color: { argb: COLORS.white } } }
  })
  for (let rowIndex = HEADER_ROW + 1; rowIndex <= Math.max(lastRow, HEADER_ROW + 1); rowIndex += 1) {
    const row = sheet.getRow(rowIndex)
    row.height = 25
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.font = { name: 'Arial', size: 10, color: { argb: COLORS.ink } }
      cell.alignment = { horizontal: moneyColumns.includes(colNumber) ? 'right' : 'right', vertical: 'middle', readingOrder: 'rtl', wrapText: true }
      cell.border = { bottom: { style: 'hair', color: { argb: COLORS.line } } }
      if (rowIndex % 2 === 0) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8FAFC' } }
    })
  }
  moneyColumns.forEach((column) => { sheet.getColumn(column).numFmt = moneyFormat })
  dateColumns.forEach((column) => { sheet.getColumn(column).numFmt = 'yyyy-mm-dd' })
  if (lastRow >= HEADER_ROW) sheet.autoFilter = { from: { row: HEADER_ROW, column: 1 }, to: { row: lastRow, column: lastColumn } }
}

function addRowsSheet(workbook, { name, title, subtitle, headers, rows, widths, moneyColumns = [], dateColumns = [], moneyFormat = '#,##0', color = COLORS.purple }) {
  const sheet = workbook.addWorksheet(name)
  sheet.properties.tabColor = { argb: color }
  setupSheet(sheet, title, subtitle, widths)
  sheet.getRow(HEADER_ROW).values = headers
  rows.forEach((row) => sheet.addRow(row))
  styleTable(sheet, sheet.rowCount, moneyColumns, dateColumns, moneyFormat)
  return sheet
}

export async function eventTransferToWorkbook(transfer) {
  const ExcelJS = await getExcelJs()
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'DongBan'
  workbook.company = 'dongban.ir'
  workbook.created = new Date()
  workbook.modified = new Date()
  workbook.calcProperties.fullCalcOnLoad = true

  const guide = workbook.addWorksheet('راهنما')
  guide.views = [{ rightToLeft: true, showGridLines: false }]
  guide.properties.tabColor = { argb: COLORS.green }
  guide.columns = [{ width: 5 }, { width: 28 }, { width: 85 }]
  guide.getCell('A1').value = 'راهنمای انتقال رویداد دنگ‌بان'
  guide.mergeCells('A1:C1')
  guide.getCell('A1').font = { name: 'Arial', size: 17, bold: true, color: { argb: COLORS.navy } }
  guide.getCell('A1').alignment = { horizontal: 'right', readingOrder: 'rtl' }
  const instructions = [
    ['۱', 'شیت‌های قابل ویرایش', 'فقط «رویداد»، «اعضا»، «هزینه‌ها» و «سهم‌ها» را ویرایش کنید.'],
    ['۲', 'شناسه‌ها', 'member_id و expense_id یکتا هستند و باید در همهٔ شیت‌ها دقیقاً یکسان بمانند.'],
    ['۳', 'مبلغ', 'مبلغ را عددی و به واحد پول شیت «رویداد» وارد کنید؛ جداکنندهٔ هزارگان مجاز است.'],
    ['۴', 'پرداخت‌کننده', 'payer_id در شیت هزینه‌ها باید یکی از member_idهای شیت اعضا باشد.'],
    ['۵', 'تقسیم سهم', 'برای هر هزینه حداقل یک ردیف با ضریب مثبت در شیت سهم‌ها لازم است. ضریب‌های برابر یعنی سهم برابر.'],
    ['۶', 'تاریخ', 'تاریخ میلادی با قالب YYYY-MM-DD مبنای ورود است. تاریخ شمسی برای خوانایی نمایش داده می‌شود.'],
    ['۷', 'محاسبات', 'شیت‌های «خلاصه افراد» و «تسویه‌ها» فقط گزارش‌اند؛ دنگ‌بان پس از ورود دوباره محاسبه می‌کند.'],
    ['۸', 'حریم خصوصی', 'فایل فقط روی دستگاه شما ساخته و خوانده می‌شود و به سرور دنگ‌بان ارسال نمی‌شود.']
  ]
  guide.getRow(3).values = ['ردیف', 'موضوع', 'توضیح']
  instructions.forEach((row, index) => { guide.getRow(index + 4).values = row })
  guide.getRow(3).eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.navy } }
    cell.font = { name: 'Arial', bold: true, color: { argb: COLORS.white } }
    cell.alignment = { horizontal: 'center', readingOrder: 'rtl' }
  })
  for (let row = 4; row <= 11; row += 1) {
    guide.getRow(row).height = 34
    guide.getRow(row).eachCell((cell) => {
      cell.font = { name: 'Arial', size: 10, color: { argb: COLORS.ink } }
      cell.alignment = { wrapText: true, vertical: 'middle', horizontal: 'right', readingOrder: 'rtl' }
      cell.border = { bottom: { style: 'hair', color: { argb: COLORS.line } } }
    })
  }
  guide.getCell('A13').value = 'متن پیشنهادی برای AI'
  guide.getCell('A13').font = { name: 'Arial', bold: true, color: { argb: COLORS.navy } }
  const promptRow = 14
  guide.getCell(`A${promptRow}`).value = eventTransferAiPrompt()
  guide.mergeCells(`A${promptRow}:C${promptRow + 3}`)
  guide.getCell(`A${promptRow}`).alignment = { wrapText: true, vertical: 'top', horizontal: 'right', readingOrder: 'rtl' }
  guide.getCell(`A${promptRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.lavender } }

  const eventSheet = addRowsSheet(workbook, {
    name: 'رویداد', title: 'مشخصات رویداد', subtitle: 'کلیدهای ستون اول را تغییر ندهید.',
    headers: ['کلید', 'مقدار', 'توضیح'], widths: [24, 35, 48],
    rows: [
      ['format', transfer.format, 'شناسهٔ قالب؛ تغییر ندهید'],
      ['schema_version', transfer.schema_version, 'نسخهٔ ساختار؛ تغییر ندهید'],
      ['title', transfer.event.title, 'نام رویداد'],
      ['date', excelDate(transfer.event.date), `تاریخ میلادی؛ شمسی: ${formatPersianDate(transfer.event.date)}`],
      ['currency', transfer.event.currency, `کد واحد پول (${getCurrency(transfer.event.currency).label})`],
      ['rounding_increment', transfer.event.rounding_increment, 'مقدار رُندکردن در واحد پول'],
      ['note', transfer.event.note || '', 'توضیح اختیاری']
    ]
  })
  eventSheet.getCell('B8').numFmt = 'yyyy-mm-dd'
  eventSheet.getCell('B10').numFmt = '#,##0'

  const nameById = Object.fromEntries(transfer.members.map((member) => [member.id, member.name]))
  const expenseById = Object.fromEntries(transfer.expenses.map((expense) => [expense.id, expense]))
  const currencyFormat = getCurrency(transfer.event.currency).decimals > 0 ? '#,##0.00' : '#,##0'
  addRowsSheet(workbook, {
    name: 'اعضا', title: 'اعضای رویداد', subtitle: 'برای هر عضو یک شناسهٔ یکتا و یک نام وارد کنید.',
    headers: ['member_id', 'نام'], widths: [25, 30], rows: transfer.members.map((member) => [member.id, member.name])
  })
  addRowsSheet(workbook, {
    name: 'هزینه‌ها', title: 'هزینه‌های رویداد', subtitle: 'مبلغ عددی است و payer_id باید در شیت اعضا وجود داشته باشد.',
    headers: ['expense_id', 'عنوان', 'مبلغ', 'payer_id', 'نام پرداخت‌کننده', 'دسته‌بندی', 'تاریخ میلادی', 'تاریخ شمسی', 'یادداشت'],
    widths: [25, 28, 18, 25, 24, 18, 18, 18, 38], moneyColumns: [3], dateColumns: [7], moneyFormat: currencyFormat,
    rows: transfer.expenses.map((expense) => [expense.id, expense.title, expense.amount, expense.payer_id, nameById[expense.payer_id] || '', expense.category, excelDate(expense.date), persianNumericDate(expense.date), expense.note || ''])
  })
  addRowsSheet(workbook, {
    name: 'سهم‌ها', title: 'ضریب سهم افراد', subtitle: 'برای هر هزینه حداقل یک عضو با ضریب مثبت ثبت کنید.',
    headers: ['expense_id', 'عنوان هزینه', 'member_id', 'نام عضو', 'ضریب سهم'], widths: [25, 28, 25, 24, 16], moneyColumns: [5], moneyFormat: '0.00',
    rows: transfer.shares.map((share) => [share.expense_id, expenseById[share.expense_id]?.title || '', share.member_id, nameById[share.member_id] || '', share.weight])
  })
  addRowsSheet(workbook, {
    name: 'مادرخرج‌ها', title: 'خلاصهٔ پرداخت‌کنندگان', subtitle: 'تعداد هزینه و جمع پرداخت هر مادرخرج؛ این شیت گزارش است.',
    headers: ['member_id', 'نام', 'تعداد هزینه', 'جمع پرداخت'], widths: [25, 25, 18, 22], moneyColumns: [4], moneyFormat: currencyFormat, color: COLORS.green,
    rows: transfer.payers.map((payer) => [payer.member_id, payer.name, payer.expense_count, payer.total_paid])
  })
  addRowsSheet(workbook, {
    name: 'خلاصه افراد', title: 'خلاصهٔ محاسبات افراد', subtitle: 'این شیت گزارش است و هنگام ورود فایل دوباره محاسبه می‌شود.',
    headers: ['member_id', 'نام', 'پرداخت‌شده', 'سهم', 'مانده'], widths: [25, 25, 20, 20, 20], moneyColumns: [3, 4, 5], moneyFormat: currencyFormat, color: COLORS.green,
    rows: transfer.calculated.members.map((member) => [member.member_id, member.name, member.paid, member.share, member.balance])
  })

  eventSheet.getCell('B9').dataValidation = { type: 'list', allowBlank: false, formulae: [`"TOMAN,IRR,USD,EUR,GBP,AED,TRY"`] }
  eventSheet.getCell('B10').dataValidation = { type: 'list', allowBlank: false, formulae: [`"1,10,100,1000,10000"`] }
  const expenseSheet = workbook.getWorksheet('هزینه‌ها')
  expenseSheet.dataValidations.add('D5:D500', { type: 'list', allowBlank: false, formulae: ["'اعضا'!$A$5:$A$500"] })
  expenseSheet.dataValidations.add('F5:F500', { type: 'list', allowBlank: false, formulae: [`"food,transport,stay,shopping,fun,other"`] })
  const shareSheet = workbook.getWorksheet('سهم‌ها')
  shareSheet.dataValidations.add('A5:A1000', { type: 'list', allowBlank: false, formulae: ["'هزینه‌ها'!$A$5:$A$500"] })
  shareSheet.dataValidations.add('C5:C1000', { type: 'list', allowBlank: false, formulae: ["'اعضا'!$A$5:$A$500"] })
  shareSheet.dataValidations.add('E5:E1000', { type: 'decimal', operator: 'greaterThan', allowBlank: false, formulae: [0] })
  addRowsSheet(workbook, {
    name: 'تسویه‌ها', title: 'انتقال‌های پیشنهادی تسویه', subtitle: 'این شیت گزارش است و هنگام ورود فایل دوباره محاسبه می‌شود.',
    headers: ['from_id', 'از', 'to_id', 'به', 'مبلغ'], widths: [25, 24, 25, 24, 20], moneyColumns: [5], moneyFormat: currencyFormat, color: COLORS.green,
    rows: transfer.calculated.settlements.map((item) => [item.from_id, item.from_name, item.to_id, item.to_name, item.amount])
  })

  workbook.eachSheet((sheet) => {
    sheet.headerFooter.oddFooter = '&Rdongban.ir&Cصفحه &P از &N'
    sheet.state = 'visible'
  })
  return workbook
}

export async function eventTransferToXlsxBuffer(transfer) {
  const workbook = await eventTransferToWorkbook(transfer)
  return workbook.xlsx.writeBuffer()
}

function simpleCellValue(cell) {
  const value = cell?.value
  if (value && typeof value === 'object' && 'result' in value) return value.result
  if (value && typeof value === 'object' && Array.isArray(value.richText)) return value.richText.map((item) => item.text).join('')
  return value
}

function sheetRows(sheet) {
  if (!sheet) return []
  const headers = sheet.getRow(HEADER_ROW).values.slice(1).map((value) => String(value ?? '').trim())
  const rows = []
  for (let rowNumber = HEADER_ROW + 1; rowNumber <= sheet.rowCount; rowNumber += 1) {
    const row = sheet.getRow(rowNumber)
    const values = headers.map((header, index) => [header, simpleCellValue(row.getCell(index + 1))])
    if (values.every(([, value]) => value === null || value === undefined || value === '')) continue
    rows.push(Object.fromEntries(values))
  }
  return rows
}

export async function xlsxBufferToEvent(buffer) {
  const ExcelJS = await getExcelJs()
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(buffer)
  const eventSheet = workbook.getWorksheet('رویداد')
  const membersSheet = workbook.getWorksheet('اعضا')
  const expensesSheet = workbook.getWorksheet('هزینه‌ها')
  const sharesSheet = workbook.getWorksheet('سهم‌ها')
  if (!eventSheet || !membersSheet || !expensesSheet || !sharesSheet) throw new Error('شیت‌های رویداد، اعضا، هزینه‌ها و سهم‌ها باید در فایل وجود داشته باشند.')

  const metadata = Object.fromEntries(sheetRows(eventSheet).map((row) => [String(row['کلید'] ?? '').trim(), row['مقدار']]))
  const members = sheetRows(membersSheet).map((row) => ({ id: row.member_id, name: row['نام'] }))
  const expenses = sheetRows(expensesSheet).map((row) => ({
    id: row.expense_id, title: row['عنوان'], amount: row['مبلغ'], payer_id: row.payer_id,
    category: row['دسته‌بندی'], date: row['تاریخ میلادی'], persian_date: row['تاریخ شمسی'], note: row['یادداشت']
  }))
  const shares = sheetRows(sharesSheet).map((row) => ({ expense_id: row.expense_id, member_id: row.member_id, weight: row['ضریب سهم'] }))
  return validateEventTransfer({
    format: metadata.format,
    schema_version: metadata.schema_version,
    event: { title: metadata.title, date: metadata.date, currency: metadata.currency, rounding_increment: metadata.rounding_increment, note: metadata.note },
    members, expenses, shares
  })
}
