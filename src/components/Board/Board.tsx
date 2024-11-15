import { $board, boardUpdate } from '@/kanban/model';
import { cardMove, cn, listReorder } from '@/lib/utils';
import { DragDropContext, OnDragEndResponder } from '@hello-pangea/dnd';
import { useUnit } from 'effector-react';

import { Container } from '../ui/container';
import { KanbanColumn } from './KanbanColumn';

interface BoardProps {
  className?: string;
}

export const Board = ({ className }: BoardProps) => {
  const [board, setBoard] = useUnit([$board, boardUpdate]);

  const onDragEnd: OnDragEndResponder = ({ source, destination }) => {
    if (!destination) {
      // Dropped outside of a column
      return;
    }

    const sourceId = source.droppableId;
    const destinationId = destination.droppableId;

    const insideTheSameColumn = sourceId === destinationId;

    if (insideTheSameColumn) {
      const column = board.find((column) => column.id === sourceId);
      if (column) {
        const reorderedList = listReorder(column, source.index, destination.index);
        const updatedBoard = board.map((item) => (item.id === sourceId ? reorderedList : item));
        setBoard(updatedBoard);
      }
    } else {
      const updatedBoard = cardMove(
        board,
        sourceId,
        destinationId,
        source.index,
        destination.index,
      );
      setBoard(updatedBoard);
    }
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
