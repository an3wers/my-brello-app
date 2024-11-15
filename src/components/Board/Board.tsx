import { $board, boardUpdate, cardCreateClicked } from '@/kanban/model';
import { KanbanList } from '@/kanban/types';
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
  const [onCreateCard] = useUnit([cardCreateClicked]);

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

  function onColumnUpdate(updatedList: KanbanList) {
    const updatedBoard = board.map((column) =>
      column.id === updatedList.id ? updatedList : column,
    );
    setBoard(updatedBoard);
  }

  return (
    <section className={cn('', className)}>
      <Container>
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex flex-row gap-6 overflow-x-auto pb-2">
            {board.map((column) => (
              <KanbanColumn
                title="In Progress"
                onUpdate={onColumnUpdate}
                cards={column.cards}
                key={column.id}
                id={column.id}
                onCreate={(card) => onCreateCard({ card, columnId: column.id })}
              />
            ))}
          </div>
        </DragDropContext>
      </Container>
    </section>
  );
};
