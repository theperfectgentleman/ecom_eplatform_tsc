import { useEffect, useMemo, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useApi } from '@/lib/useApi';
import { useToast } from '@/components/ui/toast/useToast';
import { Settings, Database, Shield, Globe, PhoneCall } from 'lucide-react';

const normalizeNumber = (value: string): string | null => {
  if (!value) return null;
  let digits = value.replace(/[^0-9]/g, '');
  if (!digits) return null;

  if (digits.startsWith('00')) {
    digits = digits.slice(2);
  }

  if (digits.startsWith('0') && digits.length >= 10) {
    digits = `233${digits.slice(1)}`;
  } else if (digits.length === 9) {
    digits = `233${digits}`;
  }

  if (digits.length < 10 || digits.length > 15) {
    return null;
  }

  if (/^0+$/.test(digits)) {
    return null;
  }

  return digits;
};

const AdminSettings = () => {
  // VSMS sheet state
  const [open, setOpen] = useState(false);
  const [districtOptions, setDistrictOptions] = useState<string[]>([]);
  const [district, setDistrict] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [recipientsText, setRecipientsText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [districtRecipients, setDistrictRecipients] = useState<string[]>([]);
  const [districtInvalidCount, setDistrictInvalidCount] = useState(0);
  const [districtSummaryLoading, setDistrictSummaryLoading] = useState(false);

  const { request } = useApi();
  const { toast } = useToast();

  const manualRecipientStats = useMemo(() => {
    const raw = recipientsText
      .split(/[\n,;\s]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const seen = new Set<string>();
    const valid: string[] = [];
    const invalid: string[] = [];

    raw.forEach((entry) => {
      const normalized = normalizeNumber(entry);
      if (!normalized) {
        invalid.push(entry);
        return;
      }
      if (!seen.has(normalized)) {
        seen.add(normalized);
        valid.push(normalized);
      }
    });

    return { valid, invalid };
  }, [recipientsText]);

  const parsedRecipients = manualRecipientStats.valid;
  const invalidManualCount = manualRecipientStats.invalid.length;

  useEffect(() => {
    // Load unique district list from communities
    request<any[]>({ path: 'communities', suppressToast: { error: true } })
      .then((data) => {
        const districts = Array.from(
          new Set(
            (data || [])
              .map((c: any) => c.district)
              .filter((d: any) => typeof d === 'string' && d.trim().length)
          )
        )
          .sort((a, b) => a.localeCompare(b));
        setDistrictOptions(districts);
      })
      .catch(() => {
        // ignore; optional
      });
  }, [request]);

  const getDistrictContacts = useCallback(async (d: string): Promise<{ valid: string[]; invalid: string[] }> => {
    // Best-effort fetch of contacts in a district
    try {
      const res: any[] = await request<any[]>({ path: `/contacts?district=${encodeURIComponent(d)}`, suppressToast: { error: true } });
      const seen = new Set<string>();
      const valid: string[] = [];
      const invalid: string[] = [];

      (res || [])
        .map((c: any) => c.mobile1 || c.Mobile1 || c.contact_number)
        .filter((v: any) => typeof v === 'string' && v.trim().length)
        .forEach((raw: string) => {
          const normalized = normalizeNumber(raw);
          if (!normalized) {
            invalid.push(raw);
            return;
          }
          if (!seen.has(normalized)) {
            seen.add(normalized);
            valid.push(normalized);
          }
        });

      return { valid, invalid };
    } catch {
      return { valid: [], invalid: [] };
    }
  }, [request]);

  useEffect(() => {
    if (!district) {
      setDistrictRecipients([]);
      setDistrictInvalidCount(0);
      setDistrictSummaryLoading(false);
      return;
    }

    let cancelled = false;
    setDistrictSummaryLoading(true);

    getDistrictContacts(district)
      .then(({ valid, invalid }) => {
        if (cancelled) return;
        setDistrictRecipients(valid);
        setDistrictInvalidCount(invalid.length);
      })
      .finally(() => {
        if (cancelled) return;
        setDistrictSummaryLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [district, getDistrictContacts]);

  const handleSend = async () => {
    if (!file) {
      toast({ variant: 'warning', title: 'No file selected', description: 'Please choose an audio file (mp3, wav, ogg).' });
      return;
    }
    setSubmitting(true);
    try {
      // Build recipients: prefer manual list; else use district selection
      let recipients: string[] = parsedRecipients;
      if (recipients.length === 0 && district) {
        if (districtRecipients.length === 0) {
          const districtData = await getDistrictContacts(district);
          recipients = districtData.valid;
        } else {
          recipients = districtRecipients;
        }
      }
      if (recipients.length === 0) {
        toast({ variant: 'warning', title: 'No recipients', description: 'Add numbers or select a district with contacts.' });
        return;
      }

      const formData = new FormData();
      formData.append('voice_file', file);
      recipients.forEach((r) => formData.append('recipients[]', r));
      if (district) formData.append('district', district);
      formData.append('source', parsedRecipients.length > 0 ? 'manual' : 'district');

      const data = await request<{ message?: string; recipients?: number; invalidRecipients?: string[] }>({
        path: 'admin/voice-sms',
        method: 'POST',
        body: formData,
        suppressToast: { error: true },
      });

      const validCount = data?.recipients ?? recipients.length;
      const skipped = data?.invalidRecipients?.length ?? 0;
      const details = `${validCount} valid recipient${validCount === 1 ? '' : 's'}${
        skipped ? ` • ${skipped} invalid skipped` : ''
      }`;

      toast({
        variant: 'success',
        title: 'Voice SMS queued',
        description: `${data?.message || 'Request sent successfully.'} (${details})`,
      });
      // Reset form and close
      setFile(null);
      setRecipientsText('');
      setDistrict('');
      setOpen(false);
    } catch (err: any) {
      toast({ variant: 'error', title: 'Failed to send', description: err?.message || 'Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

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
              {/* Disguised VSMS opener */}
              <div className="flex justify-between items-center">
                <span className="text-sm">VSMS status</span>
                <Sheet open={open} onOpenChange={setOpen}>
                  <SheetTrigger asChild>
                    <Badge
                      variant="outline"
                      className="text-xs cursor-pointer select-none"
                      title="Open Voice SMS"
                    >
                      Open
                    </Badge>
                  </SheetTrigger>
                  <SheetContent side="right" className="sm:max-w-lg w-full">
                    <SheetHeader>
                      <SheetTitle className="flex items-center gap-2">
                        <PhoneCall className="h-5 w-5" /> Send Voice SMS
                      </SheetTitle>
                    </SheetHeader>
                    <div className="mt-4 space-y-5">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">District (optional if you specify recipients)</label>
                        <Select value={district} onValueChange={setDistrict}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select district" />
                          </SelectTrigger>
                          <SelectContent className="max-h-72">
                            {districtOptions.map((d) => (
                              <SelectItem key={d} value={d}>{d}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">We'll fetch contacts in this district if no manual recipients are provided.</p>
                        {district && (
                          <p className="text-xs text-muted-foreground">
                            {districtSummaryLoading
                              ? 'Loading district contacts…'
                              : `Valid district recipients: ${districtRecipients.length}`}
                          </p>
                        )}
                        {district && !districtSummaryLoading && districtInvalidCount > 0 && (
                          <p className="text-xs text-amber-600">Removed {districtInvalidCount} invalid district entr{districtInvalidCount === 1 ? 'y' : 'ies'}.</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Voice file</label>
                        <Input
                          type="file"
                          accept=".mp3,.wav,.ogg,audio/*"
                          onChange={(e) => setFile(e.target.files?.[0] || null)}
                        />
                        <p className="text-xs text-muted-foreground">Accepted: mp3, wav, ogg. Max size depends on your Arkesel plan.</p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Recipients (optional)</label>
                        <textarea
                          className="w-full min-h-[96px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          placeholder="Comma, space or newline separated (e.g., 2335xxxxxxx, 2332xxxxxxx)"
                          value={recipientsText}
                          onChange={(e) => setRecipientsText(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">If provided, we'll send only to these numbers.</p>
                        {parsedRecipients.length > 0 && (
                          <p className="text-xs text-muted-foreground">Valid manual recipients: {parsedRecipients.length}</p>
                        )}
                        {invalidManualCount > 0 && (
                          <p className="text-xs text-amber-600">Removed {invalidManualCount} invalid entr{invalidManualCount === 1 ? 'y' : 'ies'}.</p>
                        )}
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>Cancel</Button>
                        <Button onClick={handleSend} disabled={submitting}>
                          {submitting ? 'Sending…' : 'Send Voice SMS'}
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
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
