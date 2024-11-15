import { createEvent, createStore } from 'effector';
import { nanoid } from 'nanoid';

import { KanbanBoard, KanbanCard } from './types';

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

export type KanbanNewCard = Pick<KanbanCard, 'title'>;
// Events
export const cardCreateClicked = createEvent<{ card: KanbanNewCard; columnId: string }>();
export const boardUpdate = createEvent<KanbanBoard>();

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
