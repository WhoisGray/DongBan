import { describe, expect, it } from 'vitest'
import { createSampleTransfer } from './eventTransfer.js'
import { eventTransferToWorkbook, eventTransferToXlsxBuffer, xlsxBufferToEvent } from './eventWorkbook.js'

describe('event Excel workbook', () => {
  it('creates all separated right-to-left worksheets', async () => {
    const workbook = await eventTransferToWorkbook(createSampleTransfer())
    expect(workbook.worksheets.map((sheet) => sheet.name)).toEqual([
      'راهنما', 'رویداد', 'اعضا', 'هزینه‌ها', 'سهم‌ها', 'مادرخرج‌ها', 'خلاصه افراد', 'تسویه‌ها'
    ])
    workbook.worksheets.forEach((sheet) => expect(sheet.views[0].rightToLeft).toBe(true))
    expect(workbook.getWorksheet('اعضا').views[0]).toMatchObject({ state: 'frozen', ySplit: 4 })
    expect(workbook.getWorksheet('رویداد').getCell('B8').numFmt).toBe('yyyy-mm-dd')
    expect(workbook.getWorksheet('رویداد').getCell('B10').numFmt).not.toBe('yyyy-mm-dd')
  })

  it('imports its own XLSX output as an editable event', async () => {
    const buffer = await eventTransferToXlsxBuffer(createSampleTransfer())
    const event = await xlsxBufferToEvent(buffer)
    expect(event.people.map((person) => person.name)).toEqual(['سارا', 'علی', 'مینا'])
    expect(event.expenses[0].amountMinor).toBe(750000)
    expect(event.expenses[0].splits).toEqual({ person_1: 1, person_2: 1, person_3: 1 })
  })

  it('preserves decimal currencies in Excel', async () => {
    const transfer = createSampleTransfer()
    transfer.event.currency = 'USD'
    transfer.expenses[0].amount = 12.34
    const buffer = await eventTransferToXlsxBuffer(transfer)
    const event = await xlsxBufferToEvent(buffer)
    expect(event.expenses[0].amountMinor).toBe(1234)
  })
})
