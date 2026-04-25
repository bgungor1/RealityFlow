# DESIGN.md — RealityFlow Architecture / Mimari Yapı

This document details the architectural decisions, data models, and technical strategies implemented in RealityFlow.

Bu belge, RealityFlow projesinde uygulanan mimari kararları, veri modellerini ve teknik stratejileri detaylandırmaktadır.

---

## 1. Core Architecture / Temel Mimari

### Modular Monolith & DDD Principles (NestJS)
**EN:** The backend is built as a **Modular Monolith** applying **Domain-Driven Design (DDD)** principles. This ensures a clean separation of concerns between domains while maintaining a single deployment unit for simplicity and performance.
- **Bounded Contexts:** Each module (`Transaction`, `User`, `Dashboard`) represents a distinct bounded context with its own business rules.
- **Service Isolation:** Each module manages its own logic. `CommissionService` acts as a pure **Domain Service**, while `TransactionService` manages the state and orchestration.
- **Dashboard Optimization ($facet):** We utilize MongoDB's `$facet` operator to execute multiple aggregation pipelines (counts, sums, and top performers) in a single database round-trip.

**TR:** Backend, **Domain-Driven Design (DDD)** prensipleri uygulanarak **Modüler Monolit** mimarisiyle inşa edilmiştir. Bu, alanlar arasında temiz bir sorumluluk ayrımı sağlarken, basitlik için tek bir dağıtım birimini korur.
- **Bounded Contexts (Sınırlı Bağlamlar):** Her modül (`Transaction`, `User`, `Dashboard`), kendi iş kurallarına sahip ayrı bir sınırlı bağlamı temsil eder.
- **Servis İzolasyonu:** Her modül kendi mantığını yönetir. `CommissionService` saf bir **Domain Service** (Alan Servisi) olarak görev yaparken, `TransactionService` durumu ve orkestrasyonu yönetir.
- **Dashboard Optimizasyonu ($facet):** Yüksek performanslı dashboard gereksinimi için MongoDB'nin `$facet` operatörünü kullanarak tüm metrikleri tek bir veritabanı turunda hesaplıyoruz.

---

## 2. Data Modeling & Financial Breakdown / Veri Modelleme ve Finansal Dağılım

### Embedded Commission Strategy / Gömülü Komisyon Stratejisi
**EN:** We chose to **embed** the financial breakdown directly within the `Transaction` document.
- **Aggregate Root:** In DDD terms, `Transaction` acts as the **Aggregate Root**. The `Commission` data is a value-object-like structure that has no meaning outside the context of a transaction.
- **Justification:** Real estate transactions require absolute consistency between the stage and the commission. Embedding ensures that the financial data is always retrieved with the transaction in a single database hit, avoiding N+1 problems.
- **Role Breakdown:** Each commission entry tracks the specific role (`listing`, `selling`, or `both`) to justify the earned amount, fulfilling the "Why" requirement of the case.
- **Data Integrity:** Embedding ensures that the financial breakdown is always consistent with the transaction state, as they are updated together.

**TR:** Finansal dökümü doğrudan `Transaction` dökümanına **gömmeyi (embed)** tercih ettik.
- **Aggregate Root (Küme Kökü):** DDD terminolojisinde `Transaction`, **Aggregate Root** görevini görür. `Commission` verisi, işlem bağlamı dışında bir anlamı olmayan bir yapıdadır.
- **Gerekçe:** Emlak işlemleri, aşama ve komisyon arasında mutlak tutarlılık gerektirir. Gömülü yapı, finansal verilerin her zaman tek bir veritabanı okumasında işlemle birlikte getirilmesini sağlayarak N+1 problemlerini önler.
- **Rol Detaylandırma:** Her komisyon kaydı, kazanılan tutarı gerekçelendirmek için ilgili rolü (`listing`, `selling` veya `both`) takip eder; bu da case'deki "Neden" gereksinimini karşılar.
- **Veri Bütünlüğü:** Gömülü yapı, finansal dökümün her zaman işlem durumuyla tutarlı olmasını sağlar, çünkü birlikte güncellenirler.

