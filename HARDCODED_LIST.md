# Lista Completa de Hardcodes

Total: **32 linhas de código com valores hardcoded**

---

## 🔴 CREDENCIAIS (4 occurrências)

```
📄 src/app/auth/login/page.tsx

Linha 11:  const [email, setEmail] = useState('contractor@example.com');
Linha 12:  const [password, setPassword] = useState('password123');
Linha 70:  placeholder="contractor@example.com"
Linha 107: <p>Email: <code>contractor@example.com</code></p>
Linha 108: <p>Password: <code>password123</code></p>

📄 src/lib/seed-data.ts

Linha 5:   email: 'contractor@example.com',
Linha 155: email: 'contractor@example.com',
```

**Total: 7 linhas**  
**Risco:** 🔴 ALTO - Credenciais em código aberto

---

## 🟠 COMPRESSÃO DE IMAGEM (9 linhas)

```
📄 src/app/projects/[id]/page.tsx

Linha 62-65: Image quality logic
  62:  let maxDim = 4096;
  63:  if (quality === 0.5) maxDim = 1024;      // low
  64:  else if (quality === 0.75) maxDim = 2048; // medium
  65:  // high = 4096

Linha 125-127: JPEG quality factors
  125: high: 1.0,
  126: medium: 0.75,
  127: low: 0.5,

Linha 136-138: Upload batch size
  136: const batchSize = 5;
  137: for (let i = 0; i < compressedFiles.length; i += batchSize)
  138: const batch = compressedFiles.slice(i, i + batchSize);
```

**Total: 9 linhas**  
**Valores:**
- High: 4096px, 1.0 quality
- Medium: 2048px, 0.75 quality
- Low: 1024px, 0.5 quality
- Batch: 5 uploads paralelo

---

## 🟠 LAYOUT/CSS (2 linhas)

```
📄 src/app/projects/[id]/page.tsx

Linha 515: className="max-h-[70vh] w-auto object-contain rounded-lg"

📄 src/components/photo-viewer.tsx

Linha 78: className="max-h-[70vh] w-auto object-contain rounded-lg"
```

**Total: 2 linhas**  
**Valor:** `70vh` (photo viewer max height)

---

## 🟠 PLACEHOLDER IMAGES (2 linhas)

```
📄 src/app/projects/[id]/page.tsx

Linha 422: src={photo.public_url || `https://via.placeholder.com/300?text=...`}
Linha 453: src={photo.public_url || `https://via.placeholder.com/100?text=...`}
```

**Total: 2 linhas**  
**URLs:**
- Grid: `https://via.placeholder.com/300`
- Timeline: `https://via.placeholder.com/100`

---

## 🟡 TEXTOS EM PORTUGUÊS (8 linhas)

```
📄 src/app/projects/[id]/page.tsx

Linha 349: title="Baixar todas as fotos em ZIP"
Linha 352: <span>Baixar Tudo</span>
Linha 353: <span>Baixar</span>
Linha 482: title="Baixar foto"

Linha 548: <div>🖼️ Grande</div>
Linha 549: <div>Máximo 4096px • Sem compressão</div>

Linha 560: <div>📱 Médio</div>
Linha 561: <div>Máximo 2048px • 75% qualidade</div>

Linha 572: <div>⚡ Pequeno</div>
Linha 573: <div>Máximo 1024px • 50% qualidade</div>
```

**Total: 8 linhas** (+ descrições)  
**Textos:**
- "Baixar Tudo" / "Baixar"
- "Baixar foto"
- "Grande", "Médio", "Pequeno"
- "Máximo 4096px • Sem compressão"
- "Máximo 2048px • 75% qualidade"
- "Máximo 1024px • 50% qualidade"

---

## 🟡 TEXTOS EM INGLÊS (2 linhas)

```
📄 src/app/projects/[id]/page.tsx

Linha 375: <span>Add Photos</span>
Linha 406: `Adding Photos ${...}`
```

**Total: 2 linhas**  
**Textos:**
- "Add Photos"
- "Adding Photos"

---

## 🟢 CONVERSÕES DE UNIDADES (4 linhas)

```
📄 src/app/projects/[id]/page.tsx

Linha 463: {(photo.file_size / 1024 / 1024).toFixed(2)} MB
Linha 523: {(selectedPhoto.file_size / 1024 / 1024).toFixed(2)} MB

📄 src/app/settings/page.tsx

Linha 41: {((user?.storage_used_bytes || 0) / 1024 / 1024 / 1024).toFixed(2)} GB
```

**Total: 3 linhas**  
**Conversão:**
- Bytes → MB: `/1024/1024`
- Bytes → GB: `/1024/1024/1024`

---

## 📊 RESUMO POR CATEGORIA

| Categoria | Qtd | Risco | Prioridade |
|-----------|-----|-------|-----------|
| Credenciais | 7 | 🔴 ALTO | P0 |
| Compressão (números) | 9 | 🟠 MÉDIO | P1 |
| Layout (CSS) | 2 | 🟠 MÉDIO | P1 |
| Placeholders (URLs) | 2 | 🟠 MÉDIO | P1 |
| Textos PT | 10 | 🟡 BAIXO | P2 |
| Textos EN | 2 | 🟡 BAIXO | P2 |
| Conversões | 3 | 🟡 BAIXO | P3 |
| **TOTAL** | **35** | - | - |

---

## 🎯 Plano de Ação

### P0 - SEGURANÇA (HOJE)
```bash
# Remover credenciais
- contractor@example.com (5x)
- password123 (2x)

# Mover para .env.local
DEMO_EMAIL=contractor@example.com
DEMO_PASSWORD=password123
```

### P1 - CONFIGURAÇÃO (HOJE)
```typescript
// src/config/image.ts
export const IMAGE_QUALITY = {
  high: { maxDim: 4096, quality: 1.0 },
  medium: { maxDim: 2048, quality: 0.75 },
  low: { maxDim: 1024, quality: 0.5 },
  batchSize: 5,
};

// src/config/ui.ts
export const PHOTO_VIEWER = {
  maxHeight: '70vh',
  placeholders: {
    grid: 'https://via.placeholder.com/300',
    timeline: 'https://via.placeholder.com/100',
  },
};
```

### P2 - INTERNACIONALIZAÇÃO (AMANHÃ)
```typescript
// src/i18n/strings.ts
export const strings = {
  pt: {
    downloadAll: 'Baixar Tudo',
    download: 'Baixar',
    addPhotos: 'Add Photos',
    sizeQuality: {
      high: 'Grande',
      medium: 'Médio',
      low: 'Pequeno',
    },
  },
  en: {
    downloadAll: 'Download All',
    download: 'Download',
    addPhotos: 'Add Photos',
    sizeQuality: {
      high: 'High',
      medium: 'Medium',
      low: 'Low',
    },
  },
};
```

---

## 📝 Notas

- ✅ Documentado em `HARDCODED_AUDIT.md`
- 📌 Adicionado ao Backlog v3 (Code Quality)
- 🔄 Refatoração não urgente - MVP funcional
- 🔐 Credenciais DEVEM sair do código antes de produção real

---

**Última atualização:** 27/10/2026
