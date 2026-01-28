import { TravelFormData } from '../types'

export async function generateItinerary(formData: TravelFormData): Promise<string> {
  const response = await fetch('/api/generate-itinerary', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData)
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || '生成行程失败')
  }

  const data = await response.json()
  return data.itinerary
}
