/**
 * Iranian bank card and Sheba (IBAN) validation and bank detection utilities.
 */

export const BANKS_LIST = [
  { key: 'meli', name: 'بانک ملی ایران' },
  { key: 'mellat', name: 'بانک ملت' },
  { key: 'tejarat', name: 'بانک تجارت' },
  { key: 'saderat', name: 'بانک صادرات ایران' },
  { key: 'sepah', name: 'بانک سپه' },
  { key: 'keshavarsi', name: 'بانک کشاورزی' },
  { key: 'maskan', name: 'بانک مسکن' },
  { key: 'refah', name: 'بانک رفاه کارگران' },
  { key: 'blu', name: 'بلوبانک' },
  { key: 'resalat', name: 'بانک قرض‌الحسنه رسالت' },
  { key: 'mehreqtesad', name: 'بانک قرض‌الحسنه مهر ایران' },
  { key: 'pasargad', name: 'بانک پاسارگاد' },
  { key: 'saman', name: 'بانک سامان' },
  { key: 'parsian', name: 'بانک پارسیان' },
  { key: 'shahr', name: 'بانک شهر' },
  { key: 'ayandeh', name: 'بانک آینده' },
  { key: 'eghtesad', name: 'بانک اقتصاد نوین' },
  { key: 'sina', name: 'بانک سینا' },
  { key: 'karafarin', name: 'بانک کارآفرین' },
  { key: 'postbank', name: 'پست بانک ایران' },
  { key: 'sanatmadan', name: 'بانک صنعت و معدن' },
  { key: 'tosehe', name: 'بانک توسعه تعاون' },
  { key: 'iranzamin', name: 'بانک ایران زمین' },
  { key: 'gardeshgari', name: 'بانک گردشگری' },
  { key: 'day', name: 'بانک دی' },
  { key: 'sarmaye', name: 'بانک سرمایه' },
  { key: 'khavarmiyaneh', name: 'بانک خاورمیانه' },
  { key: 'ansar', name: 'بانک انصار' },
  { key: 'ghavamin', name: 'بانک قوامین' },
  { key: 'markazi', name: 'بانک مرکزی' }
]

const cardPrefixMap8 = {
  '62198619': { bankKey: 'blu', bankName: 'بلوبانک' },
}

const cardPrefixMap = {
  '636795': { bankKey: 'markazi', bankName: 'بانک مرکزی' },
  '603799': { bankKey: 'meli', bankName: 'بانک ملی' },
  '589210': { bankKey: 'sepah', bankName: 'بانک سپه' },
  '627961': { bankKey: 'sanatmadan', bankName: 'بانک صنعت و معدن' },
  '603770': { bankKey: 'keshavarsi', bankName: 'بانک کشاورزی' },
  '628023': { bankKey: 'maskan', bankName: 'بانک مسکن' },
  '627760': { bankKey: 'postbank', bankName: 'پست بانک' },
  '502908': { bankKey: 'tosehe', bankName: 'بانک توسعه' },
  '627412': { bankKey: 'eghtesad', bankName: 'بانک اقتصاد نوین' },
  '622106': { bankKey: 'parsian', bankName: 'بانک پارسیان' },
  '502229': { bankKey: 'pasargad', bankName: 'بانک پاسارگاد' },
  '639347': { bankKey: 'pasargad', bankName: 'بانک پاسارگاد' },
  '627488': { bankKey: 'karafarin', bankName: 'بانک کارآفرین' },
  '502910': { bankKey: 'karafarin', bankName: 'بانک کارآفرین' },
  '621986': { bankKey: 'saman', bankName: 'بانک سامان' },
  '639346': { bankKey: 'sina', bankName: 'بانک سینا' },
  '639607': { bankKey: 'sarmaye', bankName: 'بانک سرمایه' },
  '502806': { bankKey: 'shahr', bankName: 'بانک شهر' },
  '504706': { bankKey: 'shahr', bankName: 'بانک شهر' },
  '502938': { bankKey: 'day', bankName: 'بانک دی' },
  '603769': { bankKey: 'saderat', bankName: 'بانک صادرات' },
  '610433': { bankKey: 'mellat', bankName: 'بانک ملت' },
  '991975': { bankKey: 'mellat', bankName: 'بانک ملت' },
  '627353': { bankKey: 'tejarat', bankName: 'بانک تجارت' },
  '585983': { bankKey: 'tejarat', bankName: 'بانک تجارت' },
  '589463': { bankKey: 'refah', bankName: 'بانک رفاه' },
  '627381': { bankKey: 'ansar', bankName: 'بانک انصار' },
  '639370': { bankKey: 'sepah', bankName: 'بانک سپه' },
  '606373': { bankKey: 'mehreqtesad', bankName: 'بانک قرض‌الحسنه مهر' },
  '639599': { bankKey: 'ghavamin', bankName: 'بانک قوامین' },
  '504172': { bankKey: 'resalat', bankName: 'بانک رسالت' },
  '636214': { bankKey: 'ayandeh', bankName: 'بانک آینده' },
  '505785': { bankKey: 'iranzamin', bankName: 'بانک ایران زمین' },
  '505416': { bankKey: 'gardeshgari', bankName: 'بانک گردشگری' },
  '585947': { bankKey: 'khavarmiyaneh', bankName: 'بانک خاورمیانه' }
}

