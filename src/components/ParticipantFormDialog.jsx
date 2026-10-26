import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

const EMPTY = {
  name: '',
  date_of_birth: '',
  age: '',
  sensory_considerations: '',
  current_goals: '',
  notes: '',
};

const FIELD_CLASS =
  'mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-100';

// Edits the signed-in student's own Steady profile.
export default function ParticipantFormDialog({ open, onOpenChange, participant, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setError('');
      setForm(
        participant
          ? {
              name: participant.name || '',
              date_of_birth: participant.date_of_birth || '',
              age: participant.age ?? '',
              sensory_considerations: participant.sensory_considerations || '',
              current_goals: participant.current_goals || '',
              notes: participant.notes || '',
            }
          : EMPTY
      );
    }
  }, [open, participant]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) {
      setError('Name is required.');
      return;
    }
    setSaving(true);
    try {
      await db.Participant.update(participant.id, {
        name: form.name.trim(),
        date_of_birth: form.date_of_birth || null,
        age: form.age === '' ? null : Number(form.age),
        sensory_considerations: form.sensory_considerations.trim(),
        current_goals: form.current_goals.trim(),
        notes: form.notes.trim(),
      });
      onOpenChange(false);
      onSaved?.(participant.id);
    } catch (err) {
      setError(err.message || 'Could not save your profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Update your name, sensory considerations and current goals.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="p-name">Name</Label>
              <Input id="p-name" value={form.name} onChange={(e) => set('name', e.target.value)} className={FIELD_CLASS} required />
            </div>
            <div>
              <Label htmlFor="p-dob">Date of birth</Label>
              <Input id="p-dob" type="date" value={form.date_of_birth} onChange={(e) => set('date_of_birth', e.target.value)} className={FIELD_CLASS} />
            </div>
            <div>
              <Label htmlFor="p-age">Age</Label>
              <Input id="p-age" type="number" min={0} value={form.age} onChange={(e) => set('age', e.target.value)} className={FIELD_CLASS} />
            </div>
          </div>

          <div>
            <Label htmlFor="p-sens">Sensory considerations</Label>
            <Textarea id="p-sens" rows={2} placeholder="e.g. Loud rooms are draining, I focus better with headphones" value={form.sensory_considerations} onChange={(e) => set('sensory_considerations', e.target.value)} className={FIELD_CLASS} />
          </div>
          <div>
            <Label htmlFor="p-goals">Current goals</Label>
            <Textarea id="p-goals" rows={2} placeholder="e.g. Start homework earlier, take breaks before I burn out" value={form.current_goals} onChange={(e) => set('current_goals', e.target.value)} className={FIELD_CLASS} />
          </div>
          <div>
            <Label htmlFor="p-notes">Notes (optional)</Label>
            <Textarea id="p-notes" rows={2} value={form.notes} onChange={(e) => set('notes', e.target.value)} className={FIELD_CLASS} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}