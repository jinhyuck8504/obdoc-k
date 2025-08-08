-- =====================================================
-- 병원 가입 코드 시스템 데이터베이스 스키마
-- =====================================================

-- 병원 가입 코드 테이블
CREATE TABLE IF NOT EXISTS hospital_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(8) UNIQUE NOT NULL,
  doctor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL DEFAULT '기본 코드',
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  max_usage INTEGER DEFAULT NULL, -- NULL이면 무제한
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL, -- NULL이면 만료 없음
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 고객-병원코드 연결 테이블
CREATE TABLE IF NOT EXISTS customer_hospital_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  hospital_code_id UUID REFERENCES hospital_codes(id) ON DELETE CASCADE,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 성능 최적화를 위한 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_hospital_codes_code ON hospital_codes(code);
CREATE INDEX IF NOT EXISTS idx_hospital_codes_doctor_id ON hospital_codes(doctor_id);
CREATE INDEX IF NOT EXISTS idx_hospital_codes_active ON hospital_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_hospital_codes_created_at ON hospital_codes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customer_hospital_codes_code_id ON customer_hospital_codes(hospital_code_id);
CREATE INDEX IF NOT EXISTS idx_customer_hospital_codes_customer_id ON customer_hospital_codes(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_hospital_codes_used_at ON customer_hospital_codes(used_at DESC);

-- RLS (Row Level Security) 정책 설정
ALTER TABLE hospital_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_hospital_codes ENABLE ROW LEVEL SECURITY;

-- 의사는 자신이 생성한 코드만 조회/수정 가능
DROP POLICY IF EXISTS "doctors_can_manage_own_codes" ON hospital_codes;
CREATE POLICY "doctors_can_manage_own_codes" ON hospital_codes
  FOR ALL USING (doctor_id = auth.uid());

-- 모든 사용자가 코드 검증을 위해 읽기 가능 (검증 API용)
DROP POLICY IF EXISTS "anyone_can_verify_codes" ON hospital_codes;
CREATE POLICY "anyone_can_verify_codes" ON hospital_codes
  FOR SELECT USING (true);

-- 고객 코드 사용 기록은 해당 고객만 조회 가능
DROP POLICY IF EXISTS "customers_can_view_own_usage" ON customer_hospital_codes;
CREATE POLICY "customers_can_view_own_usage" ON customer_hospital_codes
  FOR SELECT USING (customer_id = auth.uid());

-- 의사는 자신의 코드 사용 기록 조회 가능
DROP POLICY IF EXISTS "doctors_can_view_code_usage" ON customer_hospital_codes;
CREATE POLICY "doctors_can_view_code_usage" ON customer_hospital_codes
  FOR SELECT USING (
    hospital_code_id IN (
      SELECT id FROM hospital_codes WHERE doctor_id = auth.uid()
    )
  );

-- 시스템에서 코드 사용 기록 생성 가능
DROP POLICY IF EXISTS "system_can_create_usage_records" ON customer_hospital_codes;
CREATE POLICY "system_can_create_usage_records" ON customer_hospital_codes
  FOR INSERT WITH CHECK (true);

-- 코드 사용 횟수 증가 함수
CREATE OR REPLACE FUNCTION increment_code_usage(code_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE hospital_codes 
  SET usage_count = usage_count + 1,
      updated_at = NOW()
  WHERE id = code_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 만료된 코드 자동 비활성화 함수
CREATE OR REPLACE FUNCTION deactivate_expired_codes()
RETURNS void AS $$
BEGIN
  UPDATE hospital_codes 
  SET is_active = false,
      updated_at = NOW()
  WHERE expires_at IS NOT NULL 
    AND expires_at < NOW() 
    AND is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 사용 한도 초과 코드 자동 비활성화 함수
CREATE OR REPLACE FUNCTION deactivate_overused_codes()
RETURNS void AS $$
BEGIN
  UPDATE hospital_codes 
  SET is_active = false,
      updated_at = NOW()
  WHERE max_usage IS NOT NULL 
    AND usage_count >= max_usage 
    AND is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 코드 통계 조회 함수
CREATE OR REPLACE FUNCTION get_code_statistics(doctor_user_id UUID)
RETURNS TABLE(
  total_codes INTEGER,
  active_codes INTEGER,
  inactive_codes INTEGER,
  total_usage INTEGER,
  expired_codes INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_codes,
    COUNT(CASE WHEN is_active = true THEN 1 END)::INTEGER as active_codes,
    COUNT(CASE WHEN is_active = false THEN 1 END)::INTEGER as inactive_codes,
    COALESCE(SUM(usage_count), 0)::INTEGER as total_usage,
    COUNT(CASE WHEN expires_at IS NOT NULL AND expires_at < NOW() THEN 1 END)::INTEGER as expired_codes
  FROM hospital_codes 
  WHERE doctor_id = doctor_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거: updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- hospital_codes 테이블에 updated_at 트리거 적용
DROP TRIGGER IF EXISTS update_hospital_codes_updated_at ON hospital_codes;
CREATE TRIGGER update_hospital_codes_updated_at
  BEFORE UPDATE ON hospital_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 코드 검증 로그 테이블 (선택사항 - 보안 모니터링용)
CREATE TABLE IF NOT EXISTS hospital_code_verification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(8) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  is_valid BOOLEAN NOT NULL,
  error_type VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 검증 로그 인덱스
CREATE INDEX IF NOT EXISTS idx_verification_logs_code ON hospital_code_verification_logs(code);
CREATE INDEX IF NOT EXISTS idx_verification_logs_created_at ON hospital_code_verification_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_verification_logs_ip ON hospital_code_verification_logs(ip_address);

-- 검증 로그 RLS
ALTER TABLE hospital_code_verification_logs ENABLE ROW LEVEL SECURITY;

-- 관리자만 검증 로그 조회 가능
DROP POLICY IF EXISTS "admins_can_view_verification_logs" ON hospital_code_verification_logs;
CREATE POLICY "admins_can_view_verification_logs" ON hospital_code_verification_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 시스템에서 검증 로그 생성 가능
DROP POLICY IF EXISTS "system_can_create_verification_logs" ON hospital_code_verification_logs;
CREATE POLICY "system_can_create_verification_logs" ON hospital_code_verification_logs
  FOR INSERT WITH CHECK (true);

-- 샘플 데이터 (개발/테스트용)
-- 실제 프로덕션에서는 제거하세요
DO $$
DECLARE
  sample_doctor_id UUID;
BEGIN
  -- 샘플 의사 계정이 있는 경우에만 샘플 코드 생성
  SELECT id INTO sample_doctor_id 
  FROM auth.users 
  WHERE email = 'doctor@test.com' 
  LIMIT 1;
  
  IF sample_doctor_id IS NOT NULL THEN
    INSERT INTO hospital_codes (code, doctor_id, name, is_active, max_usage) VALUES
    ('ABC12345', sample_doctor_id, '일반 환자용', true, NULL),
    ('VIP67890', sample_doctor_id, 'VIP 환자용', true, 10),
    ('TEST11111', sample_doctor_id, '테스트용', false, 5)
    ON CONFLICT (code) DO NOTHING;
  END IF;
END $$;

-- 정리 작업을 위한 함수들
CREATE OR REPLACE FUNCTION cleanup_old_verification_logs(days_old INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM hospital_code_verification_logs 
  WHERE created_at < NOW() - INTERVAL '1 day' * days_old;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 스키마 버전 정보
CREATE TABLE IF NOT EXISTS schema_versions (
  id SERIAL PRIMARY KEY,
  version VARCHAR(20) NOT NULL,
  description TEXT,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO schema_versions (version, description) VALUES
('1.0.0', '병원 가입 코드 시스템 초기 스키마')
ON CONFLICT DO NOTHING;

-- 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '병원 가입 코드 시스템 데이터베이스 스키마가 성공적으로 생성되었습니다.';
  RAISE NOTICE '테이블: hospital_codes, customer_hospital_codes, hospital_code_verification_logs';
  RAISE NOTICE '함수: increment_code_usage, get_code_statistics, cleanup_old_verification_logs';
  RAISE NOTICE '인덱스 및 RLS 정책이 적용되었습니다.';
END $$;
