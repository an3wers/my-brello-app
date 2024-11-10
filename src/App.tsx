import { Container } from './components/ui/container';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from './components/ui/navigation-menu';
import { cn } from './lib/utils';

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <Board />
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
          <p className="text-xl font-bold uppercase">Brello</p>
        </div>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <a href="/">
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Board
                </NavigationMenuLink>
              </a>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <a href="/about">
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  About
                </NavigationMenuLink>
              </a>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </Container>
    </header>
  );
};

interface BoardProps {
  className?: string;
}

const Board = ({ className }: BoardProps) => {
  return (
    <div className={cn('w-full grow', className)}>
      <Container>
        <div className=" grid grid-cols-12 gap-6">
          <div className="col-span-4">1</div>
          <div className="col-span-4">2</div>
          <div className="col-span-4">3</div>
        </div>
      </Container>
    </div>
  );
};

interface KanbanColumnProps {
  className?: string;
}
const KanbanColumn = ({ className }: KanbanColumnProps) => {};

interface KanbanCardProps {
  className?: string;
}
const KanbanCard = ({ className }: KanbanCardProps) => {};

export default App;
