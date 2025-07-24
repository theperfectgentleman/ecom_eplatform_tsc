import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download, ExternalLink, Book, Code, Settings } from 'lucide-react';

const TechnicalDocs = () => {
  const documentationItems = [
    {
      title: 'Access Level Filtering Guide',
      description: 'Complete guide on implementing and using the access level filtering system.',
      type: 'Implementation Guide',
      status: 'Current',
      path: '/ACCESS_LEVEL_FILTERING_GUIDE.md',
      icon: Code,
      lastUpdated: 'July 24, 2025'
    },
    {
      title: 'Implementation Summary',
      description: 'Technical overview of the access level filtering system implementation.',
      type: 'Technical Summary',
      status: 'Current', 
      path: '/IMPLEMENTATION_SUMMARY.md',
      icon: FileText,
      lastUpdated: 'July 24, 2025'
    },
    {
      title: 'Training Manual',
      description: 'Comprehensive user guide including permissions system documentation.',
      type: 'User Guide',
      status: 'Current',
      path: '/public/TRAINING_MANUAL.md',
      icon: Book,
      lastUpdated: 'July 24, 2025'
    },
    {
      title: 'Technical Whitepaper',
      description: 'System architecture and technical specifications.',
      type: 'Architecture',
      status: 'Current',
      path: '/TECHNICAL_WHITEPAPER.md',
      icon: FileText,
      lastUpdated: 'Previous'
    }
  ];

  const handleDownload = async (path: string, title: string) => {
    try {
      const response = await fetch(path);
      if (response.ok) {
        const content = await response.text();
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.replace(/\\s+/g, '_')}.md`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleView = (path: string) => {
    window.open(path, '_blank');
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Technical Documentation</h2>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="text-xs">
            Admin Access Required
          </Badge>
        </div>
      </div>

      <div className="text-muted-foreground">
        <p>Access technical documentation, implementation guides, and system architecture documents.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        {documentationItems.map((doc, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                <doc.icon className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">{doc.title}</CardTitle>
              </div>
              <Badge 
                variant={doc.status === 'Current' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {doc.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {doc.description}
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-xs">
                      {doc.type}
                    </Badge>
                    <span>•</span>
                    <span>Updated: {doc.lastUpdated}</span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleView(doc.path)}
                    className="flex items-center space-x-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span>View</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownload(doc.path, doc.title)}
                    className="flex items-center space-x-1"
                  >
                    <Download className="h-3 w-3" />
                    <span>Download</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Documentation Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-1">4</div>
                <div className="text-sm text-muted-foreground">Total Documents</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-1">3</div>
                <div className="text-sm text-muted-foreground">Recently Updated</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-orange-600 mb-1">1</div>
                <div className="text-sm text-muted-foreground">Needs Review</div>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Latest Updates</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Access Level Filtering system documentation completed</li>
                <li>• Implementation guides with code examples added</li>
                <li>• User training manual updated with permissions matrix</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TechnicalDocs;
