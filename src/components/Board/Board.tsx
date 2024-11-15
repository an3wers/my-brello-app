import { useState } from 'react';

import { cardMove, cn, listReorder } from '@/lib/utils';
import { KanbanBoard, KanbanCard, KanbanList } from '@/types/types';
import { DragDropContext, OnDragEndResponder } from '@hello-pangea/dnd';
import { nanoid } from 'nanoid';

import { Container } from '../ui/container';
import { KanbanColumn } from './KanbanColumn';

const TASK_NAMES = [
  'Set up development environment',
  // Here 48 more available task names
  'Add task grouping by category functionality',
];

function randomTaskName() {
  return TASK_NAMES[Math.floor(Math.random() * TASK_NAMES.length)];
}

function createRandomTaskList(amount: number): KanbanCard[] {
  return Array.from({ length: amount }, () => ({ id: nanoid(), title: randomTaskName() }));
}

const INITIAL_BOARD: KanbanBoard = [
  {
    id: nanoid(),
    title: 'To Do',
    cards: createRandomTaskList(10),
    //  [
    //   { id: nanoid(), title: 'Setup the Workplace' },
    //   { id: nanoid(), title: 'Review opened issues' },
    // ],
  },
  {
    id: nanoid(),
    title: 'In Progress',
    cards: createRandomTaskList(1),
    //  [{ id: nanoid(), title: 'Implement Kanban feature' }],
  },
  {
    id: nanoid(),
    title: 'Done',
    cards: createRandomTaskList(30),
    // [{ id: nanoid(), title: 'Initialized project' }],
  },
];

interface BoardProps {
  className?: string;
}

export const Board = ({ className }: BoardProps) => {
  const [board, setBoard] = useState(INITIAL_BOARD);

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

  function onCreateCard(card: KanbanCard, columnId: string) {
    const updatedBoard = board.map((column) => {
      if (column.id === columnId) {
        return { ...column, cards: [...column.cards, card] };
      }

      return column;
    });

    setBoard(updatedBoard);
  }

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
                onCreate={onCreateCard}
              />
            ))}
          </div>
        </DragDropContext>
      </Container>
    </section>
  );
};

/*
createCardElement={
                  <KanbanCreateCard onCreate={(card) => onCreateCard(card, column.id)} />
                }
*/
