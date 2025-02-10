import { cardMove, listReorder } from '@/lib/utils';
import { Card, List, api } from '@/shared/api';
import { createEffect, createEvent, createStore, sample } from 'effector';
import { createGate } from 'effector-react';
import { nanoid } from 'nanoid';

import { ColorsColumnType } from './types';

/**
 * Gate это объект позволяющий мониторить состояние какого-либо компонента.
 * Кроме отслеживания .open и .close событий, он позволяет передавать данные из компонентов в модель effector.
 */
export const PageGate = createGate();

// const TASK_NAMES = [
//   'Set up development environment',
//   // Here 48 more available task names
//   'Add task grouping by category functionality',
// ];

// function randomTaskName() {
//   return TASK_NAMES[Math.floor(Math.random() * TASK_NAMES.length)];
// }

// function createRandomTaskList(amount: number): KanbanCard[] {
//   return Array.from({ length: amount }, () => ({ id: nanoid(), title: randomTaskName() }));
// }

// const INITIAL_BOARD: KanbanBoard = [
//   {
//     id: nanoid(),
//     title: 'To Do',
//     cards: createRandomTaskList(10),
//     color: 'gray',
//   },
//   {
//     id: nanoid(),
//     title: 'In Progress',
//     cards: createRandomTaskList(1),
//     color: 'gray',
//   },
//   {
//     id: nanoid(),
//     title: 'Done',
//     cards: createRandomTaskList(30),
//     color: 'gray',
//   },
// ];

// Events
export type KanbanCardForm = { title: string };

export const cardCreateClicked = createEvent<{ card: KanbanCardForm; columnId: string }>();
export const boardUpdate = createEvent<BoardList[]>();
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

// effects
export type BoardList = List & { cards: Pick<Card, 'id' | 'title'>[] };
export const boardLoadFx = createEffect<void, BoardList[]>(async () => {
  const [lists, cards] = await Promise.all([api.kanban.listLoadFx(), api.kanban.cardsLoadFx()]);

  return lists.map((list) => ({
    ...list,
    cards: cards.filter((card) => card.list_id === list.id),
  }));
});

const boardInitializeFx = createEffect(async () => {
  const lists = await Promise.all([
    api.kanban.listCreateFx({ title: 'To Do' }),
    api.kanban.listCreateFx({ title: 'In Progress' }),
    api.kanban.listCreateFx({ title: 'Done' }),
  ]);
  return lists.filter((list) => list !== null);
});

// Stores
// export const $board = createStore<KanbanBoard>(INITIAL_BOARD);
export const $board = createStore<BoardList[]>([]);

// Logic

sample({
  clock: PageGate.open,
  target: boardLoadFx,
});

$board.on(boardLoadFx.doneData, (_, board) => board);

/**
 * Этот sample стоит читать так:
 * - Когда завершится загрузка доски
 * - Если нет списков на доске
 * - Запустить инициализацию доски
 */

sample({
  clock: boardLoadFx.doneData,
  source: $board,
  filter: (board) => board.length === 0,
  target: boardInitializeFx,
});

$board.on(boardInitializeFx.doneData, (_, board) => board.map((list) => ({ ...list, cards: [] })));

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
