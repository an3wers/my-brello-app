import { useState } from 'react';

import { cn, getColumnColors } from '@/lib/utils';
import { KanbanCardForm, KanbanList, cardCreateClicked } from '@/pages/kanban/model';
import { Droppable } from '@hello-pangea/dnd';
import { useUnit } from 'effector-react';
import { CirclePlus, EllipsisVertical } from 'lucide-react';

import stylesScroll from '@/custom-scroll-style/styles.module.css';

import { Button } from '../../../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import { KanbanCard } from './KanbanCard';
import { KanbanCreateCard } from './KanbanCreateCard';
import stylesBoard from './board.module.css';

interface KanbanColumnProps extends Omit<KanbanList, 'created_at'> {
  className?: string;
  children?: React.ReactNode;
}

export const KanbanColumn = ({ className, title, cards, id, color }: KanbanColumnProps) => {
  const [onCreateCard] = useUnit([cardCreateClicked]);

  const [hasAddCard, setHasAddCard] = useState(false);

  function onCardCreate(card: KanbanCardForm) {
    onCreateCard({ card, listId: id });
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
                'p-6 space-y-6 flex flex-col w-[320px] bg-opacity-20',
                stylesBoard[color],
                className,
                stylesScroll.root,
              )}
            >
              <div className="flex justify-between gap-2">
                <h3 className="text-lg font-medium">{title}</h3>
                <div className="flex">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size={'icon'} variant={'ghost'}>
                        <EllipsisVertical className="text-gray-400" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-40">
                      <DropdownMenuLabel>Colors</DropdownMenuLabel>
                      <div className="p-2">
                        {getColumnColors().map((color) => {
                          return (
                            <span
                              onClick={() => {}}
                              key={color}
                              className={cn(
                                'h-4 w-4 rounded-full border inline-block mr-2 bg-opacity-60 cursor-pointer',
                                stylesBoard[color],
                              )}
                            ></span>
                          );
                        })}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>

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
                  stylesScroll.root,
                )}
              >
                {hasAddCard && (
                  <KanbanCreateCard onCreate={onCardCreate} onCancel={() => setHasAddCard(false)} />
                )}
                {cards.map(({ id: _id, title }: { id: string; title: string }, index: number) => {
                  return <KanbanCard key={_id} index={index} title={title} id={_id} listId={id} />;
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
