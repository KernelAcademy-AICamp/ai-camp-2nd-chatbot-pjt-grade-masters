import Link from 'next/link';
import Container from '../ui/Container';
import { APP_CONFIG, ROUTES } from '@/app/utils/constants';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <Container>
        <div className="py-8 md:py-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            {/* About */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                  GM
                </div>
                <span className="text-xl font-bold">{APP_CONFIG.name}</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-md">
                {APP_CONFIG.description}
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="mb-4 text-sm font-semibold">빠른 링크</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    href={ROUTES.chat}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    챗봇 시작하기
                  </Link>
                </li>
                <li>
                  <Link
                    href={ROUTES.history}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    학습 기록
                  </Link>
                </li>
                <li>
                  <Link
                    href={ROUTES.about}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    서비스 소개
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="mb-4 text-sm font-semibold">지원</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    자주 묻는 질문
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    사용 가이드
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    문의하기
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="mt-8 border-t pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
            <p>© {currentYear} {APP_CONFIG.name}. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="hover:text-foreground transition-colors">
                개인정보처리방침
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                이용약관
              </a>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
