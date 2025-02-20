import { api } from '@/shared/api';
import { CardUpdate } from '@/shared/api/rest/kanban';
import { createEffect, createEvent, createStore, sample } from 'effector';
import { createGate } from 'effector-react';
import { nanoid } from 'nanoid';

export type KanbanList = {
  id: string;
  title: string;
  sort_order: number;
  color: string;
  cards: KanbanCard[];
};

export type KanbanCard = {
  id: string;
  title: string;
  sort_order: number;
};

export type CardId = KanbanCard['id'];

export type KanbanCardForm = Pick<KanbanCard, 'title'>;

export type KanbanBoard = KanbanList[];

export const PageGate = createGate();

export const cardCreateClicked = createEvent<{ card: KanbanCardForm; listId: string }>();
export const cardEditClicked = createEvent<{
  listId: string;
  cardId: string;
  card: KanbanCardForm;
}>();
export const cardDeleteClicked = createEvent<{ listId: string; cardId: string }>();
export const cardMoved = createEvent<{
  fromListId: string;
  toListId: string;
  fromIndex: number;
  toIndex: number;
  cardId: string;
}>();

export const $board = createStore<KanbanBoard>([]);
export const $cardsPendingMap = createStore<Record<CardId, boolean>>({});

/** Load lists and cards from db */

const boardLoadFx = createEffect(async () => {
  const [lists, cards] = await Promise.all([api.kanban.listsLoadFx(), api.kanban.cardsLoadFx()]);

  return lists.map((list) => ({
    ...list,
    cards: cards.filter((card) => card.list_id === list.id),
  }));
});

sample({
  clock: PageGate.open,
  target: boardLoadFx,
});

$board.on(boardLoadFx.doneData, (_, board) => {
  return board.map((list) => {
    return {
      id: list.id,
      title: list.title,
      sort_order: list.sort_order,
      color: list.color,
      cards: list.cards.map((card) => ({
        id: card.id,
        title: card.title,
        sort_order: card.sort_order,
      })),
    };
  });
});

/** Create initial lists if there are none */

const boardInitializeFx = createEffect(async () => {
  const lists = await Promise.all([
    api.kanban.listsCreateFx({ title: 'To Do', sort_order: 1000 }),
    api.kanban.listsCreateFx({ title: 'In Progress', sort_order: 2000 }),
    api.kanban.listsCreateFx({ title: 'Done', sort_order: 3000 }),
  ]);
  return lists.filter((list) => list !== null);
});

sample({
  clock: boardLoadFx.doneData,
  source: $board,
  filter: (board) => board.length === 0,
  target: boardInitializeFx,
});

$board.on(boardInitializeFx.doneData, (_, board) =>
  board.map((list) => ({
    id: list.id,
    title: list.title,
    sort_order: list.sort_order,
    color: list.color,
    cards: [],
  })),
);

/** Create new card */

const cardCreated = createEvent<{ card: KanbanCard; listId: string }>();

sample({
  clock: cardCreateClicked,
  source: $board,
  fn: (board, { card, listId }) => {
    const targetList = board.find((list) => list.id === listId);

    let sortOrder = 10_000;
    if (targetList && targetList.cards.length > 0) {
      const maxSortOrder = Math.max(...targetList.cards.map((card) => card.sort_order));
      sortOrder = maxSortOrder + 1000;
    }

    return { card: { ...card, id: nanoid(), sort_order: sortOrder }, listId };
  },
  target: cardCreated,
});

$board.on(cardCreated, (board, { card, listId }) => {
  const updatedBoard = board.map((list) => {
    if (list.id === listId) {
      return { ...list, cards: [...list.cards, card] };
    }

    return list;
  });
  return updatedBoard;
});

const cardSaveFx = createEffect(
  async ({ card: { id: _, ...card }, listId }: { card: KanbanCard; listId: string }) => {
    return await api.kanban.cardsCreateFx({ ...card, list_id: listId });
  },
);

sample({
  clock: cardCreated,
  target: cardSaveFx,
});

$cardsPendingMap.on(cardSaveFx, (pendingMap, { card }) => ({
  ...pendingMap,
  [card.id]: true,
}));

const cardSavedSuccess = createEvent<{ originalId: string; card: KanbanCard; listId: string }>();
const cardSavedError = createEvent<{ originalId: string; listId: string }>();

sample({
  clock: cardSaveFx.done,
  filter: ({ result }) => result !== null,
  fn: ({ params, result: card }) => ({
    originalId: params.card.id,
    card: {
      id: card!.id,
      title: card!.title,
      sort_order: card!.sort_order,
    },
    listId: params.listId,
  }),
  target: cardSavedSuccess,
});

sample({
  clock: [cardSaveFx.fail, cardSaveFx.done.filter({ fn: ({ result }) => result === null })],
  fn: ({ params }) => ({ originalId: params.card.id, listId: params.listId }),
  target: cardSavedError,
});

$cardsPendingMap.on(cardSaveFx.finally, (pendingMap, { params: { card } }) => {
  const updatedPendingMap = { ...pendingMap };
  delete updatedPendingMap[card.id];
  return updatedPendingMap;
});

$board.on(cardSavedSuccess, (board, { originalId, card, listId }) => {
  return board.map((list) => {
    if (list.id === listId) {
      return {
        ...list,
        cards: list.cards.map((found) => (found.id === originalId ? card : found)),
      };
    }

    return list;
  });
});

$board.on(cardSavedError, (board, { originalId, listId }) => {
  return board.map((list) => {
    if (list.id === listId) {
      return {
        ...list,
        cards: list.cards.filter((found) => found.id !== originalId),
      };
    }

    return list;
  });
});

