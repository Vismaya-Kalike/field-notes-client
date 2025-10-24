import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { GeneratedReport, FieldImage, FieldNote } from '../types/database';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';

interface ReportLLMAnalysis {
  id: string;
  text: string;
  created_at: string;
}

type SectionKey = 'summary' | 'images' | 'analysis' | 'notes';

export default function ReportDetail() {
  const { reportId, centreId, state: stateParam, district: districtParam } = useParams<{ 
    reportId: string;
    centreId: string;
    state: string;
    district: string;
  }>();
  const navigate = useNavigate();
  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>({
    summary: true,
    images: true,
    notes: false,
    analysis: true,
  });

  const toggleSection = (section: SectionKey) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Fetch report summary
  const { data: report, isLoading: reportLoading, error: reportError } = useQuery({
    queryKey: ['report', reportId],
    queryFn: async () => {
      const { data: reportData, error: reportError } = await supabase
        .from('generated_reports_summary')
        .select('*')
        .eq('id', reportId)
        .single();

      if (reportError) throw reportError;
      return reportData as GeneratedReport
    },
    enabled: !!reportId,
  })

  // Calculate period dates from report
  const reportYear = report ? Number(report.year) : 0;
  const reportMonth = report ? Number(report.month) : 0;
  const periodStart = report ? new Date(Date.UTC(reportYear, reportMonth - 1, 1)) : null;
  const periodEnd = report ? new Date(Date.UTC(reportYear, reportMonth, 1)) : null;
  const periodStartIso = periodStart?.toISOString() ?? '';
  const periodEndIso = periodEnd?.toISOString() ?? '';

  // Fetch images
  const { data: images = [], isLoading: imagesLoading } = useQuery({
    queryKey: ['reportImages', report?.learning_centre_id, periodStartIso, periodEndIso],
    queryFn: async () => {
      if (!report) return [];

      const [imagesPrimaryResult, imagesFallbackResult] = await Promise.all([
        supabase
          .from('field_images')
          .select('*')
          .eq('learning_centre_id', report.learning_centre_id)
          .not('sent_at', 'is', null)
          .gte('sent_at', periodStartIso)
          .lt('sent_at', periodEndIso),
        supabase
          .from('field_images')
          .select('*')
          .eq('learning_centre_id', report.learning_centre_id)
          .is('sent_at', null)
          .gte('created_at', periodStartIso)
          .lt('created_at', periodEndIso),
      ]);

      if (imagesPrimaryResult.error) throw imagesPrimaryResult.error;
      if (imagesFallbackResult.error) throw imagesFallbackResult.error;

      const uniqueImages = new Map<string, FieldImage>();
      [...(imagesPrimaryResult.data ?? []), ...(imagesFallbackResult.data ?? [])].forEach((image) => {
        uniqueImages.set(image.id, image);
      });
      const sortedImages = Array.from(uniqueImages.values()).sort((a, b) => {
        const aDate = a.sent_at ?? a.created_at;
        const bDate = b.sent_at ?? b.created_at;
        if (!aDate && !bDate) return 0;
        if (!aDate) return 1;
        if (!bDate) return -1;
        return new Date(aDate).getTime() - new Date(bDate).getTime();
      });

      return sortedImages as FieldImage[]
    },
    enabled: !!report && !!periodStartIso && !!periodEndIso,
  })

  // Fetch field notes
  const { data: fieldNotes = [], isLoading: notesLoading } = useQuery({
    queryKey: ['reportFieldNotes', report?.learning_centre_id, periodStartIso, periodEndIso],
    queryFn: async () => {
      if (!report) return [];

      const [notesPrimaryResult, notesFallbackResult] = await Promise.all([
        supabase
          .from('field_notes')
          .select('*')
          .eq('learning_centre_id', report.learning_centre_id)
          .not('sent_at', 'is', null)
          .gte('sent_at', periodStartIso)
          .lt('sent_at', periodEndIso),
        supabase
          .from('field_notes')
          .select('*')
          .eq('learning_centre_id', report.learning_centre_id)
          .is('sent_at', null)
          .gte('created_at', periodStartIso)
          .lt('created_at', periodEndIso),
      ]);

      if (notesPrimaryResult.error) throw notesPrimaryResult.error;
      if (notesFallbackResult.error) throw notesFallbackResult.error;

      const uniqueNotes = new Map<string, FieldNote>();
      [...(notesPrimaryResult.data ?? []), ...(notesFallbackResult.data ?? [])].forEach((note) => {
        uniqueNotes.set(note.id, note);
      });
      const sortedNotes = Array.from(uniqueNotes.values()).sort((a, b) => {
        const aDate = a.sent_at ?? a.created_at;
        const bDate = b.sent_at ?? b.created_at;
        if (!aDate && !bDate) return 0;
        if (!aDate) return 1;
        if (!bDate) return -1;
        return new Date(aDate).getTime() - new Date(bDate).getTime();
      });

      return sortedNotes as FieldNote[]
    },
    enabled: !!report && !!periodStartIso && !!periodEndIso,
  })

  // Fetch LLM analysis if available
  const { data: llmAnalysis = null, isLoading: analysisLoading } = useQuery({
    queryKey: ['reportLLMAnalysis', reportId],
    queryFn: async () => {
      const { data: analysisData, error: analysisError } = await supabase
        .from('generated_report_llm_analysis')
        .select('*')
        .eq('generated_report_id', reportId)
        .single();

      if (analysisError && analysisError.code !== 'PGRST116') { // PGRST116 = no rows found
        throw analysisError;
      }
      return analysisData as ReportLLMAnalysis | null
    },
    enabled: !!reportId && !!report?.has_llm_analysis,
  })

  const imageCount = images.length;
  const fieldNoteCount = fieldNotes.length;
  const loading = reportLoading
  const error = reportError?.message || null;

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center mb-8">
        <Skeleton className="h-10 w-48 mr-4" />
        <Skeleton className="h-8 w-64" />
      </div>
      <div className="space-y-5">
        <div className="rounded-lg bg-white p-5 shadow-sm">
          <Skeleton className="h-6 w-48 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
        <div className="rounded-lg bg-white p-5 shadow-sm">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center text-red-600">Error: {error}</div>
    </div>
  );

  if (!report) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center text-gray-500">Report not found</div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Button
          onClick={() =>
            navigate(
              `/${encodeURIComponent(stateParam || '')}/${encodeURIComponent(districtParam || '')}/centre/${centreId}`,
            )
          }
          variant="link"
          className="mb-2 gap-1 text-gray-500 hover:text-gray-900"
        >
          ← Back to Learning Centre
        </Button>
        <h1 className="text-2xl font-semibold text-gray-900">{report.month_year_display} Report</h1>
      </div>

      {/* Report Summary */}
      <section className="mb-6 rounded-lg bg-white shadow-sm">
        <button
          type="button"
          onClick={() => toggleSection('summary')}
          aria-expanded={openSections.summary}
          className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-gray-50 focus:outline-none"
        >
          <span className="text-base font-medium text-gray-900">Report Summary</span>
          <ChevronDown
            className={`h-4 w-4 text-gray-500 transition-transform ${openSections.summary ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>
        {openSections.summary && (
          <div className="space-y-6 border-t border-gray-100 p-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-center">
                {imagesLoading ? (
                  <Skeleton className="h-7 w-8 mx-auto" />
                ) : (
                  <div className="text-lg text-gray-900">{imageCount}</div>
                )}
                <div className="text-xs uppercase tracking-wide text-gray-500">Images</div>
              </div>
              <div className="rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-center">
                {notesLoading ? (
                  <Skeleton className="h-7 w-8 mx-auto" />
                ) : (
                  <div className="text-lg text-gray-900">{fieldNoteCount}</div>
                )}
                <div className="text-xs uppercase tracking-wide text-gray-500">Field Notes</div>
              </div>
              <div className="rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-center">
                <div className="text-lg text-gray-900">
                  {report.has_llm_analysis ? 'Yes' : 'No'}
                </div>
                <div className="text-xs uppercase tracking-wide text-gray-500">LLM Analysis</div>
              </div>
            </div>
            <dl className="grid grid-cols-1 gap-4 text-sm text-gray-600 md:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wide text-gray-500">Facilitator</dt>
                <dd className="font-medium text-gray-900">{report.facilitator_name}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-gray-500">Learning Centre</dt>
                <dd className="font-medium text-gray-900">{report.learning_centre_name}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-gray-500">Created</dt>
                <dd className="font-medium text-gray-900">{new Date(report.created_at).toLocaleDateString()}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-gray-500">Period</dt>
                <dd className="font-medium text-gray-900">{report.month_year_display}</dd>
              </div>
            </dl>
          </div>
        )}
      </section>

      {/* Images Section */}
      <section className="mb-6 rounded-lg bg-white shadow-sm">
        <button
          type="button"
          onClick={() => toggleSection('images')}
          aria-expanded={openSections.images}
          className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-gray-50 focus:outline-none"
        >
          <div>
            <span className="block text-base font-medium text-gray-900">Images</span>
            {imagesLoading ? (
              <Skeleton className="h-4 w-16 mt-1" />
            ) : (
              <span className="block text-xs text-gray-500">
                {images.length} {images.length === 1 ? 'image' : 'images'}
              </span>
            )}
          </div>
          <ChevronDown
            className={`h-4 w-4 text-gray-500 transition-transform ${openSections.images ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>
        {openSections.images && (
          <div className="border-t border-gray-100 p-5">
            {imagesLoading ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-48 w-full bg-gray-200 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : images.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {images.map((image) => (
                  <div key={image.id} className="overflow-hidden rounded-lg bg-gray-100">
                    <img
                      src={image.photo_url}
                      alt="Report image"
                      className="h-48 w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400 text-sm">
                No images available for this report
              </div>
            )}
          </div>
        )}
      </section>

      {/* LLM Analysis Section */}
      {report.has_llm_analysis && (
        <section className="mb-6 rounded-lg bg-white shadow-sm">
          <button
            type="button"
            onClick={() => toggleSection('analysis')}
            aria-expanded={openSections.analysis}
            className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-gray-50 focus:outline-none"
          >
            <span className="text-base font-medium text-gray-900">
              LLM Generated Report from Field Notes
            </span>
            <ChevronDown
              className={`h-4 w-4 text-gray-500 transition-transform ${openSections.analysis ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </button>
          {openSections.analysis && (
            <div className="border-t border-gray-100 p-5">
              {analysisLoading ? (
                <div className="rounded-md bg-gray-50 p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-3/6 animate-pulse" />
                </div>
              ) : llmAnalysis ? (
                <div className="rounded-md bg-gray-50 p-5">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{llmAnalysis.text}</p>
                  <div className="mt-4 text-xs text-gray-500">
                    Generated {new Date(llmAnalysis.created_at).toLocaleString()}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No LLM analysis available
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* Field Notes Section */}
      <section className="mt-6 rounded-lg bg-white shadow-sm">
        <button
          type="button"
          onClick={() => toggleSection('notes')}
          aria-expanded={openSections.notes}
          className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-gray-50 focus:outline-none"
        >
          <div>
            <span className="block text-base font-medium text-gray-900">Field Notes</span>
            {notesLoading ? (
              <Skeleton className="h-4 w-16 mt-1" />
            ) : (
              <span className="block text-xs text-gray-500">
                {fieldNotes.length} {fieldNotes.length === 1 ? 'note' : 'notes'}
              </span>
            )}
          </div>
          <ChevronDown
            className={`h-4 w-4 text-gray-500 transition-transform ${openSections.notes ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>
        {openSections.notes && (
          <div className="space-y-4 border-t border-gray-100 p-5">
            {notesLoading ? (
              <>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="rounded-lg border border-gray-100 bg-gray-50/70 p-4 shadow-sm">
                    <div className="h-3 bg-gray-200 rounded w-1/4 mb-2 animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-5/6 mt-1 animate-pulse" />
                  </div>
                ))}
              </>
            ) : fieldNotes.length > 0 ? (
              fieldNotes.map((note) => {
                const displayDate = note.sent_at ?? note.created_at;
                return (
                  <article
                    key={note.id}
                    className="rounded-lg border border-gray-100 bg-gray-50/70 p-4 shadow-sm"
                  >
                    {displayDate && (
                      <p className="text-xs uppercase tracking-wide text-gray-500">
                        {new Date(displayDate).toLocaleString()}
                      </p>
                    )}
                    <p className="mt-2 text-sm text-gray-800 whitespace-pre-wrap">
                      {note.text}
                    </p>
                  </article>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-400 text-sm">
                No field notes available for this report
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
