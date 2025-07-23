import React from 'react';
import { Download } from 'lucide-react';

const DownloadPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-4">Download Preg App</h1>
        <a
          href="/apk/pregapp.apk"
          download
          className="flex items-center px-6 py-3 text-lg text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Download className="w-6 h-6 mr-2" />
          <span>Download</span>
        </a>
      </div>
    </div>
  );
};

export default DownloadPage;
