import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { LearningCentre } from '../types/database';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';

export default function LearningCentresList() {
  const { state: stateParam, district: districtParam } = useParams<{ state: string; district: string }>();
  const navigate = useNavigate();
  
  const state = stateParam ? decodeURIComponent(stateParam) : '';
  const district = districtParam ? decodeURIComponent(districtParam) : '';
  const [centres, setCentres] = useState<LearningCentre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchLearningCentres = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('learning_centres_with_details')
        .select('*')
        .eq('district', district)
        .eq('state', state)
        .order('centre_name', { ascending: true });

      if (error) throw error;
      setCentres(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch learning centres');
    } finally {
      setLoading(false);
    }
  }, [district, state]);

  useEffect(() => {
    fetchLearningCentres();
  }, [fetchLearningCentres]);

  const filteredCentres = useMemo(() => {
    if (!search.trim()) return centres;
    const query = search.trim().toLowerCase();
    return centres.filter((centre) => {
      const nameMatch = centre.centre_name?.toLowerCase().includes(query);
      const locationMatch = centre.city?.toLowerCase().includes(query) || centre.area?.toLowerCase().includes(query);
      const facilitatorMatch = centre.facilitators?.some((f) => f.name?.toLowerCase().includes(query));
      const childMatch = centre.children?.some((child) => {
        const childNameMatch = child.name?.toLowerCase().includes(query);
        const aliasMatch = child.alias?.some((alias) => alias?.toLowerCase().includes(query));
        return childNameMatch || aliasMatch;
      });
      return Boolean(nameMatch || locationMatch || facilitatorMatch || childMatch);
    });
  }, [centres, search]);

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center mb-8">
        <Skeleton className="h-10 w-32 mr-4" />
        <Skeleton className="h-8 w-64" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  if (error) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center text-red-600">Error: {error}</div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Button
          onClick={() => navigate('/districts')}
          variant="link"
          className="mb-2 gap-1 text-gray-500 hover:text-gray-900"
        >
          ← Back to Districts
        </Button>
        
        <h1 className="text-xl font-medium text-gray-900">
          Learning Centres in {district}, {state}
        </h1>
      </div>

      <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-gray-500">
          {filteredCentres.length} centre{filteredCentres.length === 1 ? '' : 's'}
        </div>
        <label className="relative w-full sm:w-72">
          <span className="sr-only">Search learning centres</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search centres, locations, facilitators, children"
            className="w-full rounded-md border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
          />
        </label>
      </div>

      {filteredCentres.length === 0 ? (
        <div className="text-center text-gray-500 py-12">No learning centres match your search.</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {filteredCentres.map((centre) => (
            <Card
              key={centre.id}
              onClick={() => navigate(`/districts/${encodeURIComponent(state)}/${encodeURIComponent(district)}/centre/${centre.id}`)}
              className="cursor-pointer transition-shadow hover:shadow-md"
            >
              <CardHeader className="space-y-1">
                <p className="text-base font-medium text-gray-900">{centre.centre_name}</p>
                <p className="text-sm text-gray-600">
                  {centre.area}, {centre.city}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {centre.facilitators && centre.facilitators.length > 0 && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Facilitators</p>
                    <div className="mt-1 space-y-1 text-sm text-gray-600">
                      {centre.facilitators.map((facilitator) => (
                        <div key={facilitator.id}>{facilitator.name}</div>
                      ))}
                    </div>
                  </div>
                )}

                {centre.volunteers && centre.volunteers.length > 0 && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Volunteers</p>
                    <div className="mt-1 space-y-1 text-sm text-gray-600">
                      {centre.volunteers.map((volunteer) => (
                        <div key={volunteer.id}>{volunteer.name}</div>
                      ))}
                    </div>
                  </div>
                )}

                {centre.partner_organisations && centre.partner_organisations.length > 0 && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Partner Organizations</p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600">
                      {centre.partner_organisations.map((partner) => (
                        <div key={partner.id} className="flex items-center gap-2">
                          {partner.logo_url && (
                            <img
                              src={partner.logo_url}
                              alt={`${partner.name} logo`}
                              className="h-7 w-7 object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          )}
                          <span className="text-gray-700">{partner.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
