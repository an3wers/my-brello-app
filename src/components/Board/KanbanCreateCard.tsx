import { FormEvent, useState } from 'react';

import { cn } from '@/lib/utils';
import { KanbanCard } from '@/types/types';
import { X } from 'lucide-react';
import { nanoid } from 'nanoid';

import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';

interface KanbanCreateCardProps {
  className?: string;
  onCreate: (card: KanbanCard) => void;
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
    onCreate({ id: nanoid(), title });
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