/** Delete card */
const cardDeleteFx = createEffect(async ({ cardId }: { cardId: string }) => {
  await api.kanban.cardsDeleteFx({ cardId });
});

sample({
  clock: cardDeleteClicked,
  target: cardDeleteFx,
});

$cardsPendingMap.on(cardDeleteFx, (cardsPendingMap, { cardId }) => ({
  ...cardsPendingMap,
  [cardId]: true,
}));

$board.on(cardDeleteFx.done, (board, { params: { cardId } }) => {
  const updatedBoard = board.map((list) => {
    const updatedCards = list.cards.filter((card) => card.id !== cardId);
    if (updatedCards.length === list.cards.length) {
      return list;
    }

    return {
      ...list,
      cards: updatedCards,
    };
  });

  return updatedBoard;
});

$cardsPendingMap.on(cardDeleteFx.finally, (pendingMap, { params: { cardId } }) => {
  const updatedPendingMap = { ...pendingMap };
  delete updatedPendingMap[cardId];
  return updatedPendingMap;
});

/** Edit card */

const cardEditFx = createEffect(
  async ({ cardId, card }: { cardId: string; card: Partial<CardUpdate> }) => {
    return await api.kanban.cardsUpdateFx({ ...card, id: cardId });
  },
);

sample({
  clock: cardEditClicked,
  target: cardEditFx,
});

$cardsPendingMap.on(cardEditFx, (pendingMap, { cardId }) => ({
  ...pendingMap,
  [cardId]: true,
}));

$board.on(cardEditFx.done, (board, { params: { cardId }, result: card }) => {
  if (!card) return board;

  const updatedBoard = board.map((list) => {
    if (list.id === card.list_id) {
      const updatedCards = list.cards.map((existingCard) => {
        if (existingCard.id === cardId) {
          return { ...existingCard, ...card };
        }

        return existingCard;
      });

      return { ...list, cards: updatedCards };
    }

    return list;
  });

  return updatedBoard;
});

$cardsPendingMap.on(cardEditFx.finally, (pendingMap, { params: { cardId } }) => {
  const updatedPendingMap = { ...pendingMap };
  delete updatedPendingMap[cardId];
  return updatedPendingMap;
});

/** Card moving between lists and reordering in the same list */

const cardMovedWithOrder = createEvent<{
  cardId: string;
  toListId: string;
  toIndex: number;
  fromListId: string;
  fromIndex: number;
  sortOrder: number;
}>();

sample({
  clock: cardMoved,
  source: $board,
  fn: (board, { cardId, toListId, toIndex, ...rest }) => {
    const targetList = board.find((list) => list.id === toListId);
    const sortOrder = orderBetween(targetList?.cards[toIndex - 1], targetList?.cards[toIndex]);

    return { cardId, toListId, toIndex, sortOrder, ...rest };
  },
  target: cardMovedWithOrder,
});

sample({
  clock: cardMovedWithOrder,
  fn: ({ cardId, toListId, sortOrder }) => ({
    cardId,
    card: { list_id: toListId, sort_order: sortOrder },
  }),
  target: cardEditFx,
});

const cardMovedInTheList = cardMovedWithOrder.filter({
  fn: ({ fromListId, toListId }) => fromListId === toListId,
});
const cardMovedToAnotherList = cardMovedWithOrder.filter({
  fn: ({ fromListId, toListId }) => fromListId !== toListId,
});

/** Change status of the card, move to another list */

$board.on(cardMovedToAnotherList, (board, { fromListId, toListId, fromIndex, toIndex }) => {
  return cardMove(board, fromListId, toListId, fromIndex, toIndex);
});

/** Card reorder */

$board.on(cardMovedInTheList, (board, { fromListId, fromIndex, toIndex }) => {
  return board.map((list) => {
    if (list.id === fromListId) return listReorder(list, fromIndex, toIndex);

    return list;
  });
});

function cardMove(
  board: KanbanBoard,
  sourceListId: string,
  destinationListId: string,
  fromIndex: number,
  toIndex: number,
): KanbanBoard {
  const sourceListIndex = board.findIndex((list) => list.id === sourceListId);
  const destinationListIndex = board.findIndex((list) => list.id === destinationListId);

  const sourceList = board[sourceListIndex];
  const destinationList = board[destinationListIndex];

  const card = sourceList.cards[fromIndex];

  const updatedSourceList = {
    ...sourceList,
    cards: sourceList.cards.filter((_, index) => index !== fromIndex),
  };
  const updatedDestinationList = {
    ...destinationList,
    cards: [
      ...destinationList.cards.slice(0, toIndex),
      { ...card },
      ...destinationList.cards.slice(toIndex),
    ],
  };

  return board.map((list) => {
    if (list.id === sourceListId) {
      return updatedSourceList;
    }

    if (list.id === destinationListId) {
      return updatedDestinationList;
    }

    return list;
  });
}

function orderBetween(previous?: { sort_order: number }, next?: { sort_order: number }): number {
  if (previous && next) return (previous.sort_order + next.sort_order) / 2;
  if (next) return next.sort_order - 1000;
  if (previous) return previous.sort_order + 1000;
  return 10_000;
}

function listReorder(list: KanbanList, startIndex: number, endIndex: number): KanbanList {
  const cards = Array.from(list.cards);
  const [removed] = cards.splice(startIndex, 1);
  cards.splice(endIndex, 0, removed);

  return { ...list, cards };
}
