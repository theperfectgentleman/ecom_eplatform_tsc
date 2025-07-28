import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Info, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface UpdateInfo {
  latestVersion: string;
  latestVersionCode: number;
  url: string;
  releaseNotes: string[];
}

const DownloadPage: React.FC = () => {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  // Extract build date from release notes
  const getBuildDate = (releaseNotes: string[]): string | null => {
    const buildNote = releaseNotes.find(note => note.includes('Build '));
    if (buildNote) {
      const buildMatch = buildNote.match(/Build (\d{8})-\d{6}/);
      if (buildMatch) {
        const buildDateStr = buildMatch[1]; // YYYYMMDD format
        const year = buildDateStr.substring(0, 4);
        const month = buildDateStr.substring(4, 6);
        const day = buildDateStr.substring(6, 8);
        
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        return date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      }
    }
    return null;
  };

  const handleDownload = async () => {
    if (!updateInfo) return;
    
    setDownloading(true);
    try {
      // Use the URL from the JSON file - it should point directly to the APK
      const apkUrl = updateInfo.url;
      
      const response = await fetch(apkUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch APK: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `preg-app-v${updateInfo.latestVersion}.apk`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: try opening the URL directly
      window.open(updateInfo.url, '_blank');
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    const fetchUpdateInfo = async () => {
      try {
        const response = await fetch('/apk/update.json');
        if (!response.ok) {
          throw new Error('Failed to fetch update information');
        }
        const data = await response.json();
        setUpdateInfo(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchUpdateInfo();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 bg-white rounded-lg shadow-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading app information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 bg-white rounded-lg shadow-md">
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Smartphone className="w-12 h-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Download Preg App</CardTitle>
          {updateInfo && (
            <div className="flex items-center justify-center gap-2 mt-2">
              <Badge variant="secondary">
                Version {updateInfo.latestVersion}
              </Badge>
              <Badge variant="outline">
                Build {updateInfo.latestVersionCode}
              </Badge>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="space-y-6">
          {updateInfo && (
            <>
              {/* Release Date and Notes Section */}
              <div className="space-y-4">
                {/* Release Date */}
                {getBuildDate(updateInfo.releaseNotes) && (
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-center gap-2 text-blue-700">
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium text-sm">
                        Released on {getBuildDate(updateInfo.releaseNotes)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Release Notes */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-600" />
                    <h3 className="font-semibold text-sm">What's New:</h3>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1 ml-6">
                    {updateInfo.releaseNotes
                      .filter(note => !note.includes('Build ')) // Hide the build note since we show it as release date
                      .map((note, index) => (
                        <li key={index} className="list-disc">
                          {note.replace(/^- /, '')}
                        </li>
                      ))}
                  </ul>
                </div>
              </div>

              {/* Download Button */}
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex items-center justify-center w-full px-6 py-3 text-lg text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-6 h-6 mr-2" />
                <span>
                  {downloading ? 'Downloading...' : `Download v${updateInfo.latestVersion}`}
                </span>
              </button>

              {/* Build Info */}
              <div className="text-center text-xs text-gray-500 pt-2 border-t">
                <span>Build {updateInfo.latestVersionCode} • {updateInfo.latestVersion}</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DownloadPage;
