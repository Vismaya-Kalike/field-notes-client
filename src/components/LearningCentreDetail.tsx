import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { LearningCentre, GeneratedReport } from '../types/database';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
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
          variant="ghost"
          className="mb-4 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        >
          ← Back to Learning Centres
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">{centre.centre_name}</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl text-gray-900">Centre Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-gray-600"><span className="font-medium text-gray-900">Area:</span> {centre.area}</p>
              <p className="text-gray-600"><span className="font-medium text-gray-900">City:</span> {centre.city}</p>
              <p className="text-gray-600"><span className="font-medium text-gray-900">District:</span> {centre.district}</p>
            </div>
            <div className="space-y-2">
              <p className="text-gray-600"><span className="font-medium text-gray-900">State:</span> {centre.state}</p>
              <p className="text-gray-600"><span className="font-medium text-gray-900">Country:</span> {centre.country}</p>
              <p className="text-gray-600"><span className="font-medium text-gray-900">Start Date:</span> {new Date(centre.start_date).toLocaleDateString()}</p>
            </div>
          </div>

          {centre.facilitators && centre.facilitators.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-900">Facilitators</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {centre.facilitators.map((facilitator) => (
                  <div key={facilitator.id} className="mb-3">
                    <h4 className="font-medium text-gray-900 mb-1">{facilitator.name}</h4>
                    {facilitator.email && (
                      <p className="text-gray-600 text-sm">Email: {facilitator.email}</p>
                    )}
                    {facilitator.start_date && (
                      <p className="text-gray-500 text-xs mt-1">
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
              <h3 className="text-lg font-semibold mb-3 text-gray-900">Volunteers</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {centre.volunteers.map((volunteer) => (
                  <div key={volunteer.id} className="mb-3 p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-1">{volunteer.name}</h4>
                    <p className="text-gray-600 text-sm">Volunteer</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {centre.partner_organisations && centre.partner_organisations.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-900">Partner Organizations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {centre.partner_organisations.map((partner) => (
                  <div key={partner.id} className="mb-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-4 p-4">
                      {partner.logo_url && (
                        <div className="flex-shrink-0">
                          <img 
                            src={partner.logo_url} 
                            alt={`${partner.name} logo`}
                            className="w-20 h-20 object-contain bg-white rounded-lg p-3 shadow-sm"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold text-blue-900 mb-1">{partner.name}</h4>
                        {partner.url && (
                          <a
                            href={partner.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-700 hover:text-blue-900 text-sm underline"
                          >
                            Visit Website
                          </a>
                        )}
                        {partner.contact && (
                          <p className="text-blue-800 text-sm mt-1">Contact: {partner.contact}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-gray-900">Generated Reports</CardTitle>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No reports generated yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  onClick={() => navigate(`/districts/${encodeURIComponent(stateParam || '')}/${encodeURIComponent(districtParam || '')}/centre/${centreId}/report/${report.id}`)}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 hover:border-gray-300 hover:shadow-md cursor-pointer transition-all duration-200 group"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">{report.month_year_display}</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Facilitator: {report.facilitator_name}
                  </p>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Images:</span>
                      <span className="font-medium text-gray-900">{report.images_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Messages:</span>
                      <span className="font-medium text-gray-900">{report.messages_count}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      Created: {new Date(report.created_at).toLocaleDateString()}
                    </span>
                    <span className="text-gray-400 group-hover:text-gray-600 transition-colors">
                      →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}