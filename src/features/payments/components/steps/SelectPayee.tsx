import { useState } from 'react';
import { PayeeList } from '../PayeeList';
import { AddPayeeDialog } from '../AddPayeeDialog';
import { usePaymentWizardStore } from '../../store/paymentWizardStore';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import type { Payee } from '../../schemas';

export function SelectPayeeStep() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const selectedPayee = usePaymentWizardStore((s) => s.selectedPayee);
  const selectPayee = usePaymentWizardStore((s) => s.selectPayee);

  const handleSelect = (payee: Payee) => {
    selectPayee(payee);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Who are you paying?</h2>
        <Button variant="outline" size="sm" onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-1 h-4 w-4" />
          Add Payee
        </Button>
      </div>
      <PayeeList onSelect={handleSelect} selectedId={selectedPayee?.id} />
      <AddPayeeDialog isOpen={showAddDialog} onClose={() => setShowAddDialog(false)} />
    </div>
  );
}
