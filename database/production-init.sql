-- 프로덕션 환경 초기화 스크립트
-- 이 파일은 실제 서비스를 위한 최소한의 초기 데이터만 포함합니다.

-- 관리자 사용자 생성 (Supabase Auth에서 수동으로 생성 후 연결)
-- 주의: 실제 관리자 계정은 Supabase Auth Dashboard에서 생성해야 합니다.

-- 관리자 사용자 정보 (Auth 테이블과 연결)
INSERT INTO public.users (id, email, role, is_active, created_at, updated_at) 
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@obdoc.co.kr',
  'admin',
  true,
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- 기본 시스템 설정
INSERT INTO public.system_settings (key, value, description, created_at, updated_at)
VALUES 
  ('site_name', 'OBDOC', '사이트 이름', now(), now()),
  ('site_description', '비만 전문 의료진 매칭 플랫폼', '사이트 설명', now(), now()),
  ('admin_email', 'admin@obdoc.co.kr', '관리자 이메일', now(), now()),
  ('maintenance_mode', 'false', '유지보수 모드', now(), now()),
  ('registration_enabled', 'true', '회원가입 허용', now(), now()),
  ('email_notifications', 'true', '이메일 알림', now(), now()),
  ('max_file_size', '5', '최대 파일 크기 (MB)', now(), now()),
  ('session_timeout', '30', '세션 타임아웃 (분)', now(), now()),
  ('password_min_length', '6', '최소 비밀번호 길이', now(), now())
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = now();

-- 기본 구독 플랜 설정 (실제 가격 반영)
INSERT INTO public.subscription_plans (id, name, duration_months, price, features, is_active, created_at, updated_at)
VALUES 
  ('1month', '1개월 플랜', 1, 199000, '{"basic_features": true, "patient_limit": 50, "description": "단기간 체험용으로 적합한 플랜"}', true, now(), now()),
  ('6months', '6개월 플랜', 6, 1015000, '{"basic_features": true, "patient_limit": 200, "discount": "15%", "popular": true, "original_price": 1194000, "description": "가장 인기 있는 플랜으로 15% 할인 혜택"}', true, now(), now()),
  ('12months', '12개월 플랜', 12, 1791000, '{"basic_features": true, "patient_limit": 500, "discount": "25%", "original_price": 2388000, "premium_features": true, "description": "최대 할인 혜택과 모든 프리미엄 기능 포함"}', true, now(), now())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  features = EXCLUDED.features,
  updated_at = now();

-- 기본 병원 유형 설정
INSERT INTO public.hospital_types (id, name, description, is_active, created_at, updated_at)
VALUES 
  ('general', '종합병원', '종합병원 및 대학병원', true, now(), now()),
  ('clinic', '의원', '개인 의원 및 클리닉', true, now(), now()),
  ('oriental', '한의원', '한의원 및 한방병원', true, now(), now()),
  ('obesity', '비만클리닉', '비만 전문 클리닉', true, now(), now()),
  ('family', '가정의학과', '가정의학과 전문의', true, now(), now()),
  ('internal', '내과', '내과 전문의', true, now(), now()),
  ('other', '기타', '기타 의료기관', true, now(), now())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = now();

-- 커뮤니티 카테고리 설정
INSERT INTO public.community_categories (id, name, description, is_active, sort_order, created_at, updated_at)
VALUES 
  ('success', '성공후기', '다이어트 성공 경험 공유', true, 1, now(), now()),
  ('tips', '다이어트 팁', '유용한 다이어트 정보와 팁', true, 2, now(), now()),
  ('exercise', '운동', '운동 관련 정보와 경험', true, 3, now(), now()),
  ('diet', '식단', '식단 관리 및 레시피', true, 4, now(), now()),
  ('motivation', '동기부여', '서로 격려하고 응원하기', true, 5, now(), now()),
  ('qna', '질문답변', '궁금한 점 질문하고 답변하기', true, 6, now(), now()),
  ('free', '자유게시판', '자유로운 소통 공간', true, 7, now(), now())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = now();

-- 기본 태그 설정
INSERT INTO public.tags (name, category, usage_count, is_active, created_at, updated_at)
VALUES 
  ('다이어트', 'general', 0, true, now(), now()),
  ('운동', 'exercise', 0, true, now(), now()),
  ('식단', 'diet', 0, true, now(), now()),
  ('성공후기', 'success', 0, true, now(), now()),
  ('초보자', 'general', 0, true, now(), now()),
  ('홈트레이닝', 'exercise', 0, true, now(), now()),
  ('단백질', 'diet', 0, true, now(), now()),
  ('유산소', 'exercise', 0, true, now(), now()),
  ('근력운동', 'exercise', 0, true, now(), now()),
  ('칼로리', 'diet', 0, true, now(), now())
ON CONFLICT (name) DO UPDATE SET
  category = EXCLUDED.category,
  updated_at = now();

-- 프로덕션 환경 확인 로그
INSERT INTO public.system_logs (level, message, metadata, created_at)
VALUES (
  'info',
  'Production database initialized successfully',
  '{"environment": "production", "initialized_at": "' || now() || '", "subscription_plans": {"1month": 199000, "6months": 1015000, "12months": 1791000}}',
  now()
);

-- 초기화 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '✅ 프로덕션 데이터베이스 초기화 완료';
  RAISE NOTICE '📝 다음 단계: Supabase Auth에서 관리자 계정을 생성하세요';
  RAISE NOTICE '📧 관리자 이메일: admin@obdoc.co.kr';
  RAISE NOTICE '🔑 관리자 비밀번호: admin123!@# (변경 권장)';
  RAISE NOTICE '💰 구독 가격: 1개월(199,000원), 6개월(1,015,000원), 12개월(1,791,000원)';
END $$;
