# Requirements Document

## Introduction

관리자 대시보드의 통계 및 모더레이션 기능이 데이터베이스 스키마 불일치와 누락된 테이블로 인해 400/404 에러가 발생하고 있습니다. 이 문제를 해결하여 관리자가 정상적으로 시스템을 모니터링하고 관리할 수 있도록 해야 합니다.

## Requirements

### Requirement 1

**User Story:** As an admin, I want to view subscription statistics on the dashboard, so that I can monitor revenue and subscription trends.

#### Acceptance Criteria

1. WHEN admin accesses the statistics tab THEN the system SHALL display subscription data without 400 errors
2. WHEN querying subscription data THEN the system SHALL use correct column names that exist in the database
3. WHEN displaying plan distribution THEN the system SHALL show accurate counts for each subscription plan type
4. WHEN calculating revenue data THEN the system SHALL aggregate amounts correctly from active subscriptions

### Requirement 2

**User Story:** As an admin, I want to view moderation reports on the dashboard, so that I can manage user-reported content and maintain platform quality.

#### Acceptance Criteria

1. WHEN admin accesses the moderation tab THEN the system SHALL display reports without 404 errors
2. WHEN the reports table doesn't exist THEN the system SHALL create it with proper schema and RLS policies
3. WHEN displaying reports THEN the system SHALL show reporter, reported user, reason, and status information
4. WHEN filtering reports by status THEN the system SHALL return accurate results

### Requirement 3

**User Story:** As an admin, I want to see sample data in the dashboard, so that I can test functionality and understand the interface layout.

#### Acceptance Criteria

1. WHEN the database is empty THEN the system SHALL populate sample subscription data for testing
2. WHEN sample data is created THEN it SHALL include realistic subscription plans, amounts, and dates
3. WHEN sample reports are created THEN they SHALL include various report types and statuses
4. WHEN data is inserted THEN it SHALL respect foreign key constraints and data validation rules

### Requirement 4

**User Story:** As a developer, I want the database schema to be consistent with the application code, so that queries execute successfully without column mismatch errors.

#### Acceptance Criteria

1. WHEN the application queries subscription data THEN the database SHALL have matching column names
2. WHEN adding missing columns THEN the system SHALL preserve existing data integrity
3. WHEN creating new tables THEN they SHALL include proper indexes for performance
4. WHEN setting up RLS policies THEN they SHALL allow admin access while maintaining security

### Requirement 5

**User Story:** As an admin, I want the Supabase client to initialize properly without warnings, so that the application runs smoothly without console errors.

#### Acceptance Criteria

1. WHEN the application loads THEN there SHALL be no multiple GoTrueClient instance warnings
2. WHEN Supabase client initializes THEN it SHALL use singleton pattern to prevent duplicates
3. WHEN authentication state changes THEN it SHALL be handled consistently across the application
4. WHEN debugging is enabled THEN console logs SHALL provide clear information without spam
