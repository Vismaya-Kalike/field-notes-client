import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { LearningCentre, GeneratedReport, FieldNote, Coordinator } from '../types/database';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';

function formatDisplayDate(isoString: string) {
  if (!isoString) return 'Date unavailable';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';
  const day = date.getDate();
  const suffix =
    day % 10 === 1 && day !== 11 ? 'st' :
    day % 10 === 2 && day !== 12 ? 'nd' :
    day % 10 === 3 && day !== 13 ? 'rd' :
    'th';
  const month = date.toLocaleString('en-US', { month: 'long' });
  const year = date.getFullYear();
  return `${month} ${day}${suffix} ${year}`;
}

export default function LearningCentreDetail() {
  const { centreId, state: stateParam, district: districtParam } = useParams<{ 
    centreId: string; 
    state: string; 
    district: string; 
  }>();
  const navigate = useNavigate();
  const [centre, setCentre] = useState<LearningCentre | null>(null);
  const [reports, setReports] = useState<GeneratedReport[]>([]);
  const [reportFieldNotes, setReportFieldNotes] = useState<
    Record<string, Pick<FieldNote, 'id' | 'text' | 'created_at'>[]>
  >({});
  const [coordinatorNotes, setCoordinatorNotes] = useState<
    Array<{
      id: string;
      note_text: string;
      noted_at: string;
      created_at: string;
      coordinator_id: string;
      coordinator?: Pick<Coordinator, 'name'> | null;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    fetchCentreDetails();
    fetchReports();
    fetchCoordinatorNotes();
  }, [centreId]);

  async function fetchCentreDetails() {
    try {
      const { data, error } = await supabase
        .from('learning_centres_with_details')
        .select('*')
        .eq('id', centreId)
        .single();

      if (error) throw error;
      setCentre(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch centre details');
    }
  }

  async function fetchReports() {
    try {
      const { data, error } = await supabase
        .from('generated_reports_summary')
        .select('*')
        .eq('learning_centre_id', centreId)
        .order('year', { ascending: false })
        .order('month', { ascending: false });

      if (error) throw error;
      const reportData = data || [];
      setReports(reportData);
      await fetchFieldNotesForReports(reportData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  }

  async function fetchFieldNotesForReports(reportList: GeneratedReport[]) {
    if (!reportList.length) {
      setReportFieldNotes({});
      return;
    }

    const reportIds = reportList.map((report) => report.id);
    try {
      type NoteRow = Pick<FieldNote, 'id' | 'text' | 'created_at'> & {
        generated_report_id: string | null;
      };
      const { data, error } = await supabase
        .from('field_notes')
        .select('id, text, generated_report_id, created_at')
        .in('generated_report_id', reportIds)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const grouped: Record<string, Pick<FieldNote, 'id' | 'text' | 'created_at'>[]> = {};
      (data ?? []).forEach((note: NoteRow) => {
        if (!note.generated_report_id) return;
        if (!grouped[note.generated_report_id]) {
          grouped[note.generated_report_id] = [];
        }
        grouped[note.generated_report_id].push({
          id: note.id,
          text: note.text,
          created_at: note.created_at,
        });
      });

      setReportFieldNotes(grouped);
    } catch (err) {
      console.error('Failed to fetch field notes for reports', err);
      setReportFieldNotes({});
    }
  }

  async function fetchCoordinatorNotes() {
    try {
      const { data, error } = await supabase
        .from('coordinator_field_notes')
        .select(
          'id, note_text, noted_at, created_at, coordinator_id, coordinator:coordinator_id(name)',
        )
        .eq('learning_centre_id', centreId)
        .order('noted_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      const normalized = (data ?? []).map((row: any) => {
        const coordinatorValue = row.coordinator;
        const coordinator =
          Array.isArray(coordinatorValue) && coordinatorValue.length > 0
            ? coordinatorValue[0]
            : coordinatorValue ?? null;
        return {
          id: String(row.id),
          note_text: String(row.note_text ?? ''),
          noted_at: row.noted_at ? String(row.noted_at) : '',
          created_at: row.created_at ? String(row.created_at) : '',
          coordinator_id: String(row.coordinator_id ?? ''),
          coordinator: coordinator ? { name: coordinator.name ?? null } : null,
        };
      });

      normalized.sort((a, b) => {
        const dateA = Date.parse(a.noted_at || a.created_at || '');
        const dateB = Date.parse(b.noted_at || b.created_at || '');
        return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
      });

      setCoordinatorNotes(normalized);
    } catch (err) {
      console.error('Failed to fetch coordinator field notes', err);
      setCoordinatorNotes([]);
    }
  }

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center mb-8">
        <Skeleton className="h-10 w-48 mr-4" />
        <Skeleton className="h-8 w-64" />
      </div>
      <Card className="mb-6">
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-28" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-1" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (error) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center text-red-600">Error: {error}</div>
    </div>
  );

  if (!centre) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center text-gray-500">Centre not found</div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Button
          onClick={() =>
            navigate(
              `/${encodeURIComponent(stateParam || '')}/${encodeURIComponent(districtParam || '')}`,
            )
          }
          variant="link"
          className="mb-2 gap-1 text-gray-500 hover:text-gray-900"
        >
          ← Back to Learning Centres
        </Button>
        <h1 className="text-2xl font-semibold text-gray-900">{centre.centre_name}</h1>
      </div>

      <section className="mb-10">
        <div className="mb-4">
          <h2 className="text-lg font-medium text-gray-900">Centre Information</h2>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2 text-sm text-gray-600">
              <p><span className="text-gray-900">Area:</span> {centre.area}</p>
              <p><span className="text-gray-900">City:</span> {centre.city}</p>
              <p><span className="text-gray-900">District:</span> {centre.district}</p>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p><span className="text-gray-900">State:</span> {centre.state}</p>
              <p><span className="text-gray-900">Country:</span> {centre.country}</p>
              <p><span className="text-gray-900">Start Date:</span> {new Date(centre.start_date).toLocaleDateString()}</p>
            </div>
          </div>

          {centre.facilitators && centre.facilitators.length > 0 && (
            <div>
              <h3 className="text-sm font-medium uppercase tracking-wide text-gray-500">Facilitators</h3>
              <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
                {centre.facilitators.map((facilitator) => (
                  <div key={facilitator.id} className="space-y-1 text-sm text-gray-600">
                    <p className="text-gray-900">{facilitator.name}</p>
                    {facilitator.email && (
                      <p>Email: {facilitator.email}</p>
                    )}
                    {facilitator.start_date && (
                      <p className="text-xs text-gray-500">
                        Started: {new Date(facilitator.start_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {centre.volunteers && centre.volunteers.length > 0 && (
            <div>
              <h3 className="text-sm font-medium uppercase tracking-wide text-gray-500">Volunteers</h3>
              <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
                {centre.volunteers.map((volunteer) => (
                  <div key={volunteer.id} className="space-y-1 text-sm text-gray-600">
                    <p className="text-gray-900">{volunteer.name}</p>
                    <p>Volunteer</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {centre.partner_organisations && centre.partner_organisations.length > 0 && (
            <div>
              <h3 className="text-sm font-medium uppercase tracking-wide text-gray-500">Partner Organizations</h3>
              <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
                {centre.partner_organisations.map((partner) => (
                  <div key={partner.id} className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-3">
                      {partner.logo_url && (
                        <img
                          src={partner.logo_url}
                          alt={`${partner.name} logo`}
                          className="h-8 w-8 shrink-0 object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                      <span className="text-gray-900">{partner.name}</span>
                    </div>
                    {partner.url && (
                      <a
                        href={partner.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gray-600 underline hover:text-gray-900"
                      >
                        Visit Website
                      </a>
                    )}
                    {partner.contact && (
                      <p className="text-xs text-gray-500">Contact: {partner.contact}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-4">
          <h2 className="text-lg font-medium text-gray-900">Monthly Facilitator Updates</h2>
          <p className="text-sm text-gray-500">
            These are monthly reports generated based on the field notes shared by the facilitators over WhatsApp.
          </p>
        </div>
        {reports.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-300 bg-gray-50 py-8 text-center text-gray-500">
            No reports yet.
          </p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <ul className="divide-y divide-gray-200">
              {reports.map((report) => {
                const notes = reportFieldNotes[report.id] ?? [];
                const previewNotes = notes.slice(0, 3);

                return (
                  <li key={report.id}>
                    <div className="flex flex-col">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/${encodeURIComponent(stateParam || '')}/${encodeURIComponent(
                              districtParam || '',
                            )}/centre/${centreId}/report/${report.id}`,
                          )
                        }
                        className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
                      >
                        <span className="text-sm text-gray-900 underline underline-offset-4">
                          {report.month_year_display}
                        </span>
                        <span className="text-xs text-gray-400" aria-hidden="true">
                          →
                        </span>
                      </button>
                      {previewNotes.length > 0 && (
                        <div className="border-t border-gray-100 bg-gray-50/60 px-5 py-3 text-sm text-gray-600">
                          <div className="space-y-2">
                            {previewNotes.map((note) => (
                              <p key={note.id}>{note.text}</p>
                            ))}
                            {notes.length > previewNotes.length && (
                              <p className="text-xs text-gray-400">
                                Showing {previewNotes.length} of {notes.length} field notes.
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>

      <section className="mt-10">
        <div className="mb-4">
          <h2 className="text-lg font-medium text-gray-900">Coordinator Field Notes</h2>
          <p className="text-sm text-gray-500">
            These notes come directly from coordinators after their visits to the centre.
          </p>
        </div>
        {coordinatorNotes.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-300 bg-gray-50 py-8 text-center text-sm text-gray-500">
            No coordinator field notes recorded yet.
          </p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <ul className="divide-y divide-gray-200">
              {coordinatorNotes.map((note) => {
                const displayDate = note.noted_at || note.created_at;
                const formattedDate = formatDisplayDate(displayDate);
                const coordinatorName = note.coordinator?.name || 'Coordinator';

                return (
                  <li key={note.id}>
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/${encodeURIComponent(stateParam || '')}/${encodeURIComponent(
                            districtParam || '',
                          )}/centre/${centreId}/coordinator-notes/${note.id}`,
                        )
                      }
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    >
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-900">
                          {coordinatorName} — {formattedDate}
                        </div>
                      </div>
                      <span className="text-xs text-gray-400" aria-hidden="true">
                        →
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>

      <section className="mt-10">
        <div className="mb-2">
          <h2 className="text-lg font-medium text-gray-900">Children</h2>
          <p className="text-sm text-gray-500">
            These are anonymised aliases pulled from field notes, not the full list.
          </p>
        </div>
        {centre?.children && centre.children.length > 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-5 text-sm text-gray-700">
            <ul className="space-y-2">
              {centre.children
                .map((child) => ({
                  id: child.id,
                  aliases: child.alias?.filter((alias) => Boolean(alias && alias.trim())) ?? [],
                }))
                .map((child) => ({
                  id: child.id,
                  label: child.aliases.length > 0 ? child.aliases.join(', ') : 'Unnamed Child',
                }))
                .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }))
                .map((child) => (
                  <li key={child.id}>
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/${encodeURIComponent(stateParam || '')}/${encodeURIComponent(
                            districtParam || '',
                          )}/centre/${centreId}/child/${child.id}`,
                        )
                      }
                      className="w-full rounded-md border border-gray-200 px-4 py-2 text-left transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    >
                      {child.label}
                    </button>
                  </li>
                ))}
            </ul>
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-gray-300 bg-gray-50 py-6 text-center text-sm text-gray-500">
            No anonymised child aliases have been captured from the field notes yet.
          </p>
        )}
      </section>
    </div>
  );
}
