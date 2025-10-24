import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { generateLLMAnalysis } from '../lib/openai'
import { Card, CardContent, CardHeader } from './ui/card'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import type { FieldNote, FieldImage } from '../types/database'

interface MonthYear {
  month: number
  year: number
  display: string
}

interface SimpleLearningCentre {
  id: string
  centre_name: string
  district: string
  state: string
  facilitators: Array<{ name: string }>
}

export default function LLMAnalysisPlayground() {
  const [selectedCentreId, setSelectedCentreId] = useState<string>('')
  const [selectedMonth, setSelectedMonth] = useState<string>('')
  const [prompt, setPrompt] = useState<string>('')
  const [analysis, setAnalysis] = useState<string>('')
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)

  // Load default prompt from the scripts
  const defaultPrompt = `You are analyzing field notes from a learning facilitator named {{FACILITATOR_NAME}}. The facilitator works with oppressed communities and creates after school learning spaces with a view to build agency. Spaces are designed to be safe, open, joyful and self-determined where learners can make their own decisions.

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
{{FIELD_NOTES}}

IMAGES PROVIDED: {{IMAGES_COUNT}} work-related photos showing field activities

Write this as a professional field work assessment report that recognizes the visual documentation as the primary evidence of the facilitator's work and impact. Don't make up any details and don't add any details that are not in the text messages or images. Don't include the messages and photos in the report. You don't have to describe each photo. You don't need to include the purpose or details about the organisation. It's okay if the report is short and doesn't have a lot of details. Do not include any title or date in the report.`

  // Fetch learning centres
  const { data: learningCentres = [] } = useQuery({
    queryKey: ['learningCentres'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learning_centres_with_details')
        .select('id, centre_name, district, state, facilitators')
        .order('centre_name')

      if (error) throw error
      return (data || []) as SimpleLearningCentre[]
    },
  })

  // Fetch available months for selected centre
  const { data: availableMonths = [] } = useQuery({
    queryKey: ['availableMonths', selectedCentreId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('generated_reports_summary')
        .select('month, year')
        .eq('learning_centre_id', selectedCentreId)
        .order('year', { ascending: false })
        .order('month', { ascending: false })

      if (error) throw error

      const months: MonthYear[] = (data || []).map(item => ({
        month: item.month,
        year: item.year,
        display: new Date(item.year, item.month - 1).toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric'
        })
      }))

      // Auto-select first month
      if (months.length > 0 && !selectedMonth) {
        setSelectedMonth(`${months[0].year}-${months[0].month}`)
      }

      return months
    },
    enabled: !!selectedCentreId,
  })

  // Fetch field notes and images for selected month
  const { data: fieldData } = useQuery({
    queryKey: ['fieldData', selectedCentreId, selectedMonth],
    queryFn: async () => {
      if (!selectedMonth) return { notes: [], images: [] }

      const [year, month] = selectedMonth.split('-').map(Number)
      const startDate = new Date(year, month - 1, 1)
      const endDate = new Date(year, month, 0, 23, 59, 59)

      const [notesResult, imagesResult] = await Promise.all([
        supabase
          .from('field_notes')
          .select('*')
          .eq('learning_centre_id', selectedCentreId)
          .gte('sent_at', startDate.toISOString())
          .lte('sent_at', endDate.toISOString())
          .order('sent_at', { ascending: true }),
        supabase
          .from('field_images')
          .select('*')
          .eq('learning_centre_id', selectedCentreId)
          .gte('sent_at', startDate.toISOString())
          .lte('sent_at', endDate.toISOString())
          .order('sent_at', { ascending: true })
      ])

      if (notesResult.error) throw notesResult.error
      if (imagesResult.error) throw imagesResult.error

      return {
        notes: (notesResult.data || []) as FieldNote[],
        images: (imagesResult.data || []) as FieldImage[]
      }
    },
    enabled: !!selectedCentreId && !!selectedMonth,
  })

  const fieldNotes = fieldData?.notes || []
  const images = fieldData?.images || []

  // Set default prompt on mount
  if (!prompt) {
    setPrompt(defaultPrompt)
  }

  async function runAnalysis() {
    if (!selectedCentreId || !selectedMonth) {
      setAnalysisError('Please select a learning centre and month')
      return
    }

    setAnalysisLoading(true)
    setAnalysisError(null)
    setAnalysis('')

    try {
      const centre = learningCentres.find(c => c.id === selectedCentreId)
      const facilitatorName = centre?.facilitators?.[0]?.name || 'Facilitator'

      // Prepare field notes with timestamps
      const formattedNotes = fieldNotes.map(note => ({
        timestamp: note.sent_at || note.created_at,
        text: note.text
      }))

      // Prepare images with URLs
      const formattedImages = images.map(img => ({
        url: img.photo_url,
        caption: img.caption
      }))

      // Replace placeholders in prompt
      let processedPrompt = prompt
        .replace(/\{\{FACILITATOR_NAME\}\}/g, facilitatorName)
        .replace(/\{\{IMAGES_COUNT\}\}/g, String(formattedImages.length))

      const fieldNotesText = formattedNotes.length > 0
        ? formattedNotes.map(note => `[${note.timestamp}] ${note.text}`).join('\n')
        : 'Limited text messages - analysis should focus primarily on visual documentation.'

      processedPrompt = processedPrompt.replace(/\{\{FIELD_NOTES\}\}/g, fieldNotesText)

      const result = await generateLLMAnalysis({
        facilitatorName,
        fieldNotes: formattedNotes,
        images: formattedImages,
        customPrompt: processedPrompt
      })

      setAnalysis(result)
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : 'Failed to generate analysis')
    } finally {
      setAnalysisLoading(false)
    }
  }

  const selectedCentre = learningCentres.find(c => c.id === selectedCentreId)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">LLM Analysis Playground</h1>
          <p className="text-sm text-gray-500 mt-1">
            Test and experiment with LLM analysis on field notes and images
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Controls */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium">Configuration</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="centre">Learning Centre</Label>
                  <Select value={selectedCentreId} onValueChange={setSelectedCentreId}>
                    <SelectTrigger id="centre">
                      <SelectValue placeholder="Select a learning centre" />
                    </SelectTrigger>
                    <SelectContent>
                      {learningCentres.map(centre => (
                        <SelectItem key={centre.id} value={centre.id}>
                          {centre.centre_name} ({centre.district}, {centre.state})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="month">Month</Label>
                  <Select
                    value={selectedMonth}
                    onValueChange={setSelectedMonth}
                    disabled={!selectedCentreId}
                  >
                    <SelectTrigger id="month">
                      <SelectValue placeholder="Select a month" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableMonths.map(m => (
                        <SelectItem key={`${m.year}-${m.month}`} value={`${m.year}-${m.month}`}>
                          {m.display}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedCentre && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Facilitator:</span>{' '}
                      {selectedCentre.facilitators?.[0]?.name || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">Field Notes:</span> {fieldNotes.length}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">Images:</span> {images.length}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium">Prompt</h2>
                <p className="text-sm text-gray-500">
                  Customize the prompt. Use placeholders: {'{{FACILITATOR_NAME}}'}, {'{{FIELD_NOTES}}'}, {'{{IMAGES_COUNT}}'}
                </p>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={15}
                  className="font-mono text-xs"
                  placeholder="Enter your custom prompt here..."
                />
                <div className="mt-4">
                  <Button
                    onClick={() => setPrompt(defaultPrompt)}
                    variant="outline"
                    className="w-full"
                  >
                    Reset to Default Prompt
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={runAnalysis}
              disabled={analysisLoading || !selectedCentreId || !selectedMonth}
              className="w-full"
            >
              {analysisLoading ? 'Generating Analysis...' : 'Run Analysis'}
            </Button>

            {analysisError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md text-sm text-red-800">
                {analysisError}
              </div>
            )}
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium">Analysis Result</h2>
              </CardHeader>
              <CardContent>
                {analysisLoading && (
                  <div className="text-center py-8 text-gray-500">
                    Generating analysis...
                  </div>
                )}
                {!analysisLoading && !analysis && (
                  <div className="text-center py-8 text-gray-400">
                    Select a learning centre and month, then click "Run Analysis" to see results here.
                  </div>
                )}
                {!analysisLoading && analysis && (
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded-md">
                      {analysis}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>

            {images.length > 0 && (
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-medium">Images Preview ({images.length})</h2>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {images.slice(0, 6).map((img, idx) => (
                      <div key={img.id} className="space-y-2">
                        <img
                          src={img.photo_url}
                          alt={img.caption || `Image ${idx + 1}`}
                          className="w-full h-32 object-cover rounded-md"
                        />
                        {img.caption && (
                          <p className="text-xs text-gray-600">{img.caption}</p>
                        )}
                      </div>
                    ))}
                  </div>
                  {images.length > 6 && (
                    <p className="text-xs text-gray-500 mt-4 text-center">
                      Showing 6 of {images.length} images
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {fieldNotes.length > 0 && (
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-medium">Field Notes Preview ({fieldNotes.length})</h2>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {fieldNotes.slice(0, 10).map((note) => (
                      <div key={note.id} className="text-sm border-l-2 border-gray-300 pl-3 py-1">
                        <p className="text-xs text-gray-500">
                          {new Date(note.sent_at || note.created_at).toLocaleString()}
                        </p>
                        <p className="text-gray-700 mt-1">{note.text}</p>
                      </div>
                    ))}
                  </div>
                  {fieldNotes.length > 10 && (
                    <p className="text-xs text-gray-500 mt-4 text-center">
                      Showing 10 of {fieldNotes.length} notes
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
  )
}
