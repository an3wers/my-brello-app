import { useState } from 'react';

import { KanbanCardForm, cardCreateClicked } from '@/kanban/model';
import type { KanbanList } from '@/kanban/types';
import { cn } from '@/lib/utils';
import { Droppable } from '@hello-pangea/dnd';
import { useUnit } from 'effector-react';
import { CirclePlus, EllipsisVertical } from 'lucide-react';

import styles from '@/custom-scroll-style/styles.module.css';

import { Button } from '../ui/button';
import { KanbanCard } from './KanbanCard';
import { KanbanCreateCard } from './KanbanCreateCard';

interface KanbanColumnProps extends KanbanList {
  className?: string;
  children?: React.ReactNode;
}

export const KanbanColumn = ({ className, title, cards, id }: KanbanColumnProps) => {
  const [onCreateCard] = useUnit([cardCreateClicked]);

  const [hasAddCard, setHasAddCard] = useState(false);

  function onCardCreate(card: KanbanCardForm) {
    onCreateCard({ card, columnId: id });
    setHasAddCard(false);
  }

  return (
    <div className="col-span-4">
      <Droppable key={id} droppableId={id}>
        {(provided) => {
          return (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={cn(
                'p-6 space-y-6 bg-gray-50 border flex flex-col w-[340px]',
                className,
                styles.root,
              )}
            >
              <div className="flex justify-between gap-2">
                <h3 className="text-lg font-bold">{title}</h3>
                <div className="flex">
                  <Button size={'icon'} variant={'ghost'}>
                    <EllipsisVertical className="text-gray-400" />
                  </Button>
                  <Button
                    onClick={() => setHasAddCard(!hasAddCard)}
                    size={'icon'}
                    variant={'ghost'}
                  >
                    <CirclePlus className="text-gray-400" />
                  </Button>
                </div>
              </div>

              <div
                className={cn(
                  'flex flex-col gap-2 py-2 max-h-[calc(100vh-290px)] -mx-2 px-2 overflow-y-auto',
                  styles.root,
                )}
              >
                {hasAddCard && (
                  <KanbanCreateCard onCreate={onCardCreate} onCancel={() => setHasAddCard(false)} />
                )}
                {cards.map(({ id: _id, title }, index) => {
                  return (
                    <KanbanCard key={_id} index={index} title={title} id={_id} columnId={id} />
                  );
                })}
                {provided.placeholder}
              </div>
            </div>
          );
        }}
      </Droppable>
    </div>
  );
};
