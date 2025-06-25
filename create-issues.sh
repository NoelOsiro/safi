#!/bin/bash

echo "🚀 Creating MAMA SAFI GitHub issues..."

create_issue() {
  title="$1"
  body="$2"
  labels="$3"

  gh issue create --title "$title" --body "$body" --label $labels
}

# ---------------------- Issues Start ----------------------

create_issue "Implement Email/Password Authentication" "
**Description:** Add email/password authentication as an alternative to Microsoft OAuth

**Acceptance Criteria:**
- [ ] Create signup form with email/password
- [ ] Implement email verification flow
- [ ] Add password reset functionality
- [ ] Update login form to support both OAuth and email/password

**Priority:** Medium" "enhancement,authentication"

create_issue "User Role Management System" "
**Description:** Implement role-based access control (Admin, Instructor, Student)

**Acceptance Criteria:**
- [ ] Create role assignment interface for admins
- [ ] Implement role-based route protection
- [ ] Add instructor dashboard for content management
- [ ] Create admin panel for user management

**Priority:** High" "feature,authentication,admin"

create_issue "Dynamic Training Module Management" "
**Description:** Replace mock data with real CMS for training modules

**Acceptance Criteria:**
- [ ] Create admin interface for module creation/editing
- [ ] Implement file upload for module images and videos
- [ ] Add rich text editor for module content
- [ ] Create module versioning system
- [ ] Add module publishing workflow

**Priority:** High" "feature,cms,admin"

create_issue "Video Content Integration" "
**Description:** Add video support for training modules

**Acceptance Criteria:**
- [ ] Integrate video player (YouTube/Vimeo or self-hosted)
- [ ] Add video progress tracking
- [ ] Implement video transcripts/captions
- [ ] Add video bookmarking feature

**Priority:** Medium" "feature,multimedia"

create_issue "Interactive Quizzes and Assessments" "
**Description:** Create comprehensive assessment system

**Acceptance Criteria:**
- [ ] Build quiz builder interface for admins
- [ ] Support multiple question types (multiple choice, true/false, drag-drop)
- [ ] Implement timed assessments
- [ ] Add question randomization
- [ ] Create detailed analytics and reporting

**Priority:** High" "feature,assessment"

create_issue "Real AI Chatbot Integration" "
**Description:** Replace mock AI responses with real AI service

**Acceptance Criteria:**
- [ ] Integrate with OpenAI/Anthropic API
- [ ] Implement context-aware responses
- [ ] Add conversation history
- [ ] Create AI training on food safety content
- [ ] Add multilingual support (English/Swahili)

**Priority:** High" "feature,ai,integration"

create_issue "AI-Powered Content Recommendations" "
**Description:** Implement personalized learning recommendations

**Acceptance Criteria:**
- [ ] Analyze user progress and performance
- [ ] Suggest relevant modules based on weak areas
- [ ] Recommend additional resources
- [ ] Create adaptive learning paths

**Priority:** Medium" "feature,ai,personalization"

create_issue "Learning Analytics Dashboard" "
**Description:** Create comprehensive analytics for learners and admins

**Acceptance Criteria:**
- [ ] Track module completion rates
- [ ] Monitor time spent on each section
- [ ] Generate progress reports
- [ ] Create performance analytics
- [ ] Add exportable certificates

**Priority:** Medium" "feature,analytics"

create_issue "Admin Analytics and Insights" "
**Description:** Build admin dashboard with platform insights

**Acceptance Criteria:**
- [ ] User engagement metrics
- [ ] Content performance analytics
- [ ] Assessment score distributions
- [ ] Platform usage statistics
- [ ] Export functionality for reports

**Priority:** Medium" "feature,admin,analytics"

create_issue "Progressive Web App (PWA) Implementation" "
**Description:** Convert platform to PWA for mobile experience

**Acceptance Criteria:**
- [ ] Add service worker for offline functionality
- [ ] Implement app manifest
- [ ] Add push notifications
- [ ] Enable offline content viewing
- [ ] Add install prompts

**Priority:** High" "feature,mobile,pwa"

create_issue "Accessibility Improvements" "
**Description:** Enhance platform accessibility compliance

**Acceptance Criteria:**
- [ ] Implement WCAG 2.1 AA compliance
- [ ] Add keyboard navigation support
- [ ] Improve screen reader compatibility
- [ ] Add high contrast mode
- [ ] Implement focus management

**Priority:** Medium" "accessibility,enhancement"

create_issue "Multi-language Support" "
**Description:** Add Swahili and other local language support

**Acceptance Criteria:**
- [ ] Implement i18n framework
- [ ] Translate all UI text to Swahili
- [ ] Add language switcher
- [ ] Support RTL languages
- [ ] Localize date/time formats

**Priority:** High" "feature,i18n,localization"

create_issue "WhatsApp Integration" "
**Description:** Integrate WhatsApp for notifications and support

**Acceptance Criteria:**
- [ ] WhatsApp Business API integration
- [ ] Send course reminders via WhatsApp
- [ ] WhatsApp-based customer support
- [ ] Course completion notifications

**Priority:** Medium" "feature,integration,communication"

create_issue "Digital Certification System" "
**Description:** Generate and manage digital certificates

**Acceptance Criteria:**
- [ ] Create certificate templates
- [ ] Generate PDF certificates
- [ ] Implement blockchain verification
- [ ] Add certificate sharing functionality
- [ ] Create certificate registry

**Priority:** High" "feature,certification"

create_issue "Gamification Features" "
**Description:** Add gamification to increase engagement

**Acceptance Criteria:**
- [ ] Implement points and badges system
- [ ] Create leaderboards
- [ ] Add achievement unlocks
- [ ] Implement streak tracking
- [ ] Create social sharing features

**Priority:** Medium" "feature,gamification"

create_issue "Performance Optimization" "
**Description:** Optimize platform performance and loading times

**Acceptance Criteria:**
- [ ] Implement image optimization
- [ ] Add lazy loading for content
- [ ] Optimize bundle sizes
- [ ] Implement caching strategies
- [ ] Add performance monitoring

**Priority:** Medium" "performance,optimization"

create_issue "Comprehensive Testing Suite" "
**Description:** Expand test coverage across the platform

**Acceptance Criteria:**
- [ ] Add integration tests for auth flows
- [ ] Implement E2E tests for critical paths
- [ ] Add visual regression testing
- [ ] Create performance tests
- [ ] Set up automated testing pipeline

**Priority:** Medium" "testing,quality"

create_issue "Error Handling and Monitoring" "
**Description:** Implement comprehensive error tracking and monitoring

**Acceptance Criteria:**
- [ ] Integrate error tracking service (Sentry)
- [ ] Add application monitoring
- [ ] Implement user feedback system
- [ ] Create error recovery mechanisms
- [ ] Add health check endpoints

**Priority:** Medium" "monitoring,reliability"

create_issue "Payment Integration" "
**Description:** Add payment processing for premium content

**Acceptance Criteria:**
- [ ] Integrate M-Pesa for Kenya
- [ ] Add Stripe for international payments
- [ ] Implement subscription management
- [ ] Create pricing tiers
- [ ] Add invoice generation

**Priority:** Low" "feature,payments"

create_issue "Offline Learning Support" "
**Description:** Enable offline content consumption

**Acceptance Criteria:**
- [ ] Download modules for offline viewing
- [ ] Sync progress when online
- [ ] Cache assessment data
- [ ] Implement offline-first architecture

**Priority:** Medium" "feature,offline,mobile"

# ---------------------- Issues End ----------------------

echo "✅ All issues created successfully!"
