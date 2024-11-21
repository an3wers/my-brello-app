import { useState } from 'react';

import { cardDeleteClicked, cardEditClicked } from '@/kanban/model';
import type { KanbanCard as KanbanCardType } from '@/kanban/types';
import { cn } from '@/lib/utils';
import { Draggable } from '@hello-pangea/dnd';
import { useUnit } from 'effector-react';
import { Pencil, Trash } from 'lucide-react';

import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';

interface KanbanCardProps extends KanbanCardType {
  className?: string;
  index: number;
  columnId: string;
}
export const KanbanCard = ({ className, title, index, id, columnId }: KanbanCardProps) => {
  const [onCardEdit, onCardDelete] = useUnit([cardEditClicked, cardDeleteClicked]);

  const [editTitle, setEditTitle] = useState(title);
  const [editMode, setEditMode] = useState(false);

  function onReset() {
    setEditTitle(title);
    setEditMode(false);
  }

  function onEditFinished() {
    onCardEdit({ columnId, cardId: id, card: { title: editTitle } });
    onReset();
  }

  if (editMode) {
    return (
      <div className="flex flex-col gap-2 p-1">
        <Textarea value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
        <div className="flex justify-end gap-2">
          <Button size={'sm'} onClick={onEditFinished}>
            Save
          </Button>
          <Button size={'sm'} variant={'secondary'} onClick={onReset}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Draggable key={id} draggableId={id} index={index}>
      {(provided, snapshot) => {
        return (
          <Card
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={cn('', snapshot.isDragging ? 'border-gray-800 shadow-lg' : null, className)}
          >
            <CardHeader>
              <CardTitle className="text-sm">{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 justify-end mt-2">
                <Button size={'icon'} variant={'ghost'} onClick={() => setEditMode(true)}>
                  <Pencil className="text-gray-400" />
                </Button>
                <Button
                  size={'icon'}
                  variant={'ghost'}
                  onClick={() => onCardDelete({ columnId, cardId: id })}
                >
                  <Trash className="text-gray-400" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      }}
    </Draggable>
  );
};
