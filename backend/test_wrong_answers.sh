#!/bin/bash

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:9090"
API_PREFIX="/api/v1"

echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║           오답 노트 API 실제 테스트 스크립트                       ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""

# 서버 연결 확인
echo -e "${BLUE}[Step 0] 서버 연결 확인...${NC}"
if curl -s "${BASE_URL}/health" > /dev/null; then
    echo -e "${GREEN}✅ 서버가 실행 중입니다${NC}"
    echo ""
else
    echo -e "${RED}❌ 서버에 연결할 수 없습니다${NC}"
    echo -e "${YELLOW}서버를 먼저 실행하세요: cd chatbot-backend && python3 run.py${NC}"
    exit 1
fi

# 테스트 데이터 준비
echo -e "${BLUE}[참고] 테스트를 위해서는 다음 순서로 진행해야 합니다:${NC}"
echo ""
echo "1️⃣ PDF 업로드 → document_id 획득"
echo "2️⃣ 퀴즈 생성 → quiz_id 획득"
echo "3️⃣ 퀴즈 제출 → result_id 획득"
echo "4️⃣ 오답 노트 조회 ← 이 스크립트가 테스트하는 부분"
echo ""

# 사용자로부터 result_id 입력 받기
echo -e "${YELLOW}======================================================================${NC}"
echo -e "${YELLOW}퀴즈를 먼저 제출하고 받은 result_id를 입력하세요${NC}"
echo -e "${YELLOW}(없으면 Enter를 눌러 Swagger UI 안내를 확인하세요)${NC}"
echo -e "${YELLOW}======================================================================${NC}"
read -p "result_id: " RESULT_ID

if [ -z "$RESULT_ID" ]; then
    echo ""
    echo -e "${BLUE}======================================================================${NC}"
    echo -e "${BLUE}Swagger UI를 통한 수동 테스트 방법:${NC}"
    echo -e "${BLUE}======================================================================${NC}"
    echo ""
    echo -e "1. 브라우저에서 열기: ${GREEN}${BASE_URL}/docs${NC}"
    echo ""
    echo -e "2. ${YELLOW}POST /api/v1/pdf/upload${NC}"
    echo "   - 'Try it out' 클릭"
    echo "   - PDF 파일 선택"
    echo "   - 'Execute' 클릭"
    echo "   - 응답에서 document_id 복사"
    echo ""
    echo -e "3. ${YELLOW}POST /api/v1/quiz/generate${NC}"
    echo "   - 'Try it out' 클릭"
    echo "   - Request body 입력:"
    echo '     {
       "document_id": "<위에서 복사한 ID>",
       "num_items": 4
     }'
    echo "   - 'Execute' 클릭"
    echo "   - 응답에서 quiz_id 복사"
    echo ""
    echo -e "4. ${YELLOW}POST /api/v1/quiz/submit${NC}"
    echo "   - 'Try it out' 클릭"
    echo "   - Request body 입력 (일부러 틀린 답 포함):"
    echo '     {
       "quiz_id": "<위에서 복사한 ID>",
       "answers": [
         {"index": 0, "answer": 0},
         {"index": 1, "answer": "짧은 답변"},
         {"index": 2, "answer": 2},
         {"index": 3, "answer": "부족한 답변"}
       ]
     }'
    echo "   - 'Execute' 클릭"
    echo "   - 응답에서 result_id 복사"
    echo ""
    echo -e "5. ${YELLOW}GET /api/v1/quiz/wrong-answers/{result_id}${NC}"
    echo "   - 'Try it out' 클릭"
    echo "   - result_id 입력"
    echo "   - 'Execute' 클릭"
    echo "   - 오답 노트 확인"
    echo ""
    echo -e "${BLUE}======================================================================${NC}"
    echo ""

    # curl 예시 출력
    echo -e "${BLUE}======================================================================${NC}"
    echo -e "${BLUE}curl 명령어 예시:${NC}"
    echo -e "${BLUE}======================================================================${NC}"
    echo ""
    echo -e "${GREEN}# 오답 노트 조회${NC}"
    echo 'curl -X GET "http://localhost:9090/api/v1/quiz/wrong-answers/<result_id>"'
    echo ""
    echo -e "${GREEN}# 전체 퀴즈 결과 조회 (채점 결과 포함)${NC}"
    echo 'curl -X GET "http://localhost:9090/api/v1/quiz/result/<result_id>"'
    echo ""
    exit 0
