import { FormEvent, useState } from 'react';

import { DragDropContext, Draggable, Droppable, OnDragEndResponder } from '@hello-pangea/dnd';
import { useUnit } from 'effector-react';
import { CirclePlus, EllipsisVertical, Pencil, Trash, X } from 'lucide-react';
import { nanoid } from 'nanoid';

import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Container } from './components/ui/container';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from './components/ui/navigation-menu';
import { Textarea } from './components/ui/textarea';
import styles from './custom-scroll-style/styles.module.css';
import { cn } from './lib/utils';
import { $counter, incrementClicked } from './model';

const Counter = () => {
  const [counter, onIncrement] = useUnit([$counter, incrementClicked]);
  return <Button onClick={onIncrement}>{counter}</Button>;
};

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className={cn('w-full')}>
        <Counter />
        <Board />
      </main>
    </div>
  );
}

interface AppHeaderProps {
  className?: string;
}
const AppHeader = ({ className }: AppHeaderProps) => {
  return (
    <header className={cn('', className)}>
      <Container className="py-6 flex items-center gap-6">
        <div>
          <p className="text-xl font-bold uppercase">My Board</p>
        </div>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink href="/" className={navigationMenuTriggerStyle()}>
                Board
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="/about" className={navigationMenuTriggerStyle()}>
                Members
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="/setting" className={navigationMenuTriggerStyle()}>
                Setting
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </Container>
    </header>
  );
};

// Components

type KanbanBoard = KanbanList[];

type KanbanList = {
  id: string;
  title: string;
  cards: KanbanCard[];
};

type KanbanCard = {
  id: string;
  title: string;
};

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

const Board = ({ className }: BoardProps) => {
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
    <Container className={cn('', className)}>
      <section>
        <header>
          <h1 className="text-3xl font-bold mb-6">Board</h1>
        </header>
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-12 gap-10">
            {board.map((column) => (
              <KanbanColumn
                title="In Progress"
                onUpdate={onColumnUpdate}
                cards={column.cards}
                key={column.id}
                id={column.id}
                createCardElement={
                  <KanbanCreateCard onCreate={(card) => onCreateCard(card, column.id)} />
                }
              />
            ))}
          </div>
        </DragDropContext>
      </section>
    </Container>
  );
};

interface KanbanColumnProps extends KanbanList {
  className?: string;
  children?: React.ReactNode;
  onUpdate: (updateList: KanbanList) => void;
  createCardElement: React.ReactNode;
}

const KanbanColumn = ({
  className,
  title,
  cards,
  id,
  children,
  onUpdate,
  createCardElement,
}: KanbanColumnProps) => {
  // const [hasAddCard, setHasAddCard] = useState(false);

  function onCardEdit(updatedCard: KanbanCard) {
    const updatedCards = cards.map((card) => (card.id === updatedCard.id ? updatedCard : card));
    onUpdate({ id, title, cards: updatedCards });
  }

  function onCardDelete(cardId: string) {
    const updatedCards = cards.filter((card) => card.id !== cardId);
    onUpdate({ id, title, cards: updatedCards });
  }

  return (
    <div className="col-span-4">
      <Droppable key={id} droppableId={id}>
        {(provided) => {
          return (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={cn('p-6 space-y-6 bg-gray-50 border', className, styles.root)}
            >
              <div className="flex justify-between gap-2">
                <h3 className="text-lg font-bold">{title}</h3>
                <div className="flex">
                  <Button size={'icon'} variant={'ghost'}>
                    <EllipsisVertical className="text-gray-400" />
                  </Button>
                  <Button size={'icon'} variant={'ghost'}>
                    <CirclePlus className="text-gray-400" />
                  </Button>
                </div>
              </div>

              <div
                className={cn(
                  'flex flex-col gap-2 max-h-[calc(100vh-420px)] -mx-2 px-2 overflow-y-auto',
                  styles.root,
                )}
              >
                {cards.map(({ id, title }, index) => {
                  return (
                    <KanbanCard
                      key={id}
                      index={index}
                      title={title}
                      id={id}
                      onDelete={onCardDelete}
                      onEdit={onCardEdit}
                    />
                  );
                })}
                {provided.placeholder}
              </div>
              {createCardElement}
            </div>
          );
        }}
      </Droppable>
    </div>
  );
};

interface KanbanCardProps extends KanbanCard {
  className?: string;
  index: number;
  onEdit: (card: KanbanCard) => void;
  onDelete: (cardId: string) => void;
}
const KanbanCard = ({ className, title, index, id, onEdit, onDelete }: KanbanCardProps) => {
  const [editTitle, setEditTitle] = useState(title);
  const [editMode, setEditMode] = useState(false);

  function onReset() {
    setEditTitle(title);
    setEditMode(false);
  }

  function onEditFinished() {
    onEdit({ id, title: editTitle });
    onReset();
  }

  if (editMode) {
    return (
      <div className="flex flex-col gap-2 p-1">
        <Textarea value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
        <div className="flex justify-end gap-2">
          <Button size={'sm'} onClick={onEditFinished}>
            Save
          </Button>
          <Button size={'sm'} variant={'secondary'} onClick={onReset}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Draggable key={id} draggableId={id} index={index}>
      {(provided, snapshot) => {
        return (
          <Card
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={cn('', snapshot.isDragging ? 'border-gray-800 shadow-lg' : null, className)}
          >
            <CardHeader className="p-4">
              <CardTitle className="text-sm">{title}</CardTitle>
              <CardContent className="p-0">
                <div className="flex gap-2 justify-end mt-2">
                  <Button size={'icon'} variant={'ghost'} onClick={() => setEditMode(true)}>
                    <Pencil className="text-gray-400" />
                  </Button>
                  <Button size={'icon'} variant={'ghost'} onClick={() => onDelete(id)}>
                    <Trash className="text-gray-400" />
                  </Button>
                </div>
              </CardContent>
            </CardHeader>
          </Card>
        );
      }}
    </Draggable>
  );
};

interface KanbanCreateCardProps {
  className?: string;
  onCreate: (card: KanbanCard) => void;
}

const KanbanCreateCard = ({ className, onCreate }: KanbanCreateCardProps) => {
  const [title, setTitle] = useState('');

  function onReset() {
    setTitle('');
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onCreate({ id: nanoid(), title });
    onReset();
  }

  return (
    <form className={cn('flex flex-col gap-2', className)} onSubmit={onSubmit}>
      <Textarea
        value={title}
        placeholder="Start making new card here"
        onChange={(e) => setTitle(e.target.value)}
      />
      <div className="flex gap-2">
        <Button type="submit" variant="default" size={'sm'} className="w-full">
          Add card
        </Button>
        <Button type="submit" size={'icon'} variant="ghost">
          <X />
        </Button>
      </div>
    </form>
  );
};

function cardMove(
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

function listReorder(list: KanbanList, startIndex: number, endIndex: number): KanbanList {
  const cards = Array.from(list.cards);
  const [removed] = cards.splice(startIndex, 1);
  cards.splice(endIndex, 0, removed);

  return { ...list, cards };
}

export default App;
