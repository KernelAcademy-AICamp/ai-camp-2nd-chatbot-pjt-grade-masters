import Container from '../components/ui/Container';
import { APP_CONFIG } from '../utils/constants';

export default function AboutPage() {
  return (
    <Container className="py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">{APP_CONFIG.name} 소개</h1>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p className="text-lg text-muted-foreground mb-8">
            {APP_CONFIG.description}
          </p>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">우리의 미션</h2>
            <p>
              학점마스터는 대학생들의 효율적인 학습을 돕기 위해 탄생했습니다.
              AI 기술을 활용하여 방대한 학습 자료를 빠르게 이해하고,
              실전과 같은 문제 풀이 연습을 통해 시험 준비의 효율을 극대화합니다.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">주요 기능</h2>
            <ul className="space-y-4">
              <li>
                <strong>PDF 요약</strong> - 강의 자료를 업로드하면 핵심 내용을 자동으로 요약
              </li>
              <li>
                <strong>문제 생성</strong> - 학습 내용을 바탕으로 다양한 난이도의 예상 문제 자동 생성
              </li>
              <li>
                <strong>자동 채점</strong> - AI가 답안을 채점하고 상세한 피드백 제공
              </li>
              <li>
                <strong>오답노트</strong> - 틀린 문제를 자동으로 정리하고 취약점 분석
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">기술 스택</h2>
            <p>
              최신 웹 기술과 AI 모델을 활용하여 빠르고 정확한 서비스를 제공합니다.
            </p>
            <ul className="mt-4">
              <li>Frontend: Next.js, React, Tailwind CSS</li>
              <li>Backend: FastAPI, Python</li>
              <li>AI: OpenAI GPT-4o, Anthropic Claude 3</li>
            </ul>
          </section>
        </div>
      </div>
    </Container>
  );
}