### Atomicity & Reliability / Atomiklik ve Güvenilirlik
**EN:** 
- **Atomicity:** Moving to the `completed` stage and calculating the commission is wrapped in a MongoDB ACID-compliant session. This ensures that the stage update and commission storage succeed or fail together, preventing data corruption.
- **Idempotency:** Transition requests are idempotent. Repeated calls for the same stage do not trigger re-calculations or duplicate history logs.

**TR:** 
- **Atomiklik:** `completed` aşamasına geçiş ve komisyon hesaplaması MongoDB ACID uyumlu bir oturum (session) içinde gerçekleştirilir. Bu, aşama güncellemesi ve komisyon kaydının ya birlikte başarılı olmasını ya da birlikte başarısız olmasını sağlayarak veri bozulmasını önler.
- **İdemputans:** Aşama geçiş istekleri idemputanttır. Aynı aşama için tekrarlanan çağrılar, yeniden hesaplamayı veya mükerrer geçmiş kayıtlarını tetiklemez.

### Schema Structure / Şema Yapısı
**EN:**
- **Transaction:** Root document containing property info, stages, and the embedded `Commission` object.
- **User:** Agent profiles with roles (`admin`, `agent`).
- **Virtual Relationships:** We use Mongoose Virtuals to populate agent data (`listingAgent`, `sellingAgent`) during API calls. This keeps the physical document size small while providing a rich, joined response for the UI.

**TR:**
- **Transaction (İşlem):** Mülk bilgilerini, aşamaları ve gömülü `Commission` nesnesini içeren kök döküman.
- **User (Kullanıcı):** `admin` veya `agent` (danışman) rollerine sahip kullanıcı profilleri.
- **Virtual Relationships (Sanal İlişkiler):** API çağrıları sırasında agent verilerini (`listingAgent`, `sellingAgent`) getirmek için Mongoose Virtuals kullanıyoruz. Bu, fiziksel döküman boyutunu küçük tutarken UI için zengin ve birleştirilmiş bir yanıt sağlar.

### Database Indexing Strategy / Veritabanı İndeksleme Stratejisi
**EN:**
- **Compound & Single Indexes:** We index `stage`, `listingAgentId`, and `sellingAgentId` to ensure fast filtering for the dashboard and agent-specific reports.
- **Temporal Sorting:** `createdAt: -1` is indexed to optimize "Recent Transactions" queries.

**TR:**
- **Bileşik ve Tekil İndeksler:** Dashboard ve danışman bazlı raporlarda hızlı filtreleme için `stage`, `listingAgentId` ve `sellingAgentId` alanları indekslenmiştir.
- **Zaman Tabanlı Sıralama:** UI'da sıkça kullanılan "Son İşlemler" sorgularını optimize etmek için `createdAt: -1` alanı indekslenmiştir.

### Consistency & Concurrency / Tutarlılık ve Eşzamanlılık
**EN:**
- **Optimistic Concurrency Control (OCC):** We utilize Mongoose's internal versioning (`__v`) to handle race conditions. If two users attempt to update the same transaction simultaneously, the system prevents data overwrites, ensuring financial integrity.

**TR:**
- **İyimser Eşzamanlılık Kontrolü (OCC):** race conditions yönetmek için Mongoose'un dahili versiyonlama (`__v`) mekanizmasını kullanıyoruz. İki kullanıcı aynı anda aynı işlemi güncellemeye çalıştığında, sistem veri üzerine yazılmasını engelleyerek finansal bütünlüğü korur.

---

## 3. Request Validation & Security / İstek Doğrulama ve Güvenlik

