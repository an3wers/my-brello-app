import { cardMove, listReorder } from '@/lib/utils';
import { createEvent, createStore } from 'effector';
import { nanoid } from 'nanoid';

import { ColorsColumnType, KanbanBoard, KanbanCard } from './types';

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
    color: 'gray',
  },
  {
    id: nanoid(),
    title: 'In Progress',
    cards: createRandomTaskList(1),
    color: 'gray',
  },
  {
    id: nanoid(),
    title: 'Done',
    cards: createRandomTaskList(30),
    color: 'gray',
  },
];

export type KanbanCardForm = Pick<KanbanCard, 'title'>;
// Events
export const cardCreateClicked = createEvent<{ card: KanbanCardForm; columnId: string }>();
export const boardUpdate = createEvent<KanbanBoard>();
export const boardUpdatedColor = createEvent<{ columnId: string; color: ColorsColumnType }>();
export const cardEditClicked = createEvent<{
  columnId: string;
  cardId: string;
  card: KanbanCardForm;
}>();
export const cardDeleteClicked = createEvent<{ columnId: string; cardId: string }>();
export const cardMoved = createEvent<{
  fromColumnId: string;
  toColumnId: string;
  fromIndex: number;
  toIndex: number;
}>();

// Stores
export const $board = createStore<KanbanBoard>(INITIAL_BOARD);

// Logic
$board.on(boardUpdate, (_, board) => board);

// board prev state
// { card, columnId } - payload
$board.on(cardCreateClicked, (board, { card, columnId }) => {
  const updateBoard = board.map((column) => {
    if (column.id === columnId) {
      const newCard = { ...card, id: nanoid() };

      return { ...column, cards: [...column.cards, newCard] };
    }
    return column;
  });

  return updateBoard;
});

$board.on(cardEditClicked, (board, { card, cardId, columnId }) => {
  const updateBoard = board.map((column) => {
    if (column.id === columnId) {
      const updatedCards = column.cards.map((c) => (c.id === cardId ? { ...c, ...card } : c));
      return { ...column, cards: updatedCards };
    }
    return column;
  });

  return updateBoard;
});

$board.on(cardDeleteClicked, (board, { cardId, columnId }) => {
  const updateBoard = board.map((column) => {
    if (column.id === columnId) {
      const updatedCards = column.cards.filter((c) => c.id !== cardId);
      return { ...column, cards: updatedCards };
    }
    return column;
  });

  return updateBoard;
});

$board.on(boardUpdatedColor, (board, { columnId, color }) => {
  const updatedBoard = board.map((column) => {
    if (column.id === columnId) {
      return { ...column, color };
    }
    return column;
  });
  return updatedBoard;
});

const cardMovedInTheColumn = cardMoved.filter({
  fn: ({ fromColumnId, toColumnId }) => fromColumnId === toColumnId,
});
const cardMovedToAnotherColumn = cardMoved.filter({
  fn: ({ fromColumnId, toColumnId }) => fromColumnId !== toColumnId,
});

$board.on(cardMovedInTheColumn, (board, { fromColumnId, fromIndex, toIndex }) => {
  const updatedBoard = board.map((column) => {
    if (column.id === fromColumnId) {
      const updatedList = listReorder(column, fromIndex, toIndex);
      return updatedList;
    }

    return column;
  });

  return updatedBoard;
});

$board.on(cardMovedToAnotherColumn, (board, { fromColumnId, toColumnId, fromIndex, toIndex }) => {
  return cardMove(board, fromColumnId, toColumnId, fromIndex, toIndex);
});
