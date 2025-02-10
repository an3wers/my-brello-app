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

  const onDragEnd: OnDragEndResponder = ({ source, destination }) => {
    if (!destination) {
      // Dropped outside of a column
      return;
    }

    const fromColumnId = source.droppableId;
    const toColumnId = destination.droppableId;
    const fromIndex = source.index;
    const toIndex = destination.index;

    onCardMoved({ fromColumnId, toColumnId, fromIndex, toIndex });
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
              />
            ))}
          </div>
        </DragDropContext>
      </Container>
    </section>
  );
};
