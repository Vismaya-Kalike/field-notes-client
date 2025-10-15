import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { LearningCentre } from '../types/database';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
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
      <div className="mb-8">
        <Button
          onClick={() => navigate('/districts')}
          variant="ghost"
          className="mb-4 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        >
          ← Back to Districts
        </Button>
        
        <h1 className="text-3xl font-bold text-gray-900">
          Learning Centres in {district}, {state}
        </h1>
      </div>

      {centres.length === 0 ? (
        <div className="text-center text-gray-500 py-12">No learning centres found in this district.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {centres.map((centre) => (
            <Card
              key={centre.id}
              onClick={() => navigate(`/districts/${encodeURIComponent(state)}/${encodeURIComponent(district)}/centre/${centre.id}`)}
              className="cursor-pointer transition-colors hover:bg-gray-50 border-gray-200"
            >
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">{centre.centre_name}</CardTitle>
                <CardDescription className="text-gray-600">
                  {centre.area}, {centre.city}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {centre.facilitators && centre.facilitators.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Facilitators:</h4>
                    <div className="space-y-1">
                      {centre.facilitators.map((facilitator) => (
                        <div key={facilitator.id} className="text-sm text-gray-600">
                          <span className="font-medium">{facilitator.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {centre.volunteers && centre.volunteers.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Volunteers:</h4>
                    <div className="space-y-1">
                      {centre.volunteers.map((volunteer) => (
                        <div key={volunteer.id} className="text-sm text-gray-600">
                          <span className="font-medium">{volunteer.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {centre.partner_organisations && centre.partner_organisations.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Partner Organizations:</h4>
                    <div className="flex flex-wrap gap-2">
                      {centre.partner_organisations.map((partner) => (
                        <div key={partner.id} className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-full">
                          {partner.logo_url && (
                            <img 
                              src={partner.logo_url} 
                              alt={`${partner.name} logo`}
                              className="w-8 h-8 object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          )}
                          <span className="text-sm font-medium text-blue-800">{partner.name}</span>
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