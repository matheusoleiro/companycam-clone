# Hardcoded Values Audit

## 🔴 CRÍTICO - Credenciais & Secrets

| Tipo | Valor | Arquivo | Linha | Risco |
|------|-------|---------|-------|-------|
| Email demo | `contractor@example.com` | `src/app/auth/login/page.tsx` | 11, 70, 107 | ⚠️ Hardcoded |
| Senha demo | `password123` | `src/app/auth/login/page.tsx` | 12, 108 | ⚠️ Visible |
| Seed data email | `contractor@example.com` | `src/lib/seed-data.ts` | 5, 155 | ⚠️ Hardcoded |

**Solução:** Mover pra `.env.local` e `.env.example`

---

## 🟡 IMPORTANTE - Image Compression Settings

| Parâmetro | Valor | Arquivo | Notas |
|-----------|-------|---------|-------|
| **Batch Size** | `5` | `src/app/projects/[id]/page.tsx:142` | Upload em lotes de 5 |
| **High Quality** | `4096px` | `src/app/projects/[id]/page.tsx:63` | Max dimension |
| **Med Quality** | `2048px` | `src/app/projects/[id]/page.tsx:65` | 75% compression |
| **Low Quality** | `1024px` | `src/app/projects/[id]/page.tsx:64` | 50% compression |
| **High JPEG** | `1.0` | `src/app/projects/[id]/page.tsx:128` | Quality factor |
| **Med JPEG** | `0.75` | `src/app/projects/[id]/page.tsx:130` | Quality factor |
| **Low JPEG** | `0.5` | `src/app/projects/[id]/page.tsx:131` | Quality factor |

**Solução:** Criar `src/config/image.ts` com constantes

---

## 🟡 IMPORTANTE - UI/Layout Constants

| Parâmetro | Valor | Arquivo | Notas |
|-----------|-------|---------|-------|
| Photo Viewer Height | `70vh` | `src/components/photo-viewer.tsx:78` | Max height constraint |
| Photo Viewer Height | `70vh` | `src/app/projects/[id]/page.tsx:515` | Max height constraint |
| Placeholder Image | `https://via.placeholder.com/300` | `src/app/projects/[id]/page.tsx:422` | Grid placeholder |
| Placeholder Image | `https://via.placeholder.com/100` | `src/app/projects/[id]/page.tsx:453` | Timeline placeholder |

**Solução:** Criar `src/config/ui.ts` com constantes

---

## 🟡 IMPORTANTE - Text/Copy (Português + Inglês Misturado)

| Tipo | Português | Inglês | Arquivo |
|------|-----------|--------|---------|
| Button | "Baixar Tudo" / "Baixar" | "Add Photos" | `src/app/projects/[id]/page.tsx` |
| Title | "Tamanho da Foto" | "Photos" | Multiple |
| Button | "Grid" / "Timeline" | "Grid" / "Timeline" | `src/app/projects/[id]/page.tsx` |
| Option | "Mais recentes" | (nenhum) | `src/app/projects/[id]/page.tsx` |
| Label | "Grande" / "Médio" / "Pequeno" | "Photos" | `src/app/projects/[id]/page.tsx` |
| Text | "Máximo 4096px • Sem compressão" | (nenhum) | `src/app/projects/[id]/page.tsx` |

**Solução:** Criar `src/i18n/strings.ts` ou implementar i18n (next-intl)

---

## 🟢 NICE-TO-HAVE - Magic Numbers

| Tipo | Valor | Arquivo | Contexto |
|------|-------|---------|----------|
| Upload batch | `5` | `src/app/projects/[id]/page.tsx:142` | Parallelization |
| String limit | `8` | `src/app/projects/[id]/page.tsx:422` | ID substring |
| String limit | `8` | `src/app/projects/[id]/page.tsx:453` | ID substring |
| File size format | `/1024/1024` | Multiple | MB conversion |

**Solução:** Criar `src/config/constants.ts`

---

## 📋 Action Items (Priority)

### P0 - Segurança (HOJE)
- [ ] Remover credenciais demo do código
- [ ] Mover pra `.env.local`
- [ ] Criar `.env.example` com placeholders

### P1 - Configuração (HOJE)
- [ ] Criar `src/config/image.ts` (compression settings)
- [ ] Criar `src/config/ui.ts` (layout constants)
- [ ] Criar `src/config/constants.ts` (magic numbers)

### P2 - Internacionalização (AMANHÃ)
- [ ] Criar `src/i18n/strings.ts` com strings em PT/EN
- [ ] Decidir: i18n simples vs next-intl
- [ ] Trocar hardcoded strings por chaves

### P3 - Código Limpo (DEPOIS)
- [ ] Remover `.env.local` do git (adicionar em `.gitignore`)
- [ ] Documentar credenciais de teste em README
- [ ] Review final de hardcodes

---

## 📁 Estrutura Proposta

```
src/
├── config/
│   ├── image.ts          # Compression, dimensions
│   ├── ui.ts             # Layout, sizes
│   └── constants.ts      # Magic numbers
├── i18n/
│   └── strings.ts        # Portuguese/English strings
└── ...
```

---

## Exemplo - Antes vs Depois

### ANTES (Hardcoded)
```tsx
let maxDim = 4096;
if (quality === 0.5) maxDim = 1024;
else if (quality === 0.75) maxDim = 2048;

// UI
<div className="max-h-[70vh] w-auto">

// Text
Tamanho da Foto / Add Photos / Máximo 4096px
```

### DEPOIS (Configurado)
```tsx
import { IMAGE_QUALITY } from '@/config/image';
import { PHOTO_VIEWER } from '@/config/ui';
import { strings } from '@/i18n/strings';

const maxDim = IMAGE_QUALITY[quality].maxDim;

// UI
<div className={`max-h-[${PHOTO_VIEWER.maxHeight}]`}>

// Text
{strings.pt.photoSize} / {strings.en.addPhotos}
```

---

## Status

- 🔴 **Segurança:** 3 hardcoded credentials
- 🟡 **Configuração:** 14 magic numbers/constants
- 🟡 **i18n:** Mixed Portuguese/English (8+ places)
- 🟢 **Overall:** ~25 hardcodes encontrados

**Recomendação:** Começar por P0 (segurança), depois P1 (config).
