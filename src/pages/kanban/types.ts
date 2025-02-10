// export type KanbanBoard = KanbanList[];

export enum ColorsColumn {
  gray = 'gray',
  red = 'red',
  yellow = 'yellow',
  green = 'green',
  blue = 'blue',
  indigo = 'indigo',
  purple = 'purple',
  pink = 'pink',
}

export type ColorsColumnType = keyof typeof ColorsColumn;

// export type KanbanList = {
//   id: string;
//   title: string;
//   cards: KanbanCard[];
//   color: ColorsColumnType;
// };

// export type KanbanCard = {
//   id: string;
//   title: string;
// };
