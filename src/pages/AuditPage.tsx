import { AuditLogViewer } from '@/features/audit/components/AuditLogViewer';

export default function AuditPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
        <p className="mt-1 text-sm text-gray-500">Review system activity and security events</p>
      </div>
      <AuditLogViewer />
    </div>
  );
}
