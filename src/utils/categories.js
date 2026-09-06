export const categories = [
  { id: 'food', label: 'خوراک', icon: '🍽️' }, { id: 'transport', label: 'رفت‌وآمد', icon: '🚕' },
  { id: 'stay', label: 'اقامت', icon: '🏠' }, { id: 'shopping', label: 'خرید', icon: '🛍️' },
  { id: 'fun', label: 'تفریح', icon: '🎉' }, { id: 'other', label: 'سایر', icon: '📦' }
]
export const getCategory = (id) => categories.find((item) => item.id === id) || categories.at(-1)
