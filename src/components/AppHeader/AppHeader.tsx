import { cn } from '@/lib/utils';

import { Container } from '../ui/container';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '../ui/navigation-menu';

interface AppHeaderProps {
  className?: string;
}
export const AppHeader = ({ className }: AppHeaderProps) => {
  return (
    <header className={cn('', className)}>
      <Container className="py-6 flex items-center gap-6">
        <div>
          <p className="text-xl font-medium uppercase">My Board</p>
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
