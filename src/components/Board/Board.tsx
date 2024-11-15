import { $board, cardMoved } from '@/kanban/model';
import { cn } from '@/lib/utils';
import { DragDropContext, OnDragEndResponder } from '@hello-pangea/dnd';
import { useUnit } from 'effector-react';

import { Container } from '../ui/container';
import { KanbanColumn } from './KanbanColumn';

interface BoardProps {
  className?: string;
}

export const Board = ({ className }: BoardProps) => {
  const [board, onCardMoved] = useUnit([$board, cardMoved]);

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
                title="In Progress"
                cards={column.cards}
                key={column.id}
                id={column.id}
              />
            ))}
          </div>
        </DragDropContext>
      </Container>
    </section>
  );
};
