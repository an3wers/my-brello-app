import { Button } from './components/ui/button';
import { Card, CardHeader, CardTitle } from './components/ui/card';
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
      <main className={cn('w-full')}>
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
          <p className="text-xl font-bold uppercase">Brello</p>
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

interface BoardProps {
  className?: string;
}

const Board = ({ className }: BoardProps) => {
  return (
    <Container className={cn('', className)}>
      <section>
        <header>
          <h1 className="text-3xl font-bold mb-6">Board</h1>
        </header>
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-4">
            <KanbanColumn
              title="To Do"
              color="blue"
              issues={[
                { id: 'a8d2c2b1-3d4b-4f19-b915-4530d8f693d4', text: 'Set up project repository' },
                {
                  id: 'b7f9285d-c78a-4f25-9b60-7edbfcf06335',
                  text: 'Research best practices for Kanban board implementation',
                },
                {
                  id: 'd467f865-d378-4a6f-bd4a-611c5d1de939',
                  text: 'Create initial components for UI',
                },
                { id: 'ae44a1cb-cb8b-4e5a-bcc8-4888c1822146', text: 'Design logo and branding' },
                {
                  id: '92f84ba6-f354-4d1b-8e23-dc75be0ffba3',
                  text: 'Write unit tests for core features',
                },
                {
                  id: '98ff4789-e9ad-4d88-8259-24972c6f132e',
                  text: 'Prepare project documentation',
                },
                {
                  id: '32f8b8ea-95de-4d1e-8ae6-517877db8f7b',
                  text: 'Plan webinar content for week 1',
                },
              ]}
            />
          </div>
          <div className="col-span-4">
            <KanbanColumn
              title="In Progress"
              color="purple"
              issues={[
                { id: 'c3d3a66f-6eb5-46ec-a07e-c8436886272f', text: 'Develop Board component' },
              ]}
            />
          </div>
          <div className="col-span-4">
            <KanbanColumn
              title="Done"
              color="teal"
              issues={[
                {
                  id: '843a6832-f9f2-43b1-bd6f-ef27b87f1b64',
                  text: 'Install project dependencies',
                },
                { id: 'fdd854a2-b31d-4ed5-b18d-2c44c0cfb444', text: 'Set up ESLint and Prettier' },
                {
                  id: 'f2deaba9-7e52-442a-b764-219849af07e8',
                  text: 'Configure Webpack for project',
                },
                {
                  id: 'b90b7d41-1ba2-4b44-b7d9-9a2a8b237d4b',
                  text: 'Create responsive layout for Kanban board',
                },
                {
                  id: 'e823d3ac-bdfd-4410-b49f-41719734b7b8',
                  text: 'Implement user authentication',
                },
                { id: '620f509d-d192-45d1-9f43-2ed1c49f0c6f', text: 'Deploy app on Vercel' },
                { id: 'a1dbf9b4-2523-45b5-b8a3-1af00c7fbe6e', text: 'Set up CI/CD pipeline' },
                {
                  id: '7761eccc-765f-49a7-8474-46b0be8058d2',
                  text: 'Add basic styling for header',
                },
                {
                  id: 'b0b2c8e3-2299-4ef9-b7cb-88f28fc2f72b',
                  text: 'Integrate Telegram group for support',
                },
                {
                  id: 'd4d6adbc-7d4e-4d1d-b9b9-8be91b776cb2',
                  text: 'Fix bug with form submission',
                },
              ]}
            />
          </div>
        </div>
      </section>
    </Container>
  );
};

interface Issue {
  id: string;
  text: string;
}

interface KanbanColumnProps {
  className?: string;
  title: string;
  color: string;
  issues: Issue[];
}

const mapCoolors: Record<string, string> = {
  blue: 'bg-blue-100',
  purple: 'bg-purple-100',
  teal: 'bg-teal-100',
};

const KanbanColumn = ({ className, color, title, issues }: KanbanColumnProps) => {
  return (
    <div className={cn('p-6 rounded space-y-6 h-[94%]', className, mapCoolors[color])}>
      <h3 className="text-lg font-bold">{title}</h3>
      <div className="flex flex-col gap-3 max-h-[84%] overflow-y-auto">
        {issues.map((issue) => {
          return <KanbanCard key={issue.id} text={issue.text} />;
        })}
      </div>
      <div className="flex flex-col">
        <Button variant="ghost">Add card</Button>
      </div>
    </div>
  );
};

interface KanbanCardProps {
  className?: string;
  text: string;
}
const KanbanCard = ({ className, text }: KanbanCardProps) => {
  return (
    <Card className={cn('', className)}>
      <CardHeader className="p-4">
        <CardTitle className="text-sm">{text}</CardTitle>
      </CardHeader>
    </Card>
  );
};

export default App;
