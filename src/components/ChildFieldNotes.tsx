import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type {
  Child,
  Coordinator,
  CoordinatorFieldNote,
  FieldNote,
  Facilitator,
  LearningCentre,
} from '../types/database';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';

type FacilitatorNote = Pick<FieldNote, 'id' | 'text' | 'created_at' | 'sent_at'> & {
  facilitator?: Pick<Facilitator, 'name' | 'contact_number' | 'email'> | null;
};

type CoordinatorNote = Pick<CoordinatorFieldNote, 'id' | 'note_text' | 'created_at' | 'noted_at'> & {
  coordinator?: Pick<Coordinator, 'name'> | null;
};

interface ChildWithContext extends Child {
  learning_centre?: Pick<LearningCentre, 'id' | 'centre_name' | 'city' | 'state'> | null;
}

function formatDisplayDate(isoString?: string | null) {
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

export default function ChildFieldNotes() {
  const { state: stateParam, district: districtParam, centreId, childId } = useParams<{
    state: string;
    district: string;
    centreId: string;
    childId: string;
  }>();
  const navigate = useNavigate();

  const [child, setChild] = useState<ChildWithContext | null>(null);
  const [facilitatorNotes, setFacilitatorNotes] = useState<FacilitatorNote[]>([]);
  const [coordinatorNotes, setCoordinatorNotes] = useState<CoordinatorNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!childId) return;
    const fetchAll = async () => {
      try {
        await Promise.all([fetchChild(), fetchNotes()]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch child notes');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [childId]);

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

async function fetchChild() {
    const { data, error } = await supabase
      .from('children')
      .select(
        'id, learning_centre_id, alias, created_at, updated_at, learning_centre:learning_centre_id(id, centre_name, city, state)',
      )
      .eq('id', childId)
      .single();

    if (error) throw error;
    const learningCentreValue = (data as any).learning_centre;
    const learningCentre =
      Array.isArray(learningCentreValue) && learningCentreValue.length > 0
        ? learningCentreValue[0]
        : learningCentreValue ?? null;

    setChild({
      id: String(data.id),
      learning_centre_id: String(data.learning_centre_id ?? centreId ?? ''),
      alias: Array.isArray(data.alias)
        ? (data.alias as string[]).filter((alias) => Boolean(alias && alias.trim()))
        : [],
      created_at: data.created_at ? String(data.created_at) : '',
      updated_at: data.updated_at ? String(data.updated_at) : '',
      learning_centre: learningCentre
        ? {
            id: String(learningCentre.id),
            centre_name: learningCentre.centre_name ?? '',
            city: learningCentre.city ?? '',
            state: learningCentre.state ?? '',
          }
        : null,
    });
  }

  async function fetchNotes() {
    const { data, error } = await supabase
      .from('child_field_note_links')
      .select(`
        id,
        field_note:field_note_id (
          id,
          text,
          created_at,
          sent_at,
          facilitator:facilitator_id ( name, contact_number, email )
        ),
        coordinator_field_note:coordinator_field_note_id (
          id,
          note_text,
          created_at,
          noted_at,
          coordinator:coordinator_id ( name )
        )
      `)
      .eq('child_id', childId);

    if (error) throw error;

    const facilitator: FacilitatorNote[] = [];
    const coordinator: CoordinatorNote[] = [];

    (data ?? []).forEach((link: any) => {
      if (link.field_note) {
        facilitator.push({
          id: link.field_note.id,
          text: link.field_note.text,
          created_at: link.field_note.created_at,
          sent_at: link.field_note.sent_at,
          facilitator: link.field_note.facilitator
            ? {
                name: link.field_note.facilitator.name ?? null,
                contact_number: link.field_note.facilitator.contact_number ?? null,
                email: link.field_note.facilitator.email ?? null,
              }
            : null,
        });
      }
      if (link.coordinator_field_note) {
        coordinator.push({
          id: link.coordinator_field_note.id,
          note_text: link.coordinator_field_note.note_text,
          created_at: link.coordinator_field_note.created_at,
          noted_at: link.coordinator_field_note.noted_at,
          coordinator: link.coordinator_field_note.coordinator
            ? { name: link.coordinator_field_note.coordinator.name ?? null }
            : null,
        });
      }
    });

    facilitator.sort((a, b) => {
      const dateA = Date.parse(a.sent_at || a.created_at || '');
      const dateB = Date.parse(b.sent_at || b.created_at || '');
      return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
    });

    coordinator.sort((a, b) => {
      const dateA = Date.parse(a.noted_at || a.created_at || '');
      const dateB = Date.parse(b.noted_at || b.created_at || '');
      return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
    });

    setFacilitatorNotes(facilitator);
    setCoordinatorNotes(coordinator);
  }

  const aliases = useMemo(() => child?.alias ?? [], [child]);
  const aliasLower = useMemo(() => aliases.map((alias) => alias.toLowerCase()), [aliases]);

  const highlightChildAliases = useCallback(
    (text: string): ReactNode[] => {
      if (!aliases.length) {
        return [
          <span key="plain" className="whitespace-pre-wrap">
            {text}
          </span>,
        ] as ReactNode[];
      }

      const regex = new RegExp(`(${aliases.map(escapeRegExp).join('|')})`, 'gi');
      return text
        .split(regex)
        .map((segment, idx) => {
          if (!segment) {
            return null;
          }
          const isMatch = aliasLower.includes(segment.toLowerCase());
          if (isMatch) {
            return (
              <mark key={idx} className="rounded bg-yellow-100 px-1 py-0.5">
                {segment}
              </mark>
            );
          }
          return (
            <span key={idx} className="whitespace-pre-wrap">
              {segment}
            </span>
          );
        })
        .filter(Boolean) as ReactNode[];
    },
    [aliases, aliasLower],
  );

  const childLabel = aliases.length > 0 ? aliases.join(', ') : 'Unnamed Child';

  const goBack = () =>
    navigate(
      `/${encodeURIComponent(stateParam || '')}/${encodeURIComponent(districtParam || '')}/centre/${centreId}`,
    );

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-10 w-64 mb-6" />
        <div className="space-y-4">
          {[...Array(4)].map((_, idx) => (
            <Skeleton key={idx} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !child) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="link" onClick={goBack} className="mb-4 gap-1 text-gray-500 hover:text-gray-900">
          ← Back to Learning Centre
        </Button>
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error ?? 'Child not found.'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Button variant="link" onClick={goBack} className="mb-4 gap-1 text-gray-500 hover:text-gray-900">
        ← Back to Learning Centre
      </Button>

      <header className="mb-8 space-y-1">
        <h1 className="text-2xl font-semibold text-gray-900">{childLabel}</h1>
        {child.learning_centre && (
          <p className="text-sm text-gray-500">
            {child.learning_centre.centre_name} • {child.learning_centre.city}, {child.learning_centre.state}
          </p>
        )}
      </header>

      <section className="mb-10">
        <h2 className="text-lg font-medium text-gray-900 mb-3">Facilitator Field Notes</h2>
        {facilitatorNotes.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-300 bg-gray-50 py-6 text-center text-sm text-gray-500">
            No facilitator notes associated with this child yet.
          </p>
        ) : (
          <div className="space-y-4">
            {facilitatorNotes.map((note) => (
              <article key={note.id} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-gray-500">
                  <span>{note.facilitator?.name || 'Facilitator'}</span>
                  <span aria-hidden="true">•</span>
                  <span>{formatDisplayDate(note.sent_at || note.created_at)}</span>
                </div>
                <div className="mt-3 text-sm text-gray-800 whitespace-pre-wrap">
                  {note.text?.trim()
                    ? highlightChildAliases(note.text.trim())
                    : <span className="italic text-gray-500">No note text provided.</span>}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-medium text-gray-900 mb-3">Coordinator Field Notes</h2>
        {coordinatorNotes.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-300 bg-gray-50 py-6 text-center text-sm text-gray-500">
            No coordinator notes associated with this child yet.
          </p>
        ) : (
          <div className="space-y-4">
            {coordinatorNotes.map((note) => (
              <article key={note.id} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-gray-500">
                  <span>{note.coordinator?.name || 'Coordinator'}</span>
                  <span aria-hidden="true">•</span>
                  <span>{formatDisplayDate(note.noted_at || note.created_at)}</span>
                </div>
                <div className="mt-3 text-sm text-gray-800 whitespace-pre-wrap">
                  {note.note_text?.trim()
                    ? highlightChildAliases(note.note_text.trim())
                    : <span className="italic text-gray-500">No note text provided.</span>}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
