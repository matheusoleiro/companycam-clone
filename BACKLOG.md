# CompanyCam Clone - Backlog

Recursos planejados para iterações futuras.

## 🔴 Crítico (v2)

### Autenticação Real
- [ ] Re-habilitar middleware (desabilitado temporariamente)
- [ ] Implementar Row-Level Security (RLS) completo
- [ ] Remover UUID demo (00000000-0000...)
- [ ] Testar multi-user isolation

### Equipes/Crew
- [ ] CRUD de team members
- [ ] Invites por email
- [ ] Roles (owner, admin, member, contractor)
- [ ] Permissions matrix
- [ ] Bulk invite from CSV

### Pagamentos
- [ ] Stripe Checkout integration
- [ ] Subscription plans (Free, Core, Crew, Scale, Enterprise)
- [ ] Customer Portal (change plan, cancel)
- [ ] Webhook handling (payment_intent, subscription_updated)
- [ ] Trial period (14 dias)

---

## 🟡 Importante (v3)

### Feed & Social
- [ ] Activity feed (project updates, uploads, comments)
- [ ] Mentions (@username)
- [ ] Notifications (real-time via Supabase)
- [ ] Read receipts

### Comentários & Discussão
- [ ] Comment threads on photos
- [ ] Reactions (👍, ❤️, etc)
- [ ] @mentions in comments
- [ ] Comment threads/nested replies

### Documentos
- [ ] PDF upload (blueprints, contracts, specs)
- [ ] Document organization (folders, tags)
- [ ] Version history
- [ ] PDF preview/viewer

### Relatórios
- [ ] Generate PDF reports with photos
- [ ] Custom report templates
- [ ] Share/export reports
- [ ] Schedule email reports

### Email & Notifications
- [ ] Resend integration (transactional emails)
- [ ] Invite templates
- [ ] Notification digest
- [ ] Unsubscribe preferences

### Tags & Organization
- [ ] Create/edit tags
- [ ] Tag photos during upload
- [ ] Filter by tags
- [ ] Tag suggestions (ML)

---

## 🟡 Code Quality & Refactoring (v3)

### Remove Hardcoded Values
- [ ] **Security:** Remove demo credentials (contractor@example.com, password123)
  - Move to `.env.local` and `.env.example`
  - Update seed data
- [ ] **Configuration:** Extract magic numbers to config files
  - Create `src/config/image.ts` (compression settings: 4096, 2048, 1024, 0.75, 0.5)
  - Create `src/config/ui.ts` (layout constants: 70vh, placeholder URLs)
  - Create `src/config/constants.ts` (batch size: 5, string limits: 8)
- [ ] **Internationalization:** Create i18n for mixed PT/EN strings
  - Create `src/i18n/strings.ts` (Portuguese + English)
  - Replace hardcoded strings with translation keys
  - Consider next-intl library for full i18n support

**See:** `HARDCODED_AUDIT.md` for detailed list (25+ hardcodes)

---

## 🟢 Nice to Have (v4+)

### Mídia Avançada
- [ ] Video upload & streaming
- [ ] Photo annotations (draw, measure, markup)
- [ ] Before/after slider
- [ ] 360° panoramic photos

### Search & Discovery
- [ ] Full-text search (projects, photos, documents)
- [ ] Advanced filters
- [ ] Saved searches
- [ ] Search analytics

### Mobile App (Expo)
- [ ] Native iOS app
- [ ] Native Android app
- [ ] Offline sync queue
- [ ] Push notifications
- [ ] Camera integration (EXIF, location)

### Team Management
- [ ] Timeclocks (clock in/out)
- [ ] Crew scheduling
- [ ] Attendance tracking
- [ ] Payroll integration

### Integrações
- [ ] Slack notifications
- [ ] Google Drive sync
- [ ] Dropbox integration
- [ ] Zapier workflows

### Offline & Sync
- [ ] Offline mode (service worker)
- [ ] Background sync queue
- [ ] Conflict resolution
- [ ] Bandwidth optimization

### Analytics & Insights
- [ ] Project analytics dashboard
- [ ] Photo upload trends
- [ ] Team performance metrics
- [ ] Cost tracking

### Segurança
- [ ] 2FA (two-factor authentication)
- [ ] API tokens
- [ ] Audit logs
- [ ] Data encryption at rest

---

## 📋 Tests & Polish (v5)

- [ ] Run `/replica-test` - bug hunting
- [ ] Run `/replica-diff` - compare with original
- [ ] Performance optimization
- [ ] Mobile responsiveness review
- [ ] Accessibility audit (WCAG)
- [ ] Security audit
- [ ] Load testing

---

## 🚀 Launch

- [ ] Run `/replica-brand` - create new brand identity
- [ ] Run `/replica-launch` - landing page + pricing
- [ ] Run `/replica-deploy` - deploy to production
- [ ] Custom domain setup
- [ ] SSL certificates
- [ ] CDN configuration
- [ ] Monitoring & alerting

---

## 🤔 Entrepreneur Loop

- [ ] Run `/replica-entrepreneur` - user research
- [ ] Collect feature requests
- [ ] Analyze usage patterns
- [ ] Iterate based on feedback
- [ ] Plan v2 features

---

## Removidas (Backlog Only - Não MVP)

- **Feed** - Activity feed (v3)
- **Chat** - Real-time messaging (out of scope for MVP)
- **Team** - Basic team mgmt (v2), advanced features (v4)

---

## Notas

- MVP focado em: Projects + Photos + Geolocation + Autenticação
- Próximo: Crew management (v2) + Payments (v2)
- Depois: Social features (v3) + Advanced features (v4+)