const shebaCodeMap = {
  '010': { bankKey: 'markazi', bankName: 'بانک مرکزی' },
  '011': { bankKey: 'sanatmadan', bankName: 'بانک صنعت و معدن' },
  '012': { bankKey: 'mellat', bankName: 'بانک ملت' },
  '013': { bankKey: 'refah', bankName: 'بانک رفاه' },
  '014': { bankKey: 'maskan', bankName: 'بانک مسکن' },
  '015': { bankKey: 'sepah', bankName: 'بانک سپه' },
  '016': { bankKey: 'keshavarsi', bankName: 'بانک کشاورزی' },
  '017': { bankKey: 'meli', bankName: 'بانک ملی ایران' },
  '018': { bankKey: 'tejarat', bankName: 'بانک تجارت' },
  '019': { bankKey: 'saderat', bankName: 'بانک صادرات' },
  '020': { bankKey: 'tosehe', bankName: 'بانک توسعه صادرات' },
  '021': { bankKey: 'postbank', bankName: 'پست بانک ایران' },
  '022': { bankKey: 'tosehe', bankName: 'بانک توسعه تعاون' },
  '051': { bankKey: 'tosehe', bankName: 'موسسه اعتباری توسعه' },
  '053': { bankKey: 'karafarin', bankName: 'بانک کارآفرین' },
  '054': { bankKey: 'parsian', bankName: 'بانک پارسیان' },
  '055': { bankKey: 'eghtesad', bankName: 'بانک اقتصاد نوین' },
  '056': { bankKey: 'saman', bankName: 'بانک سامان' },
  '057': { bankKey: 'pasargad', bankName: 'بانک پاسارگاد' },
  '058': { bankKey: 'sarmaye', bankName: 'بانک سرمایه' },
  '059': { bankKey: 'sina', bankName: 'بانک سینا' },
  '060': { bankKey: 'mehreqtesad', bankName: 'بانک قرض‌الحسنه مهر' },
  '061': { bankKey: 'shahr', bankName: 'بانک شهر' },
  '062': { bankKey: 'ayandeh', bankName: 'بانک آینده' },
  '063': { bankKey: 'ansar', bankName: 'بانک انصار' },
  '064': { bankKey: 'gardeshgari', bankName: 'بانک گردشگری' },
  '065': { bankKey: 'sepah', bankName: 'بانک حکمت ایرانیان' },
  '066': { bankKey: 'day', bankName: 'بانک دی' },
  '069': { bankKey: 'iranzamin', bankName: 'بانک ایران زمین' },
  '070': { bankKey: 'resalat', bankName: 'بانک رسالت' },
  '078': { bankKey: 'khavarmiyaneh', bankName: 'بانک خاورمیانه' }
}

