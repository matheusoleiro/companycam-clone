# CompanyCam MVP Zero - Status

**Data:** 26 de Outubro de 2026  
**Status:** 🟡 70% - Funcional mas com gaps

---

## ✅ Implementado (MVP Zero)

### Autenticação
- [x] Login/Signup com Supabase Auth
- [x] Session persistence (HTTP-only cookies)
- [x] Logout

### Projetos
- [x] Criar projeto (name, address, start_date)
- [x] Listar projetos
- [x] Visualizar detalhes do projeto
- [x] Editar projeto (name, address, description)
- [x] Deletar projeto
- [x] Foto counter por projeto

### Fotos
- [x] Upload de múltiplas fotos (bulk)
- [x] Seleção de qualidade (Grande/Médio/Pequeno)
- [x] Compressão automática baseada em qualidade
- [x] Metadados EXIF (geolocation)
- [x] Visualizar galeria de fotos
- [x] Download individual de foto
- [x] Download em ZIP (todas as fotos)
- [x] Deletar foto

### UI/UX
- [x] Responsive layout (Mobile-first)
- [x] Header com navegação
- [x] Input styling corrigido
- [x] Bottom-sheet quality selector

---

## 🔴 Faltando (Critical para MVP Zero)

### Photo Navigation
- [ ] **Photo Carousel/Navigator** ⚠️ USER REQUEST
  - Visualizar foto uma por uma
  - Setas esquerda/direita para navegar
  - Indicador de posição (3/15)
  - Teclado: arrow keys, Esc para fechar

### Photo Display Issues
- [ ] **Photo Sizing** ⚠️ USER REQUEST
  - Fotos grandes estão overflow da tela
  - Precisa de max-width/max-height responsivo
  - Propor: max-height 70vh, width auto
  - Mobile: full width, constrained height

### API Routes
- [ ] `PATCH /api/photos/:id` - Rename photo
- [ ] Query string support (filter by date, search)

---

## 🟡 Identificados (Bugs/UX Issues)

1. **Photo Size Problem**: Fotos muito grandes, não se adaptam à tela
   - Solução: CSS max-width/height + aspect-ratio
   - Priority: HIGH (affects UX)

2. **Missing Photo Viewer**: Não dá pra navegar entre fotos
   - Solução: Modal/Modal com setas, contador
   - Priority: HIGH (core feature)

3. **No Pagination**: Galeria mostra todas as fotos
   - Solução: Lazy load ou pagination
   - Priority: MEDIUM

4. **Geolocation Mock**: EXIF location tá usando coordenadas fixas
   - Solução: Ler de verdade ou pedir permissão
   - Priority: MEDIUM

---

## 📊 MVP Zero Checklist

| Feature | Status | Notes |
|---------|--------|-------|
| Auth | ✅ | Funcional |
| Projects CRUD | ✅ | Funcional |
| Photo Upload (bulk) | ✅ | Funcional com qualidade selector |
| Photo Download (ZIP) | ✅ | Funcional |
| Geolocation | ✅ | EXIF reading (mock coords) |
| Responsive UI | ✅ | Mobile-friendly |
| **Photo Navigator** | ❌ | CRITICAL - User requested |
| **Photo Sizing** | ❌ | CRITICAL - Overflow issue |
| Pagination | ❌ | Can defer |
| Search/Filter | ❌ | Can defer |
| Comments | ❌ | Backlog (v3) |
| Teams | ❌ | Backlog (v2) |

---

## 🎯 Next Steps (Priority Order)

1. **Implement Photo Navigator** (TODAY)
   - Modal com foto grande
   - Arrows left/right
   - Close button (X) / Escape key
   - Photo counter (e.g., "3 of 15")

2. **Fix Photo Sizing** (TODAY)
   - Constrain height: max-height: 70vh
   - Width: auto (maintain aspect ratio)
   - Mobile: adjust for smaller screens

3. **Add Photo Rename** (TOMORROW)
   - Via edit icon on photo viewer
   - Call PATCH /api/photos/:id

4. **Pagination/Lazy Load** (TOMORROW)
   - Load 12 at a time
   - Intersection Observer

---

## 🚀 Production Ready When

- [x] Code deployed to Netlify (Done)
- [ ] Photo Navigator implemented
- [ ] Photo sizing fixed
- [ ] No 404 errors
- [ ] Can upload/download/view photos end-to-end
- [ ] Responsive on mobile & desktop

After ✅, move to v2: Teams + Payments
