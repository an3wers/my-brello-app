import { FormEvent, useState } from 'react';

import { KanbanCardForm } from '@/kanban/model';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';

interface KanbanCreateCardProps {
  className?: string;
  onCreate: (card: KanbanCardForm) => void;
  onCancel: () => void;
}

export const KanbanCreateCard = ({ className, onCreate, onCancel }: KanbanCreateCardProps) => {
  const [title, setTitle] = useState('');

  function onReset() {
    setTitle('');
    onCancel();
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onCreate({ title });
    onReset();
  }

  return (
    <form className={cn('flex flex-col gap-2', className)} onSubmit={onSubmit}>
      <Textarea
        value={title}
        placeholder="Start making new card here"
        onChange={(e) => setTitle(e.target.value)}
      />
      <div className="flex gap-2">
        <Button type="submit" variant="default" size={'sm'} className="w-full">
          Add card
        </Button>
        <Button onClick={onReset} type="submit" size={'icon'} variant="ghost">
          <X />
        </Button>
      </div>
    </form>
  );
};
