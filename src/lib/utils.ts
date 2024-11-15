import { KanbanBoard, KanbanList } from '@/types/types';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function cardMove(
  board: KanbanBoard,
  sourceColumnId: string,
  destinationColumnId: string,
  fromIndex: number,
  toIndex: number,
): KanbanBoard {
  const sourceColumnIndex = board.findIndex((column) => column.id === sourceColumnId);
  const destinationColumnIndex = board.findIndex((column) => column.id === destinationColumnId);

  const sourceColumn = board[sourceColumnIndex];
  const destinationColumn = board[destinationColumnIndex];

  const card = sourceColumn.cards[fromIndex];

  const updatedSourceColumn = {
    ...sourceColumn,
    cards: sourceColumn.cards.filter((_, index) => index !== fromIndex),
  };

  const updatedDestinationColumn = {
    ...destinationColumn,
    cards: [
      ...destinationColumn.cards.slice(0, toIndex),
      { ...card },
      ...destinationColumn.cards.slice(toIndex),
    ],
  };

  return board.map((column) => {
    if (column.id === sourceColumnId) {
      return updatedSourceColumn;
    }

    if (column.id === destinationColumnId) {
      return updatedDestinationColumn;
    }

    return column;
  });
}

export function listReorder(list: KanbanList, startIndex: number, endIndex: number): KanbanList {
  const cards = Array.from(list.cards);
  const [removed] = cards.splice(startIndex, 1);
  cards.splice(endIndex, 0, removed);

  return { ...list, cards };
}
