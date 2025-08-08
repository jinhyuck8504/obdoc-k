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

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_hospital_codes_code ON hospital_codes(code);
CREATE INDEX IF NOT EXISTS idx_hospital_codes_doctor_id ON hospital_codes(doctor_id);
CREATE INDEX IF NOT EXISTS idx_hospital_codes_active ON hospital_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_customer_hospital_codes_code_id ON customer_hospital_codes(hospital_code_id);
CREATE INDEX IF NOT EXISTS idx_customer_hospital_codes_customer_id ON customer_hospital_codes(customer_id);

-- RLS 정책 설정
ALTER TABLE hospital_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_hospital_codes ENABLE ROW LEVEL SECURITY;

-- 의사는 자신이 생성한 코드만 조회/수정 가능
CREATE POLICY "doctors_can_manage_own_codes" ON hospital_codes
  FOR ALL USING (doctor_id = auth.uid());

-- 고객 코드 사용 기록은 해당 고객만 조회 가능
CREATE POLICY "customers_can_view_own_usage" ON customer_hospital_codes
  FOR SELECT USING (customer_id = auth.uid());

-- 시스템에서 코드 사용 기록 생성 가능
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
