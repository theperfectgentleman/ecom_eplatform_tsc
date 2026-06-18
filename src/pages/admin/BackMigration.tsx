import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast/useToast';
import { 
  UploadCloud, 
  ShieldCheck, 
  AlertCircle, 
  Database, 
  Users, 
  Heart, 
  Calendar,
  RefreshCw,
  Eye,
  FileCode2,
  Lock,
  ArrowRightLeft
} from 'lucide-react';

interface BackupData {
  backup_version: number;
  timestamp: string;
  device_db_path: string;
  counts: {
    patient_bios: number;
    antenatal_registrations: number;
    antenatal_visits: number;
  };
  data: {
    patient_bios: any[];
    antenatal_registrations: any[];
    antenatal_visits: any[];
  };
}

const BackMigration = () => {
  const { toast } = useToast();
  const [passphrase, setPassphrase] = useState('encompas');
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  
  // Decrypted & parsed data
  const [backupData, setBackupData] = useState<BackupData | null>(null);
  const [activePreviewTab, setActivePreviewTab] = useState<'patients' | 'registrations' | 'visits'>('patients');
  
  // Operations state
  const [decrypting, setDecrypting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [migrating, setMigrating] = useState(false);
  
  const [verificationPassed, setVerificationPassed] = useState<boolean | null>(null);
  const [verificationLogs, setVerificationLogs] = useState<string[]>([]);
  const [migrationLogs, setMigrationLogs] = useState<string[]>([]);
  const [migrationProgress, setMigrationProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelected(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelected(files[0]);
    }
  };

  const handleFileSelected = (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.enc')) {
      toast({
        variant: 'error',
        title: 'Invalid file format',
        description: 'Please upload a secure encrypted backup file (.enc).'
      });
      return;
    }
    setFile(selectedFile);
    setBackupData(null);
    setVerificationPassed(null);
    setVerificationLogs([]);
    setMigrationLogs([]);
    setMigrationProgress(0);
    
    toast({
      variant: 'success',
      title: 'File uploaded successfully',
      description: `${selectedFile.name} is ready for decryption.`
    });
  };

  // Client-side decryption using browser Web Crypto API
  const handleDecrypt = async () => {
    if (!file) return;
    if (!passphrase.trim()) {
      toast({
        variant: 'warning',
        title: 'Passphrase required',
        description: 'Please enter the decryption passphrase.'
      });
      return;
    }

    setDecrypting(true);
    try {
      // 1. Read file as ArrayBuffer
      const fileBuffer = await file.arrayBuffer();
      
      if (fileBuffer.byteLength < 16) {
        throw new Error('File is too short to contain IV and ciphertext.');
      }

      // 2. Derive key from passphrase using SHA-256 hash
      const passphraseBytes = new TextEncoder().encode(passphrase);
      const keyHashBuffer = await window.crypto.subtle.digest('SHA-256', passphraseBytes);
      
      const cryptoKey = await window.crypto.subtle.importKey(
        'raw',
        keyHashBuffer,
        { name: 'AES-CBC' },
        false,
        ['decrypt']
      );

      // 3. Extract IV (first 16 bytes) and Ciphertext (remaining bytes)
      const iv = fileBuffer.slice(0, 16);
      const ciphertext = fileBuffer.slice(16);

      // 4. Decrypt
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: 'AES-CBC', iv: iv },
        cryptoKey,
        ciphertext
      );

      // 5. Decode and Parse JSON
      const decryptedText = new TextDecoder('utf-8').decode(decryptedBuffer);
      const parsedData = JSON.parse(decryptedText) as BackupData;

      // Validate structure
      if (!parsedData.data || !parsedData.data.patient_bios || !parsedData.data.antenatal_registrations || !parsedData.data.antenatal_visits) {
        throw new Error('Invalid backup file structure: missing expected tables.');
      }

      setBackupData(parsedData);
      toast({
        variant: 'success',
        title: 'Decryption successful',
        description: `Successfully decrypted database containing ${parsedData.data.patient_bios.length} patients.`
      });
    } catch (error: any) {
      console.error('Decryption failed:', error);
      toast({
        variant: 'error',
        title: 'Decryption failed',
        description: 'Passphrase incorrect or database file has been corrupted.'
      });
    } finally {
      setDecrypting(false);
    }
  };

  // Simulated validation/verification checks
  const handleVerify = () => {
    if (!backupData) return;
    setVerifying(true);
    setVerificationLogs([]);

    const logs: string[] = [];
    logs.push(`[INFO] Starting data quality verification on backup version ${backupData.backup_version}...`);
    logs.push(`[INFO] Original device path: ${backupData.device_db_path}`);
    logs.push(`[INFO] Backup generation time: ${new Date(backupData.timestamp).toLocaleString()}`);

    setTimeout(() => {
      // Check Patients
      const patients = backupData.data.patient_bios;
      logs.push(`[CHECK] Scanning ${patients.length} Patient Bio records...`);
      let patientErrors = 0;
      patients.forEach((p, idx) => {
        if (!p.patientId || !p.name) {
          logs.push(`[ERROR] Patient row #${idx} has missing Primary ID or Name.`);
          patientErrors++;
        }
      });
      if (patientErrors === 0) {
        logs.push(`[SUCCESS] All Patient Bio structures validated successfully.`);
      }

      // Check ANC Registrations
      const registrations = backupData.data.antenatal_registrations;
      logs.push(`[CHECK] Scanning ${registrations.length} ANC Registration records...`);
      let orphanRegistrations = 0;
      registrations.forEach(r => {
        const patientExists = patients.some(p => p.patientId === r.patientId);
        if (!patientExists) {
          logs.push(`[WARNING] ANC Reg ID ${r.antenatalRegistrationId} references missing patient ID ${r.patientId} (Orphan Record).`);
          orphanRegistrations++;
        }
      });
      if (orphanRegistrations > 0) {
        logs.push(`[WARN] Found ${orphanRegistrations} ANC Registrations without accompanying bio records. Will create placeholders if imported.`);
      } else {
        logs.push(`[SUCCESS] All ANC Registrations linked to valid patient profiles.`);
      }

      // Check ANC Visits
      const visits = backupData.data.antenatal_visits;
      logs.push(`[CHECK] Scanning ${visits.length} ANC Visit records...`);
      let orphanVisits = 0;
      visits.forEach(v => {
        const patientExists = patients.some(p => p.patientId === v.patientId);
        if (!patientExists) {
          logs.push(`[WARNING] ANC Visit ID ${v.antenatalVisitSid} references missing patient ID ${v.patientId}.`);
          orphanVisits++;
        }
      });
      if (orphanVisits > 0) {
        logs.push(`[WARN] Found ${orphanVisits} ANC Visits without accompanying bio records.`);
      } else {
        logs.push(`[SUCCESS] All ANC Visits linked to valid patient profiles.`);
      }

      // Final decision
      logs.push('[INFO] Verification scans finished.');
      setVerificationLogs(logs);
      setVerificationPassed(patientErrors === 0);
      setVerifying(false);

      toast({
        variant: patientErrors === 0 ? 'success' : 'warning',
        title: 'Verification complete',
        description: patientErrors === 0 ? 'Data validation passed.' : 'Data validated with errors. See logs.'
      });
    }, 1200);
  };

  // Mock processing migration
  const handleMigrate = () => {
    if (!backupData) return;
    setMigrating(true);
    setMigrationProgress(0);
    setMigrationLogs([]);

    const totalRecords = 
      backupData.data.patient_bios.length + 
      backupData.data.antenatal_registrations.length + 
      backupData.data.antenatal_visits.length;
    
    let processed = 0;
    const logs: string[] = [];
    logs.push('[START] Initiating staging migration sequence...');

    const processInterval = setInterval(() => {
      if (processed < backupData.data.patient_bios.length) {
        const item = backupData.data.patient_bios[processed];
        logs.push(`[STAGE 1/3] Processing Patient Bio: ${item.name} (${item.patientId}) - Staging OK.`);
        processed++;
      } else if (processed < backupData.data.patient_bios.length + backupData.data.antenatal_registrations.length) {
        const regIdx = processed - backupData.data.patient_bios.length;
        const item = backupData.data.antenatal_registrations[regIdx];
        logs.push(`[STAGE 2/3] Processing ANC Registration: No. ${item.registrationNumber} (ID: ${item.antenatalRegistrationId}) - Staging OK.`);
        processed++;
      } else if (processed < totalRecords) {
        const visitIdx = processed - backupData.data.patient_bios.length - backupData.data.antenatal_registrations.length;
        const item = backupData.data.antenatal_visits[visitIdx];
        logs.push(`[STAGE 3/3] Processing ANC Visit: Date ${item.visitDate?.split('T')[0] || item.visitDate} (ID: ${item.antenatalVisitSid}) - Staging OK.`);
        processed++;
      }

      const progress = Math.min(Math.round((processed / totalRecords) * 100), 100);
      setMigrationProgress(progress);
      setMigrationLogs([...logs]);

      if (processed >= totalRecords) {
        clearInterval(processInterval);
        logs.push('[COMPLETE] Staging Migration complete. 100% of records are decrypted, analyzed, and staged.');
        logs.push('[PLACEHOLDER] Note: Central API upload API hook will commit these records in the next phase.');
        setMigrationLogs([...logs]);
        setMigrating(false);
        toast({
          variant: 'success',
          title: 'Staging Migration Complete',
          description: `Successfully loaded and prepared ${totalRecords} records for central migration.`
        });
      }
    }, 150);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex flex-col">
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <ArrowRightLeft className="h-8 w-8 text-blue-600" />
            <span>Back Migration Manager</span>
          </h2>
          <p className="text-muted-foreground mt-1">
            Decrypt, analyze, and recover local databases collected from field devices with connectivity blockages.
          </p>
        </div>
        <Badge variant="secondary" className="text-xs self-start mt-2">
          <ShieldCheck className="h-3 w-3 mr-1 text-blue-600" />
          Admin Security
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Upload and Decrypt Card */}
        <Card className="md:col-span-1 border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-blue-600" />
              <span>Security Decryption</span>
            </CardTitle>
            <CardDescription>
              Decrypt the SQLite JSON payload before loading the recovery console.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Decryption Key Input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-1.5">
                <span>Passphrase Key</span>
                <span className="text-xs font-normal text-muted-foreground">(shared secret)</span>
              </label>
              <Input
                type="password"
                placeholder="Enter passphrase"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                className="font-mono bg-white"
              />
            </div>

            {/* Dropzone File Upload */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors duration-200 ${
                isDragging 
                  ? 'border-blue-500 bg-blue-50' 
                  : file 
                    ? 'border-green-500 bg-green-50/30' 
                    : 'border-slate-300 hover:border-blue-500 hover:bg-slate-50'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".enc"
                className="hidden"
              />
              <UploadCloud className={`h-10 w-10 mx-auto mb-2 ${file ? 'text-green-600' : 'text-slate-400'}`} />
              {file ? (
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-green-800 truncate max-w-[220px] mx-auto">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-sm font-semibold">Drag & Drop secure backup</p>
                  <p className="text-xs text-slate-500">or click to browse (.enc files)</p>
                </div>
              )}
            </div>

            {file && (
              <Button 
                onClick={handleDecrypt} 
                disabled={decrypting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center justify-center gap-2"
              >
                {decrypting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Decrypting...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    DECRYPT FILE
                  </>
                )}
              </Button>
            )}

            {backupData && (
              <div className="mt-4 p-4 rounded-lg bg-blue-50/50 border border-blue-100 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                  <Database className="h-3.5 w-3.5" />
                  Backup Info
                </h4>
                <div className="text-xs space-y-1.5 font-medium text-blue-950">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Version:</span>
                    <span>v{backupData.backup_version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Generated:</span>
                    <span>{new Date(backupData.timestamp).toLocaleDateString()}</span>
                  </div>
                  <div className="flex flex-col mt-1">
                    <span className="text-slate-500">Device Path:</span>
                    <span className="font-mono text-[10px] break-all text-slate-700 block mt-0.5">
                      {backupData.device_db_path}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Diagnostic console and Analysis Panel */}
        <Card className="md:col-span-2 border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCode2 className="h-5 w-5 text-blue-600" />
              <span>Migration Console</span>
            </CardTitle>
            <CardDescription>
              Analyze decryption results, verify relationship integrity, and migrate staged records.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[432px] flex flex-col justify-between">
            {!backupData ? (
              <div className="flex-1 border rounded-lg border-slate-200 border-dashed bg-slate-50/50 flex flex-col items-center justify-center text-center p-6">
                <AlertCircle className="h-10 w-10 text-slate-400 mb-2" />
                <h3 className="font-semibold text-slate-700">No Decrypted Data</h3>
                <p className="text-sm text-slate-500 max-w-[320px] mt-1">
                  Upload an encrypted backup file and decrypt it using the passphrase to enable this console.
                </p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                {/* Visual counts */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-100/60 p-3 rounded-lg border border-slate-200 flex items-center gap-3">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-500">Patients</div>
                      <div className="text-xl font-bold">{backupData.counts.patient_bios}</div>
                    </div>
                  </div>
                  <div className="bg-slate-100/60 p-3 rounded-lg border border-slate-200 flex items-center gap-3">
                    <Heart className="h-8 w-8 text-purple-600" />
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-500">ANC Regs</div>
                      <div className="text-xl font-bold">{backupData.counts.antenatal_registrations}</div>
                    </div>
                  </div>
                  <div className="bg-slate-100/60 p-3 rounded-lg border border-slate-200 flex items-center gap-3">
                    <Calendar className="h-8 w-8 text-orange-600" />
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-500">ANC Visits</div>
                      <div className="text-xl font-bold">{backupData.counts.antenatal_visits}</div>
                    </div>
                  </div>
                </div>

                {/* Log outputs / Execution log */}
                <div className="flex-1 bg-slate-950 rounded-lg p-4 font-mono text-xs overflow-y-auto text-green-400 space-y-1.5">
                  {verificationLogs.length === 0 && migrationLogs.length === 0 && (
                    <div className="text-slate-500 italic">Console ready. Click 'Verify Data' or 'Migrate Data' to run diagnostics...</div>
                  )}
                  {verificationLogs.map((log, i) => (
                    <div key={`v-${i}`} className={log.includes('[ERROR]') ? 'text-red-400' : log.includes('[WARNING]') || log.includes('[WARN]') ? 'text-amber-400' : log.includes('[SUCCESS]') ? 'text-emerald-400' : 'text-slate-300'}>
                      {log}
                    </div>
                  ))}
                  {migrationLogs.map((log, i) => (
                    <div key={`m-${i}`} className={log.includes('[COMPLETE]') ? 'text-emerald-400' : log.includes('[STAGE') ? 'text-blue-400' : 'text-slate-300'}>
                      {log}
                    </div>
                  ))}
                </div>

                {/* Progress bar */}
                {migrating && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>Migration Staging Progress</span>
                      <span>{migrationProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 transition-all duration-150" style={{ width: `${migrationProgress}%` }}></div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleVerify} 
                    disabled={verifying || migrating}
                    className="flex-1 border-slate-300 hover:bg-slate-100 font-semibold"
                  >
                    {verifying ? 'VERIFYING...' : 'VERIFY DATA QUALITY'}
                  </Button>
                  <Button 
                    onClick={handleMigrate} 
                    disabled={migrating || verifying || verificationPassed === false}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center justify-center gap-1.5"
                  >
                    {migrating ? 'MIGRATING...' : 'PROCESS MIGRATION (STAGING)'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Interactive Staged Records Preview */}
      {backupData && (
        <Card className="border-slate-200">
          <CardHeader className="pb-3 border-b">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="h-4.5 w-4.5 text-blue-600" />
                  <span>Staged Database Preview</span>
                </CardTitle>
                <CardDescription>
                  Preview the extracted SQLite records decrypted in memory.
                </CardDescription>
              </div>
              
              {/* Tab Selector */}
              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  onClick={() => setActivePreviewTab('patients')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    activePreviewTab === 'patients' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Patients ({backupData.data.patient_bios.length})
                </button>
                <button
                  onClick={() => setActivePreviewTab('registrations')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    activePreviewTab === 'registrations' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Registrations ({backupData.data.antenatal_registrations.length})
                </button>
                <button
                  onClick={() => setActivePreviewTab('visits')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    activePreviewTab === 'visits' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Visits ({backupData.data.antenatal_visits.length})
                </button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0 max-h-[360px] overflow-auto">
            {activePreviewTab === 'patients' && (
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider sticky top-0 border-b">
                  <tr>
                    <th className="px-6 py-3">Patient ID</th>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">DOB</th>
                    <th className="px-6 py-3">Contact</th>
                    <th className="px-6 py-3">District</th>
                    <th className="px-6 py-3">Sync Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {backupData.data.patient_bios.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-400 italic">No patients found in backup.</td>
                    </tr>
                  ) : (
                    backupData.data.patient_bios.map((p, idx) => (
                      <tr key={p.patientId || idx} className="hover:bg-slate-50/50">
                        <td className="px-6 py-3.5 font-mono text-xs text-blue-700">{p.patientId}</td>
                        <td className="px-6 py-3.5 font-semibold text-slate-900">{p.name}</td>
                        <td className="px-6 py-3.5">{formatDate(p.dob)}</td>
                        <td className="px-6 py-3.5">{p.contact_number || p.contactNumber}</td>
                        <td className="px-6 py-3.5">{p.district}</td>
                        <td className="px-6 py-3.5">
                          <Badge variant="outline" className={`text-[10px] ${p.isSynced ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                            {p.isSynced ? 'Synced' : 'Pending'}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {activePreviewTab === 'registrations' && (
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider sticky top-0 border-b">
                  <tr>
                    <th className="px-6 py-3">Registration ID</th>
                    <th className="px-6 py-3">Patient ID</th>
                    <th className="px-6 py-3">Reg. Number</th>
                    <th className="px-6 py-3">Registration Date</th>
                    <th className="px-6 py-3">Gravida / Parity</th>
                    <th className="px-6 py-3">Gestation (wks)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {backupData.data.antenatal_registrations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-400 italic">No registrations found in backup.</td>
                    </tr>
                  ) : (
                    backupData.data.antenatal_registrations.map((r, idx) => (
                      <tr key={r.antenatalRegistrationId || idx} className="hover:bg-slate-50/50">
                        <td className="px-6 py-3.5 font-mono text-xs text-purple-700">{r.antenatalRegistrationId}</td>
                        <td className="px-6 py-3.5 font-mono text-xs text-blue-700">{r.patientId}</td>
                        <td className="px-6 py-3.5 font-semibold text-slate-950">{r.registrationNumber}</td>
                        <td className="px-6 py-3.5">{formatDate(r.registrationDate || r.registration_date)}</td>
                        <td className="px-6 py-3.5">{r.gravida} / {r.parity}</td>
                        <td className="px-6 py-3.5">{r.gestationWeeks || r.gestation_weeks || 'N/A'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {activePreviewTab === 'visits' && (
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider sticky top-0 border-b">
                  <tr>
                    <th className="px-6 py-3">Visit SID</th>
                    <th className="px-6 py-3">Patient ID</th>
                    <th className="px-6 py-3">Visit Date</th>
                    <th className="px-6 py-3">BP / Weight (kg)</th>
                    <th className="px-6 py-3">Gestation (wks)</th>
                    <th className="px-6 py-3">Next Visit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {backupData.data.antenatal_visits.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-400 italic">No visits found in backup.</td>
                    </tr>
                  ) : (
                    backupData.data.antenatal_visits.map((v, idx) => (
                      <tr key={v.antenatalVisitSid || idx} className="hover:bg-slate-50/50">
                        <td className="px-6 py-3.5 font-mono text-xs text-orange-700">{v.antenatalVisitSid}</td>
                        <td className="px-6 py-3.5 font-mono text-xs text-blue-700">{v.patientId}</td>
                        <td className="px-6 py-3.5">{formatDate(v.visitDate || v.visit_date)}</td>
                        <td className="px-6 py-3.5">{v.bloodPressure || v.blood_pressure || 'N/A'} / {v.weightKg || v.weight_kg || 'N/A'}</td>
                        <td className="px-6 py-3.5">{v.gestationWeeks || v.gestation_weeks || 'N/A'}</td>
                        <td className="px-6 py-3.5">{formatDate(v.nextVisitDate || v.next_visit_date)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BackMigration;