export function convertPersianToEnglishDigits(str) {
  if (!str) return ''
  const persian = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  const arabic = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']
  const english = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

  let result = String(str)
  for (let i = 0; i < 10; i += 1) {
    result = result.replaceAll(persian[i], english[i]).replaceAll(arabic[i], english[i])
  }
  return result
}

export function cleanDigits(str) {
  return convertPersianToEnglishDigits(str).replace(/\D/g, '')
}

export function validateCard(cardNumber) {
  const digits = cleanDigits(cardNumber)
  if (digits.length !== 16) return false

  const nums = digits.split('').map(Number)
  const checkSum = nums.reduce((sum, digit, index) => {
    const num = digit * (index % 2 === 0 ? 2 : 1)
    return sum + (num > 9 ? num - 9 : num)
  }, 0)

  return checkSum % 10 === 0
}

export function getBankFromCard(cardNumber) {
  const digits = cleanDigits(cardNumber)
  if (digits.length >= 8) {
    const prefix8 = digits.slice(0, 8)
    if (cardPrefixMap8[prefix8]) return cardPrefixMap8[prefix8]
  }
  if (digits.length >= 6) {
    const prefix6 = digits.slice(0, 6)
    return cardPrefixMap[prefix6] || null
  }
  return null
}

export function extractShebaDigits(sheba) {
  const cleaned = convertPersianToEnglishDigits(sheba).toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (cleaned.startsWith('IR')) return cleaned.slice(2)
  return cleaned
}

export function getBankFromShaba(shebaOrCode) {
  if (!shebaOrCode) return null
  const cleaned = convertPersianToEnglishDigits(shebaOrCode).toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (cleaned.length === 3 && shebaCodeMap[cleaned]) {
    return shebaCodeMap[cleaned]
  }
  const digits = extractShebaDigits(cleaned)
  if (digits.length >= 5) {
    const code = digits.slice(2, 5)
    return shebaCodeMap[code] || null
  }
  return null
}

export function validateSheba(sheba) {
  if (!sheba) return false
  let cleaned = convertPersianToEnglishDigits(sheba).toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (!cleaned.startsWith('IR')) cleaned = `IR${cleaned}`
  if (cleaned.length !== 26 || !/^IR\d{24}$/.test(cleaned)) return false

  // Rearrange: IR + 2 check digits (first 4 characters) moved to end
  const rearranged = cleaned.slice(4) + cleaned.slice(0, 4)
  const prepared = rearranged.split('').map((char) => {
    const code = char.charCodeAt(0)
    return code >= 65 && code <= 90 ? (code - 55).toString() : char
  }).join('')

  let remainder = prepared
  while (remainder.length > 2) {
    const block = remainder.slice(0, 9)
    remainder = String(parseInt(block, 10) % 97) + remainder.slice(block.length)
  }
  return parseInt(remainder, 10) % 97 === 1
}

export function formatCardNumber(cardNumber, separator = ' ') {
  const digits = cleanDigits(cardNumber).slice(0, 16)
  if (!digits) return ''
  return digits.match(/.{1,4}/g)?.join(separator) || digits
}

export function formatSheba(sheba) {
  if (!sheba) return ''
  const digits = extractShebaDigits(sheba).slice(0, 24)
  if (!digits) return ''
  const formattedDigits = digits.match(/.{1,4}/g)?.join(' ') || digits
  return `IR${formattedDigits}`
}

export function getBankIconUrl(bankKey) {
  if (!bankKey || bankKey === 'no-img') return '/icons/bank/no-img.png'
  return `/icons/bank/${bankKey}.png`
}
