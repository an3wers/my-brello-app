import { cn } from '@/lib/utils';
import { $board, PageGate, cardMoved } from '@/pages/kanban/model';
import { DragDropContext, OnDragEndResponder } from '@hello-pangea/dnd';
import { useGate, useUnit } from 'effector-react';

import { Container } from '../../components/ui/container';
import { KanbanColumn } from './ui/KanbanColumn';

interface BoardProps {
  className?: string;
}

export const Board = ({ className }: BoardProps) => {
  const [board, onCardMoved] = useUnit([$board, cardMoved]);

  /**
   * Gate это объект позволяющий мониторить состояние какого-либо компонента.
   * Кроме отслеживания .open и .close событий, он позволяет передавать данные из компонентов в модель effector.
   */
  useGate(PageGate);

  const onDragEnd: OnDragEndResponder = ({ source, destination, draggableId }) => {
    if (!destination) {
      // Dropped outside of a column
      return;
    }

    const cardId = draggableId;
    const fromListId = source.droppableId;
    const toListId = destination.droppableId;
    const fromIndex = source.index;
    const toIndex = destination.index;

    onCardMoved({ cardId, fromListId, toListId, fromIndex, toIndex });
  };

  return (
    <section className={cn('', className)}>
      <Container>
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex flex-row gap-6 overflow-x-auto pb-2">
            {board.map((column) => (
              <KanbanColumn
                id={column.id}
                title={column.title}
                cards={column.cards}
                key={column.id}
                color={column.color}
                sort_order={column.sort_order}
              />
            ))}
          </div>
        </DragDropContext>
      </Container>
    </section>
  );
};
