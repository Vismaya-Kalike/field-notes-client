import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { GeneratedReport } from '../types/database';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';

interface ReportImage {
  id: string;
  photo_url: string;
  caption?: string;
  sent_at?: string;
}

interface ReportMessage {
  id: string;
  text: string;
  sent_at?: string;
}

interface ReportLLMAnalysis {
  id: string;
  text: string;
  created_at: string;
}

export default function ReportDetail() {
  const { reportId, centreId, state: stateParam, district: districtParam } = useParams<{ 
    reportId: string;
    centreId: string;
    state: string;
    district: string;
  }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<GeneratedReport | null>(null);
  const [images, setImages] = useState<ReportImage[]>([]);
  const [messages, setMessages] = useState<ReportMessage[]>([]);
  const [llmAnalysis, setLlmAnalysis] = useState<ReportLLMAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReportDetails = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch report summary
      const { data: reportData, error: reportError } = await supabase
        .from('generated_reports_summary')
        .select('*')
        .eq('id', reportId)
        .single();

      if (reportError) throw reportError;
      setReport(reportData);

      // Fetch images
      const { data: imagesData, error: imagesError } = await supabase
        .from('generated_report_images')
        .select('*')
        .eq('generated_report_id', reportId)
        .order('sent_at', { ascending: true });

      if (imagesError) throw imagesError;
      setImages(imagesData || []);

      // Fetch messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('generated_report_messages')
        .select('*')
        .eq('generated_report_id', reportId)
        .order('sent_at', { ascending: true });

      if (messagesError) throw messagesError;
      setMessages(messagesData || []);

      // Fetch LLM analysis if available
      if (reportData?.has_llm_analysis) {
        const { data: analysisData, error: analysisError } = await supabase
          .from('generated_report_llm_analysis')
          .select('*')
          .eq('generated_report_id', reportId)
          .single();

        if (analysisError && analysisError.code !== 'PGRST116') { // PGRST116 = no rows found
          throw analysisError;
        }
        setLlmAnalysis(analysisData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch report details');
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    if (reportId) {
      fetchReportDetails();
    }
  }, [reportId, fetchReportDetails]);

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center mb-8">
        <Skeleton className="h-10 w-48 mr-4" />
        <Skeleton className="h-8 w-64" />
      </div>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
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
          onClick={() => navigate(`/districts/${encodeURIComponent(stateParam || '')}/${encodeURIComponent(districtParam || '')}/centre/${centreId}`)}
          variant="ghost"
          className="mb-4 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        >
          ← Back to Learning Centre
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">{report.month_year_display} Report</h1>
      </div>

      {/* Report Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl text-gray-900">Report Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{report.images_count}</div>
              <div className="text-sm text-blue-800">Images</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{report.messages_count}</div>
              <div className="text-sm text-green-800">Messages</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">
                {report.has_llm_analysis ? '✓' : '✗'}
              </div>
              <div className="text-sm text-purple-800">LLM Analysis</div>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-900">Facilitator:</span> {report.facilitator_name}
              </div>
              <div>
                <span className="font-medium text-gray-900">Learning Centre:</span> {report.learning_centre_name}
              </div>
              <div>
                <span className="font-medium text-gray-900">Created:</span> {new Date(report.created_at).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium text-gray-900">Period:</span> {report.month_year_display}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Images Section */}
      {images.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">Images ({images.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((image) => (
                <div key={image.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={image.photo_url}
                    alt="Report image"
                    className="w-full h-48 object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Messages Section - Hidden for now */}
      {/* {messages.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">Messages ({messages.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-900 mb-2">{message.text}</p>
                  {message.sent_at && (
                    <p className="text-xs text-gray-500">
                      {new Date(message.sent_at).toLocaleString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )} */}

      {/* LLM Analysis Section */}
      {llmAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">LLM Generated Report from Field Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="prose max-w-none">
                <p className="text-gray-900 whitespace-pre-wrap">{llmAnalysis.text}</p>
              </div>
              <div className="mt-4 text-xs text-gray-500">
                Generated: {new Date(llmAnalysis.created_at).toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No content message */}
      {images.length === 0 && messages.length === 0 && !llmAnalysis && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">No content available for this report.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
