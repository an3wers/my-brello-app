import { useState } from 'react';

import type { KanbanCard as KanbanCardType } from '@/kanban/types';
import { cn } from '@/lib/utils';
import { Draggable } from '@hello-pangea/dnd';
import { Pencil, Trash } from 'lucide-react';

import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';

interface KanbanCardProps extends KanbanCardType {
  className?: string;
  index: number;
  onEdit: (card: KanbanCardType) => void;
  onDelete: (cardId: string) => void;
}
export const KanbanCard = ({ className, title, index, id, onEdit, onDelete }: KanbanCardProps) => {
  const [editTitle, setEditTitle] = useState(title);
  const [editMode, setEditMode] = useState(false);

  function onReset() {
    setEditTitle(title);
    setEditMode(false);
  }

  function onEditFinished() {
    onEdit({ id, title: editTitle });
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
            <CardHeader className="p-4">
              <CardTitle className="text-sm">{title}</CardTitle>
              <CardContent className="p-0">
                <div className="flex gap-2 justify-end mt-2">
                  <Button size={'icon'} variant={'ghost'} onClick={() => setEditMode(true)}>
                    <Pencil className="text-gray-400" />
                  </Button>
                  <Button size={'icon'} variant={'ghost'} onClick={() => onDelete(id)}>
                    <Trash className="text-gray-400" />
                  </Button>
                </div>
              </CardContent>
            </CardHeader>
          </Card>
        );
      }}
    </Draggable>
  );
};
