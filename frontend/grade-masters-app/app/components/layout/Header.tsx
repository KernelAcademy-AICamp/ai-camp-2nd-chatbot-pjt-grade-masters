'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Container from '../ui/Container';
// import ThemeToggle from './ThemeToggle'; // Temporarily disabled
import { ROUTES, APP_CONFIG } from '@/app/utils/constants';
import { cn } from '@/app/utils/helpers';

const navigation = [
  { name: '홈', href: ROUTES.home },
  { name: '챗봇', href: ROUTES.chat },
  { name: '오답노트', href: ROUTES.wrongAnswers },
  { name: '학습분석', href: ROUTES.analytics },
  { name: '학습 기록', href: ROUTES.history },
  { name: '소개', href: ROUTES.about },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Container>
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href={ROUTES.home}
            className="flex items-center space-x-2 transition-opacity hover:opacity-80"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
              GM
            </div>
            <span className="text-xl font-bold">{APP_CONFIG.name}</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  pathname === item.href
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Theme Toggle - Temporarily disabled, will be fixed in Sprint 2 */}
          <div className="flex items-center space-x-4">
            {/* <ThemeToggle /> */}
          </div>
        </div>
      </Container>
    </header>
  );
}
