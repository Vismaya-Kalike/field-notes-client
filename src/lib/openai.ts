import OpenAI from 'openai'

const apiKey = import.meta.env.VITE_OPENAI_API_KEY

if (!apiKey) {
  console.warn('Missing OpenAI API key. LLM features will not work.')
}

export const openai = apiKey ? new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true // Note: In production, API calls should go through a backend
}) : null

export interface LLMAnalysisRequest {
  facilitatorName: string
  fieldNotes: Array<{ timestamp: string; text: string }>
  images: Array<{ url: string; caption?: string }>
  customPrompt?: string
}

export async function generateLLMAnalysis({
  facilitatorName,
  fieldNotes,
  images,
  customPrompt
}: LLMAnalysisRequest): Promise<string> {
  if (!openai) {
    throw new Error('OpenAI client not initialized. Please check your API key.')
  }

  // Format field notes
  const fieldNotesText = fieldNotes.length > 0
    ? fieldNotes.map(note => `[${note.timestamp}] ${note.text}`).join('\n')
    : 'Limited text messages - analysis should focus primarily on visual documentation.'

  // Use custom prompt or default prompt
  const prompt = customPrompt || getDefaultPrompt(facilitatorName, fieldNotesText, images.length)

  // Build message content
  type MessageContent =
    | { type: 'text'; text: string }
    | { type: 'image_url'; image_url: { url: string; detail: string } }

  const content: MessageContent[] = [
    {
      type: 'text',
      text: prompt
    }
  ]

  // Add images
  for (let i = 0; i < Math.min(images.length, 10); i++) {
    const img = images[i]
    content.push({
      type: 'image_url',
      image_url: {
        url: img.url,
        detail: 'high'
      }
    })

    // Add caption if available
    if (img.caption) {
      content.push({
        type: 'text',
        text: `Caption for image ${i + 1}: ${img.caption}`
      })
    }
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: content as OpenAI.Chat.Completions.ChatCompletionContentPart[]
        }
      ],
      temperature: 1.0,
      max_tokens: 4000,
    })

    return response.choices[0].message.content || 'No analysis generated'
  } catch (error) {
    console.error('OpenAI API error:', error)
    throw error
  }
}

function getDefaultPrompt(facilitatorName: string, fieldNotesText: string, imagesCount: number): string {
  return `You are analyzing field notes from a learning facilitator named ${facilitatorName}. The facilitator works with oppressed communities and creates after school learning spaces with a view to build agency. Spaces are designed to be safe, open, joyful and self-determined where learners can make their own decisions.

CONTEXT: The facilitator has shared photos as well as some field notes. Since facilitators often prefer sending images over text, the visual content is crucial for understanding their work.

INSTRUCTIONS:
- Analyze both the images and text messages to understand what is happening at the learning center
- Observe if the learning center is safe, open, joyful and self-determined
- Make a note if there is play happening in the learning centers
- Check if the learning center is different from school like spaces
- The images show real field work activities - describe what you see and avoid making assumptions
- Create a comprehensive field work report based on visual evidence and text notes
- Pay special attention to the visual documentation as it's the primary way this facilitator communicates their work

TEXT MESSAGES AND FIELD NOTES:
${fieldNotesText}

IMAGES PROVIDED: ${imagesCount} work-related photos showing field activities

Write this as a professional field work assessment report that recognizes the visual documentation as the primary evidence of the facilitator's work and impact. Don't make up any details and don't add any details that are not in the text messages or images. Don't include the messages and photos in the report. You don't have to describe each photo. You don't need to include the purpose or details about the organisation. It's okay if the report is short and doesn't have a lot of details. Do not include any title or date in the report.`
}
