import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { LearningCentre, GeneratedReport } from '../types/database';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';

export default function LearningCentreDetail() {
  const { centreId, state: stateParam, district: districtParam } = useParams<{ 
    centreId: string; 
    state: string; 
    district: string; 
  }>();
  const navigate = useNavigate();
  const [centre, setCentre] = useState<LearningCentre | null>(null);
  const [reports, setReports] = useState<GeneratedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCentreDetails();
    fetchReports();
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
      setReports(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reports');
    } finally {
      setLoading(false);
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
          onClick={() => navigate(`/districts/${encodeURIComponent(stateParam || '')}/${encodeURIComponent(districtParam || '')}`)}
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
          <h2 className="text-lg font-medium text-gray-900">Generated Reports</h2>
        </div>
        {reports.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-300 bg-gray-50 py-8 text-center text-gray-500">
            No reports generated yet.
          </p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <ul className="divide-y divide-gray-200">
              {reports.map((report) => (
                <li key={report.id}>
                  <button
                    type="button"
                    onClick={() => navigate(`/districts/${encodeURIComponent(stateParam || '')}/${encodeURIComponent(districtParam || '')}/centre/${centreId}/report/${report.id}`)}
                    className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  >
                    <span className="text-sm text-gray-900 underline underline-offset-4">
                      {report.month_year_display}
                    </span>
                    <span className="text-xs text-gray-400" aria-hidden="true">
                      →
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
