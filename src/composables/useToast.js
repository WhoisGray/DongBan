import { reactive } from 'vue'
import { createId } from '../utils/id.js'

const messages = reactive([])
export function useToast() {
  function show(text, type = 'success') {
    const id = createId('toast'); messages.push({ id, text, type })
    setTimeout(() => { const index = messages.findIndex((item) => item.id === id); if (index >= 0) messages.splice(index, 1) }, 3200)
  }
  return { messages, show }
}
