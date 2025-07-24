import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, Database, Shield, Globe } from 'lucide-react';

const AdminSettings = () => {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
        <Badge variant="secondary" className="text-xs">
          <Settings className="h-3 w-3 mr-1" />
          Admin Only
        </Badge>
      </div>

      <div className="text-muted-foreground">
        <p>Configure system-wide settings and preferences.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Data Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Auto-backup enabled</span>
                <Badge variant="outline" className="text-xs">Active</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Data retention period</span>
                <span className="text-sm text-muted-foreground">365 days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Cache refresh interval</span>
                <span className="text-sm text-muted-foreground">30 minutes</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Security Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Session timeout</span>
                <span className="text-sm text-muted-foreground">8 hours</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Password complexity</span>
                <Badge variant="outline" className="text-xs">Strong</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Two-factor authentication</span>
                <Badge variant="outline" className="text-xs">Optional</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <span>Regional Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Default timezone</span>
                <span className="text-sm text-muted-foreground">UTC+0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Date format</span>
                <span className="text-sm text-muted-foreground">YYYY-MM-DD</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Language</span>
                <span className="text-sm text-muted-foreground">English</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>System Configuration</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">API rate limiting</span>
                <Badge variant="outline" className="text-xs">Enabled</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Debug mode</span>
                <Badge variant="outline" className="text-xs">Disabled</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Maintenance mode</span>
                <Badge variant="outline" className="text-xs">Disabled</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuration Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-2">✅ System Healthy</h4>
            <p className="text-green-700 text-sm">
              All system settings are properly configured and functioning normally.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