**EN:**
- **Validation Layer:** We use `class-validator` and `ValidationPipe` to enforce strict types and business constraints at the entry point (DTO).
- **Global Exception Mapping:** A custom `GlobalExceptionFilter` transforms internal errors into standardized JSON responses, preventing internal stack trace leaks.

**TR:**
- **Doğrulama Katmanı:** Giriş noktasında (DTO) katı tip ve iş kısıtlamalarını uygulamak için `class-validator` ve `ValidationPipe` kullanıyoruz.
- **Küresel Hata Eşleme:** Özel bir `GlobalExceptionFilter`, dahili hataları standart ve kullanıcı dostu JSON yanıtlarına dönüştürerek sistem bilgilerinin dışarı sızmasını önler.

---

## 4. Business Logic: Commission Rules / İş Mantığı: Komisyon Kuralları

**EN:** The system implements the mandatory 50/50 agency-agent split:
- **Scenario 1 (Single Agent):** If the listing and selling agents are the same, they receive 100% of the agent portion (50% of total).
- **Scenario 2 (Split Agents):** If they are different, they share the agent portion equally (25% each of total).

**TR:** Sistem, zorunlu %50 ajans-%50 danışman dağılımını uygular:
- **Senaryo 1 (Tek Danışman):** Portföy ve satış danışmanı aynı kişiyse, danışman payının %100'ünü (%50 toplam) alır.
- **Senaryo 2 (Ayrı Danışmanlar):** Farklı kişilerse, danışman payını eşit olarak paylaşırlar (her biri toplamın %25'i).

---

## 5. Stage Transitions / İşlem Aşamaları

**EN:** Transactions follow a strict linear lifecycle: `agreement` → `earnest_money` → `title_deed` → `completed`.
- **Prevention of Invalid Transitions:** We use a configuration-driven approach (`VALID_TRANSITIONS` map). The backend explicitly checks if the target stage is the valid "next step". Jumps (e.g., agreement to title_deed) or backward moves are prohibited to ensure traceability.
- **Traceability:** Every transition is recorded in the `stageHistory` array with timestamps, providing a full audit trail.
- **Double-Lock Validation:** We apply a double-lock strategy: the UI proactively disables invalid moves based on `STAGE_ORDER`, while the Backend enforces the `VALID_TRANSITIONS` ruleset as the final authority.

**TR:** İşlemler katı bir lineer yaşam döngüsü izler: `agreement` → `earnest_money` → `title_deed` → `completed`.
- **Geçersiz Geçişlerin Önlenmesi:** Yapılandırma odaklı bir yaklaşım (`VALID_TRANSITIONS` haritası) kullanıyoruz. Backend, hedef aşamanın geçerli bir "sonraki adım" olup olmadığını açıkça kontrol eder. İzlenebilirliği sağlamak için atlamalar (örn. sözleşmeden tapuya) veya geriye dönük hareketler yasaklanmıştır.
- **İzlenebilirlik:** Her geçiş, zaman damgalarıyla birlikte `stageHistory` dizisine kaydedilerek tam bir denetim izi sağlar.
- **Çift Kilitli Doğrulama:** UI tarafında `STAGE_ORDER` ile geçersiz butonlar pasif hale getirilirken, Backend tarafında `VALID_TRANSITIONS` kuralları kesin otorite olarak uygulanır.

---

## 6. Frontend Architecture / Frontend Mimarisi

### Nuxt 3 & Pinia (SSR Strategy)
**EN:**
- **State Management:** Pinia acts as the state synchronization layer. The backend is the **Single Source of Truth**; frontend stores are designed to mirror the backend state with zero local business logic derivation.
- **SSR & Hydration Stability:** We use `useCookie` integrated with Pinia's `initializeAuth` action to ensure authentication state is consistent between the server and the client, preventing hydration mismatches during page refreshes.
- **Data Fetching:** We utilize `useAsyncData` for initial page loads (SEO and performance) and `$fetch` within Pinia actions for client-side interactions, ensuring a smooth transition between SSR and CSR.

**TR:**
- **Durum Yönetimi:** Pinia, durum senkronizasyon katmanı olarak görev yapar. Backend **Tek Gerçek Kaynaktır**; frontend store'ları, yerel iş mantığı türetmeden backend durumunu yansıtacak şekilde tasarlanmıştır.
- **SSR ve Hydration Stabilitesi:** Sayfa yenilemelerinde "hydration mismatch" hatalarını önlemek için, Pinia'nın `initializeAuth` aksiyonu ile entegre `useCookie` kullanıyoruz. Bu, kimlik doğrulama durumunun sunucu ve istemci arasında tutarlı kalmasını sağlar.
- **Veri Çekme:** İlk sayfa yüklemeleri (SEO ve performans) için `useAsyncData`, istemci tarafı etkileşimler için ise Pinia store'ları içinde `$fetch` kullanıyoruz; bu sayede SSR ve CSR arasında pürüzsüz bir geçiş sağlıyoruz.

### UI/UX & Component Architecture
**EN:**
- **Component Purity:** Components are strictly "View-Only". All data processing, formatting (beyond simple display), and API orchestration are handled by Pinia stores or specialized utility functions.
- **Visual Feedback:** A visual stepper is used for transaction stages, providing clear feedback on the lifecycle progress. Metrics are high-contrast and grouped logically for rapid information consumption by agency consultants.
- **Atomic Refresh & Skeletons:** Transitions trigger an **Atomic Dashboard Refresh** to re-sync all `$facet` metrics. **Skeleton Screens** are used to manage perceived latency during complex financial calculations.

**TR:**
- **Bileşen Saflığı:** Bileşenler kesinlikle "Sadece Görünüm" (View-Only) odaklıdır. Tüm veri işleme, formatlama ve API orkestrasyonu Pinia store'ları veya özel yardımcı fonksiyonlar tarafından yönetilir.
- **Görsel Geri Bildirim:** İşlem aşamaları için görsel bir "stepper" (adım göstergesi) kullanılarak yaşam döngüsü ilerlemesi hakkında net bilgi verilir. Metrikler, ajans danışmanlarının hızlıca bilgi alabilmesi için yüksek kontrastlı ve mantıksal olarak gruplandırılmıştır.
- **Atomik Yenileme ve İskelet Ekranlar:** Aşamalar değiştiğinde tüm `$facet` metriklerini senkronize etmek için dashboard atomik olarak yenilenir. Hesaplama sırasındaki algılanan gecikme iskelet ekranlar ile yönetilir.

---

## 7. Technical Deliverables / Teknik Teslimatlar

**EN:**
- **Unit Testing:** Mandatory tests cover the `CommissionService` scenarios and `TransactionService` stage transitions.
- **Error Handling:** Global filters catch `BusinessException` instances to return user-friendly error messages (400) for rule violations, while safeguarding internal system errors (500).
- **Database:** MongoDB Atlas is used for production-ready, scalable persistence.

**TR:**
- **Birim Testleri:** Zorunlu testler `CommissionService` senaryolarını ve `TransactionService` aşama geçişlerini kapsar.
- **Hata Yönetimi:** Küresel filtreler, kural ihlalleri için kullanıcı dostu hata mesajları (400) döndürürken, iç sistem hatalarını (500) güvenli bir şekilde saklayan `BusinessException` yapısını kullanır.
- **Veritabanı:** Üretim düzeyinde, ölçeklenebilir veri saklama için MongoDB Atlas kullanılır.

---

## 8. API Documentation (OpenAPI) / API Dokümantasyonu

**EN:** The system exposes a live Swagger UI at `/api/docs` (if enabled in development) for real-time API testing and exploration.
**TR:** Sistem, API testi ve incelemesi için `/api/docs` adresinde (geliştirme modunda aktifse) canlı bir Swagger arayüzü sunar.

---

## 9. Frontend-Backend Synergy / Frontend-Backend Sinerjisi

### Contract-First Type Safety / Tip Güvenliği
**EN:** Frontend types and enums (e.g., `TransactionStage`, `AgentRole`) are manually mirrored from the Backend DTOs. This ensures strict contract adherence across the network boundary, catching potential data mismatch errors during development.
**TR:** Frontend tipleri ve enum'ları (`TransactionStage`, `AgentRole`), Backend DTO'larından manuel olarak aynalanmıştır. Bu, ağ sınırı genelinde katı bir sözleşme uyumu sağlayarak geliştirme sırasında olası veri uyuşmazlığı hatalarını yakalar.

### API Integration & Error Handling / API Entegrasyonu ve Hata Yönetimi
**EN:**
- **Centralized Fetch (`useApiFetch`):** All communication goes through a custom wrapper that injects the `baseURL` and handles global response interceptors.
- **Exception Surfacing:** Backend `BusinessException` responses are caught by store actions and surfaced to the UI via a reactive error state, ensuring that business rule violations (e.g., "Invalid stage transition") are clearly explained to the user.

### 9.3 Financial Traceability (The "Why") / Finansal İzlenebilirlik (Neden Gereksinimi)
**EN:** The UI explicitly maps backend roles (`listing`, `selling`) to human-readable justifications, ensuring full traceability of why each share was earned.
**TR:** UI, backend rollerini (`listing`, `selling`) okunabilir etiketlere eşleyerek her payın neden kazanıldığını açıkça gerekçelendirir.

**TR:**
- **Merkezi Veri Çekme (`useApiFetch`):** Tüm iletişim, `baseURL` enjekte eden ve global yanıt yakalayıcıları (interceptors) yöneten özel bir sarmalayıcı üzerinden geçer.
- **Hataların Yüzeye Çıkarılması:** Backend `BusinessException` yanıtları, store aksiyonları tarafından yakalanır ve reaktif bir hata durumu aracılığıyla UI'da gösterilir; böylece iş kuralı ihlalleri (örn. "Geçersiz aşama geçişi") kullanıcıya net bir şekilde açıklanır.

---

## 10. Engineering for Reliability / Güvenilirlik Mühendisliği

### RBAC & Route Guarding / RBAC ve Rota Koruması
**EN:**
- **Global Auth Middleware:** We use a global route middleware (`auth.global.ts`) as a security gatekeeper. It validates the user's session via cookies on every navigation, ensuring that protected routes (dashboard, transactions) are inaccessible to unauthenticated users.
- **RBAC UI Logic:** The UI dynamically hides/shows management features based on the current user's role (`admin` vs `agent`), fulfilling role-based visibility requirements.

**TR:**
- **Global Kimlik Doğrulama Middleware:** Bir güvenlik kapısı olarak global rota middleware'i (`auth.global.ts`) kullanıyoruz. Her navigasyonda kullanıcının oturumunu cookie'ler üzerinden doğrulayarak, korumalı rotaların (dashboard, işlemler) yetkisiz kullanıcılar tarafından erişilmesini engeller.
- **RBAC UI Mantığı:** UI, mevcut kullanıcının rolüne göre (`admin` vs `agent`) yönetim özelliklerini dinamik olarak gizler veya gösterir, böylece rol tabanlı görünürlük gereksinimlerini karşılar.

### Loading & Race Condition Management / Yükleme ve Yarış Durumu Yönetimi
**EN:** Pinia stores track the `loading` state for every async action. This is used in the UI to disable buttons and show spinners, preventing duplicate API calls and race conditions during stage transitions or form submissions.
**TR:** Pinia store'ları, her asenkron işlem için `loading` durumunu takip eder. Bu durum UI'da butonları devre dışı bırakmak ve yükleme ikonları göstermek için kullanılır; böylece aşama geçişleri veya form gönderimleri sırasında mükerrer API çağrıları ve "race condition" (yarış durumu) hataları önlenir.
