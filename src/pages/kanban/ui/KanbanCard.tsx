import { useState } from 'react';

import { cn } from '@/lib/utils';
import { $cardsPendingMap, cardDeleteClicked, cardEditClicked } from '@/pages/kanban/model';
import { Card as CardType } from '@/shared/api';
import { Draggable } from '@hello-pangea/dnd';
import { useStoreMap, useUnit } from 'effector-react';
import { Pencil, Trash } from 'lucide-react';

import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Textarea } from '../../../components/ui/textarea';

interface KanbanCardProps extends Pick<CardType, 'id' | 'title'> {
  className?: string;
  index: number;
  listId: string;
}
export const KanbanCard = ({ className, title, index, id, listId }: KanbanCardProps) => {
  const [onCardEdit, onCardDelete] = useUnit([cardEditClicked, cardDeleteClicked]);

  const [editTitle, setEditTitle] = useState(title);
  const [editMode, setEditMode] = useState(false);

  const disabled = useStoreMap({
    store: $cardsPendingMap,
    keys: [id],
    fn: (pendingMap, [id]) => pendingMap[id] ?? false,
  });

  function onReset() {
    setEditTitle(title);
    setEditMode(false);
  }

  function onEditFinished() {
    onCardEdit({ listId, cardId: id, card: { title: editTitle } });
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
            className={cn(
              '',
              disabled && ' opacity-50, pointer-events-none',
              snapshot.isDragging ? 'border-gray-800 shadow-lg' : null,
              className,
            )}
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
                  onClick={() => onCardDelete({ listId, cardId: id })}
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
