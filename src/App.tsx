import { AppHeader } from '@/components/AppHeader/AppHeader';

import { AppTitle } from './components/AppTitle/AppTitle';
import { Board } from './components/Board/Board';
import { Container } from './components/ui/container';
import { cn } from './lib/utils';

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className={cn('w-full')}>
        <Container>
          <AppTitle title="Kanban Board" />
        </Container>
        <Board />
      </main>
    </div>
  );
}

export default App;
