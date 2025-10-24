import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type {
  Coordinator,
  CoordinatorFieldNote,
  LearningCentre,
} from '../types/database';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';

type CoordinatorNoteDetail = CoordinatorFieldNote & {
  coordinator?: Pick<Coordinator, 'id' | 'name'> | null;
  learning_centre?: Pick<LearningCentre, 'id' | 'centre_name' | 'city' | 'state'> | null;
};

export default function CoordinatorFieldNoteDetail() {
  const { centreId, noteId, state: stateParam, district: districtParam } = useParams<{
    centreId: string;
    noteId: string;
    state: string;
    district: string;
  }>();
  const navigate = useNavigate();

  const [note, setNote] = useState<CoordinatorNoteDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatDisplayDate = (isoString: string) => {
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
  };

  const fetchNote = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('coordinator_field_notes')
        .select(
          'id, learning_centre_id, note_text, noted_at, created_at, coordinator_id, coordinator:coordinator_id(id, name), learning_centre:learning_centre_id(id, centre_name, city, state)',
        )
        .eq('id', noteId)
        .single();

      if (error) throw error;

      if (!data) {
        setError('Coordinator field note not found.');
        return;
      }

      const coordinatorValue = data.coordinator as unknown;
      const coordinator =
        Array.isArray(coordinatorValue) && coordinatorValue.length > 0
          ? coordinatorValue[0]
          : coordinatorValue ?? null;

      const centreValue = data.learning_centre as unknown;
      const learningCentre =
        Array.isArray(centreValue) && centreValue.length > 0 ? centreValue[0] : centreValue ?? null;

      setNote({
        id: String(data.id),
        learning_centre_id: String(data.learning_centre_id ?? centreId ?? ''),
        coordinator_id: String(data.coordinator_id ?? ''),
        note_text: String(data.note_text ?? ''),
        noted_at: data.noted_at ? String(data.noted_at) : '',
        created_at: data.created_at ? String(data.created_at) : '',
        coordinator: coordinator
          ? {
              id: String(coordinator.id),
              name: coordinator.name ?? null,
            }
          : null,
        learning_centre: learningCentre
          ? {
              id: String(learningCentre.id),
              centre_name: learningCentre.centre_name ?? '',
              city: learningCentre.city ?? '',
              state: learningCentre.state ?? '',
            }
          : null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch coordinator field note');
    } finally {
      setLoading(false);
    }
  }, [noteId, centreId])

  useEffect(() => {
    if (!noteId) return;
    fetchNote();
  }, [noteId, fetchNote]);

  const backToCentre = () =>
    navigate(
      `/${encodeURIComponent(stateParam || '')}/${encodeURIComponent(districtParam || '')}/centre/${centreId}`,
    );

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-10 w-56 mb-6" />
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="space-y-3">
          {[...Array(4)].map((_, idx) => (
            <Skeleton key={idx} className="h-4 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="link" onClick={backToCentre} className="mb-4 gap-1 text-gray-500 hover:text-gray-900">
          ← Back to Learning Centre
        </Button>
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error ?? 'Coordinator field note not found.'}
        </div>
      </div>
    );
  }

  const displayDate = note.noted_at || note.created_at;
  const formattedDate = formatDisplayDate(displayDate);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Button variant="link" onClick={backToCentre} className="mb-4 gap-1 text-gray-500 hover:text-gray-900">
        ← Back to Learning Centre
      </Button>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <header className="mb-5 space-y-2">
          <h1 className="text-xl font-semibold text-gray-900">
            {note.coordinator?.name || 'Coordinator Note'} — {formattedDate}
          </h1>
          {note.learning_centre && (
            <p className="text-sm text-gray-500">
              {note.learning_centre.centre_name} • {note.learning_centre.city},{' '}
              {note.learning_centre.state}
            </p>
          )}
        </header>

        <article className="prose max-w-none text-sm text-gray-800 whitespace-pre-wrap">
          {note.note_text || 'No note text provided.'}
        </article>
      </div>
    </div>
  );
}
