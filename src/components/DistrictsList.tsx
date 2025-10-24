import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { District } from '../types/database';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Skeleton } from './ui/skeleton';

export default function DistrictsList() {
  const navigate = useNavigate();

  const { data: districts = [], isLoading: loading, error: districtError } = useQuery({
    queryKey: ['districts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('districts_summary')
        .select('*')
        .order('state', { ascending: true })
        .order('district', { ascending: true });

      if (error) throw error;
      return (data || []) as District[]
    },
  })

  const error = districtError?.message || null;

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Skeleton className="h-8 w-64 mb-8" />
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i}>
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, j) => (
                <Card key={j}>
                  <CardHeader>
                    <Skeleton className="h-5 w-3/4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (error) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center text-red-600">Error: {error}</div>
    </div>
  );

  const groupedByState = districts.reduce((acc, district) => {
    if (!acc[district.state]) {
      acc[district.state] = [];
    }
    acc[district.state].push(district);
    return acc;
  }, {} as Record<string, District[]>);


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Learning Centers</h1>

      {Object.entries(groupedByState).map(([state, stateDistricts]) => (
        <div key={state} className="mb-8">
          <h2 className="text-lg font-medium mb-3 text-gray-800">{state}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stateDistricts.map((district) => (
              <Card
                key={`${district.state}-${district.district}`}
                onClick={() => navigate(`/${encodeURIComponent(district.state)}/${encodeURIComponent(district.district)}`)}
                className="cursor-pointer transition-colors hover:bg-gray-50 border-gray-200"
              >
                <CardHeader>
                  <CardTitle className="text-base font-medium text-gray-900">{district.district}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    {district.learning_centres_count} learning centre{district.learning_centres_count !== 1 ? 's' : ''}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