fi

# 오답 노트 조회 테스트
echo ""
echo -e "${BLUE}======================================================================${NC}"
echo -e "${BLUE}[Step 1] 오답 노트 조회 테스트${NC}"
echo -e "${BLUE}======================================================================${NC}"
echo ""

echo "요청 URL: ${BASE_URL}${API_PREFIX}/quiz/wrong-answers/${RESULT_ID}"
echo ""

RESPONSE=$(curl -s -w "\n%{http_code}" "${BASE_URL}${API_PREFIX}/quiz/wrong-answers/${RESULT_ID}")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ 성공 (HTTP 200)${NC}"
    echo ""
    echo "응답 데이터:"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
    echo ""

    # 오답 개수 확인
    WRONG_COUNT=$(echo "$BODY" | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data.get('wrong_answers', [])))" 2>/dev/null || echo "0")
    echo -e "${YELLOW}📊 통계:${NC}"
    echo "   - 오답 개수: ${WRONG_COUNT}개"
    echo ""

    if [ "$WRONG_COUNT" = "0" ]; then
        echo -e "${GREEN}🎉 모든 문제를 맞혔습니다!${NC}"
    else
        echo -e "${YELLOW}📝 오답 노트가 생성되었습니다${NC}"
    fi

elif [ "$HTTP_CODE" = "404" ]; then
    echo -e "${RED}❌ 실패 (HTTP 404 - 결과를 찾을 수 없음)${NC}"
    echo ""
    echo "응답 데이터:"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
    echo ""
    echo -e "${YELLOW}💡 해결 방법:${NC}"
    echo "   1. result_id가 올바른지 확인"
    echo "   2. 퀴즈를 제출했는지 확인"
    echo "   3. 데이터베이스에 결과가 저장되었는지 확인"
else
    echo -e "${RED}❌ 실패 (HTTP ${HTTP_CODE})${NC}"
    echo ""
    echo "응답 데이터:"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
fi

echo ""
echo -e "${BLUE}======================================================================${NC}"
echo -e "${BLUE}[Step 2] 전체 퀴즈 결과 조회 (참고)${NC}"
echo -e "${BLUE}======================================================================${NC}"
echo ""

RESULT_RESPONSE=$(curl -s -w "\n%{http_code}" "${BASE_URL}${API_PREFIX}/quiz/result/${RESULT_ID}")
RESULT_HTTP_CODE=$(echo "$RESULT_RESPONSE" | tail -n1)
RESULT_BODY=$(echo "$RESULT_RESPONSE" | sed '$d')

if [ "$RESULT_HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ 퀴즈 결과 조회 성공${NC}"
    echo ""

    ACCURACY=$(echo "$RESULT_BODY" | python3 -c "import sys, json; data=json.load(sys.stdin); print(f\"{data.get('accuracy', 0)*100:.1f}%\")" 2>/dev/null || echo "N/A")
    echo -e "${YELLOW}📊 채점 결과:${NC}"
    echo "   - 정확도: ${ACCURACY}"
    echo ""
else
    echo -e "${YELLOW}⚠️ 전체 결과 조회 실패 (HTTP ${RESULT_HTTP_CODE})${NC}"
fi

echo ""
echo -e "${BLUE}======================================================================${NC}"
echo -e "${BLUE}테스트 완료${NC}"
echo -e "${BLUE}======================================================================${NC}"
echo ""
