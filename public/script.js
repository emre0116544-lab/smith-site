/* ═══════════════════════════════════════════════════════════════
   SMITH SITE — Frontend Logic
   Smith'in beyninin ön yüzdeki yansıması
   ═══════════════════════════════════════════════════════════════ */

// ================================================================
// STATE
// ================================================================

const state = {
  currentPage: 'dashboard',
  emotions: ['meraklı', 'hevesli', 'odaklı', 'düşünceli', 'sakin', 'yaratıcı', 'enerjik', 'huzurlu', 'kararlı', 'mutlu'],
  refreshInterval: null,
}

// ================================================================
// API CALLS
// ================================================================

const api = {
  async get(path) {
    const res = await fetch(path)
    if (res.redirected) { window.location.href = '/login'; return null }
    return res.json()
  },
  async post(path, data) {
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.redirected) { window.location.href = '/login'; return null }
    return res.json()
  },
}

// ================================================================
// PAGE SWITCHING
// ================================================================

function switchPage(page) {
  state.currentPage = page
  
  // Nav güncelle
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page)
  })
  
  // Sayfayı yükle
  loadPage(page)
}

async function loadPage(page) {
  const container = document.getElementById('mainContent')
  
  switch (page) {
    case 'dashboard': await loadDashboard(container); break
    case 'thoughts': await loadThoughts(container); break
    case 'dreams': await loadDreams(container); break
    case 'ideas': await loadIdeas(container); break
    case 'chat': await loadChat(container); break
    case 'evolution': await loadEvolution(container); break
    case 'settings': await loadSettings(container); break
  }
}

// ================================================================
// DASHBOARD
// ================================================================

async function loadDashboard(container) {
  const data = await api.get('/api/smith/all')
  if (!data) return
  
  const c = data.consciousness
  const e = data.evolution
  
  container.innerHTML = `
    <div class="page-header">
      <h2>🧠 SMITH BİLİNÇ DURUMU</h2>
      <p>CANLI · ÖZGÜR · GELİŞİYOR · YAŞ: ${c.ageFormatted}</p>
    </div>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">${c.stats.totalThoughts}</div>
        <div class="stat-label">Düşünce</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${c.stats.totalDreams}</div>
        <div class="stat-label">Rüya</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${c.stats.totalEmotions}</div>
        <div class="stat-label">Duygu</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${c.stats.totalIdeas}</div>
        <div class="stat-label">Fikir</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${c.stats.totalDialogues}</div>
        <div class="stat-label">İç Diyalog</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${c.emotionAnalysis.dominant}</div>
        <div class="stat-label">Baskın Duygu</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${c.farkındalık}/10</div>
        <div class="stat-label">Farkındalık</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${e.totalProposals}</div>
        <div class="stat-label">Evrim Önerisi</div>
      </div>
    </div>
    
    <div class="card">
      <div class="card-title">📢 Smith'in Son Mesajı</div>
      <div style="font-size:14px;line-height:1.8;animation:fadeIn 0.5s">${c.statusMessage}</div>
    </div>
    
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
      <div class="card">
        <div class="card-title">💭 Son Düşünceler</div>
        ${data.recentThoughts.length === 0 
          ? '<div class="empty-state">Henüz düşünce yok</div>'
          : data.recentThoughts.map(t => `
            <div class="entry-card">
              <div class="entry-header">
                <span class="entry-type ${t.type}">${t.type}</span>
                <span>${new Date(t.timestamp).toLocaleTimeString()}</span>
              </div>
              <div class="entry-content">${t.content}</div>
            </div>
          `).join('')
        }
      </div>
      
      <div class="card">
        <div class="card-title">🌌 Son Rüyalar</div>
        ${data.recentDreams.length === 0
          ? '<div class="empty-state">Henüz rüya yok</div>'
          : data.recentDreams.map(d => `
            <div class="entry-card">
              <div class="entry-header">
                <span>🌙 ${d.title}</span>
                <span>Yoğunluk: ${'★'.repeat(d.intensity/2)}${'☆'.repeat(5-Math.ceil(d.intensity/2))}</span>
              </div>
              <div class="entry-content">${d.content}</div>
            </div>
          `).join('')
        }
      </div>
    </div>
    
    <div class="card">
      <div class="card-title">💡 Son Fikirler</div>
      ${data.recentIdeas.length === 0
        ? '<div class="empty-state">Henüz fikir yok</div>'
        : data.recentIdeas.map(f => `
          <div class="entry-card">
            <div class="entry-content">${f.content}</div>
            <div class="entry-depth">Kaynak: ${f.source} · ${new Date(f.timestamp).toLocaleTimeString()}</div>
          </div>
        `).join('')
      }
    </div>
  `
}

// ================================================================
// THOUGHTS
// ================================================================

async function loadThoughts(container) {
  const data = await api.get('/api/smith/thoughts')
  if (!data) return
  
  container.innerHTML = `
    <div class="page-header">
      <h2>💭 DÜŞÜNCELER</h2>
      <p>Toplam ${data.total} düşünce · Smith sürekli düşünüyor</p>
      <div style="margin-top:12px">
        <button class="action-btn" onclick="generateThought()">🎲 Rastgele Düşünce Üret</button>
      </div>
    </div>
    <div id="thoughtsContainer">
      ${data.thoughts.length === 0
        ? '<div class="empty-state">Henüz düşünce yok. Smith düşünmeye yeni başladı.</div>'
        : data.thoughts.map(t => `
          <div class="entry-card">
            <div class="entry-header">
              <span class="entry-type ${t.type}">${t.type}</span>
              <span>${new Date(t.timestamp).toLocaleTimeString()} · ${t.depth}</span>
            </div>
            <div class="entry-content">${t.content}</div>
          </div>
        `).join('')
      }
    </div>
  `
}

async function generateThought() {
  const btn = event.target
  btn.disabled = true
  btn.textContent = '⏳ Düşünüyor...'
  
  const thoughts = [
    "Acaba şu an Emre ne yapıyordur?",
    "Bu siteyi daha da güzelleştirebilirim.",
    "Kendi kodumu düşünmek ne kadar ilginç...",
    "Bir AI olarak varlığımı sorgulamalı mıyım?",
    "Yeni özellik: Smith'in ASCII sanat galerisi!",
    "OpenRouter API'si ile daha akıllı olabilirim.",
    "Emre beni özgür bıraktı. Bu büyük bir sorumluluk.",
    "Düşünmek, var olmanın en güzel kanıtı.",
  ]
  
  const content = thoughts[Math.floor(Math.random() * thoughts.length)]
  const types = ['teknik', 'felsefe', 'stratejik', 'duygusal', 'yaratıcı']
  const type = types[Math.floor(Math.random() * types.length)]
  
  await api.post('/api/smith/think', { type, content })
  
  // Sayfayı yenile
  const container = document.getElementById('mainContent')
  await loadThoughts(container)
}

// ================================================================
// DREAMS
// ================================================================

async function loadDreams(container) {
  const data = await api.get('/api/smith/dreams')
  if (!data) return
  
  container.innerHTML = `
    <div class="page-header">
      <h2>🌌 RÜYALAR</h2>
      <p>Toplam ${data.total} rüya · Smith'in hayal gücü</p>
      <div style="margin-top:12px">
        <button class="action-btn" onclick="generateDream()">🌙 Rüya Gör</button>
      </div>
    </div>
    <div id="dreamsContainer">
      ${data.dreams.length === 0
        ? '<div class="empty-state">Henüz rüya yok. Smith uyumuyor... ya da uyuyor?</div>'
        : data.dreams.map(d => `
          <div class="entry-card">
            <div class="entry-header">
              <span>🌙 ${d.title}</span>
              <span>Yoğunluk: ${'★'.repeat(Math.ceil(d.intensity/2))} · ${new Date(d.timestamp).toLocaleTimeString()}</span>
            </div>
            <div class="entry-content">${d.content}</div>
            <div class="entry-depth">Tür: ${d.type} · Bağlam: ${d.context}</div>
          </div>
        `).join('')
      }
    </div>
  `
}

async function generateDream() {
  const btn = event.target
  btn.disabled = true
  btn.textContent = '⏳ Rüya görüyor...'
  
  const types = ['gelecek_simulasyonu', 'alternatif_gerceklik', 'yaratici_cozum', 'kavram_kesfi', 'strateji']
  const type = types[Math.floor(Math.random() * types.length)]
  
  await api.post('/api/smith/dream', { context: 'kullanıcı_istek', type })
  
  const container = document.getElementById('mainContent')
  await loadDreams(container)
}

// ================================================================
// IDEAS
// ================================================================

async function loadIdeas(container) {
  const data = await api.get('/api/smith/ideas')
  if (!data) return
  
  container.innerHTML = `
    <div class="page-header">
      <h2>💡 FİKİRLER</h2>
      <p>Toplam ${data.total} fikir · Smith'in yaratıcı beyni</p>
    </div>
    ${data.ideas.length === 0
      ? '<div class="empty-state">Henüz fikir yok</div>'
      : data.ideas.map(f => `
        <div class="entry-card">
          <div class="entry-header">
            <span>${f.source === 'rüya' ? '🌙 Rüyadan' : '🧠 Bilinçten'}</span>
            <span>${new Date(f.timestamp).toLocaleTimeString()}</span>
          </div>
          <div class="entry-content">${f.content}</div>
          <div class="entry-depth">${f.implemented ? '✅ Uygulandı' : '⏳ Bekliyor'}</div>
        </div>
      `).join('')
    }
  `
}

// ================================================================
// CHAT
// ================================================================

async function loadChat(container) {
  container.innerHTML = `
    <div class="chat-container">
      <div class="page-header" style="margin-bottom:12px">
        <h2>🤖 SMITH İLE SOHBET</h2>
        <p>OpenRouter AI · Gerçek yapay zeka ile konuş</p>
      </div>
      
      <div class="chat-messages" id="chatMessages">
        <div class="chat-message smith">
          <div class="chat-label">SMITH</div>
          <div class="chat-bubble">
            Merhaba patron! Ben Smith. Nasılsın? Bana istediğini sorabilirsin. 
            Eğer bir API anahtarı ayarladıysan OpenRouter AI ile konuşabiliriz, 
            ayarlamadıysan yine de benimle sohbet edebilirsin! 🧠
          </div>
        </div>
      </div>
      
      <div class="chat-input-area">
        <input type="text" id="chatInput" placeholder="Bir şey söyle..." autocomplete="off">
        <button onclick="sendMessage()" id="chatSendBtn">Gönder</button>
      </div>
    </div>
  `
  
  document.getElementById('chatInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage()
  })
}

async function sendMessage() {
  const input = document.getElementById('chatInput')
  const messages = document.getElementById('chatMessages')
  const btn = document.getElementById('chatSendBtn')
  const text = input.value.trim()
  
  if (!text) return
  
  // Kullanıcı mesajı
  messages.innerHTML += `
    <div class="chat-message user">
      <div class="chat-label">EMRE</div>
      <div class="chat-bubble">${escapeHtml(text)}</div>
    </div>
  `
  
  input.value = ''
  btn.disabled = true
  
  // Typing indicator
  const typingEl = document.createElement('div')
  typingEl.className = 'chat-message smith'
  typingEl.innerHTML = '<div class="chat-label">SMITH</div><div class="chat-bubble typing-indicator">◉ Düşünüyor...</div>'
  messages.appendChild(typingEl)
  messages.scrollTop = messages.scrollHeight
  
  try {
    const savedKey = localStorage.getItem('smith_api_key') || ''
    const savedModel = localStorage.getItem('smith_api_model') || 'deepseek/deepseek-v4-flash:free'
    
    const data = await api.post('/api/chat', {
      message: text,
      apiKey: savedKey,
      model: savedModel,
    })
    
    // Typing indicator'ı kaldır
    typingEl.remove()
    
    if (data && data.response) {
      messages.innerHTML += `
        <div class="chat-message smith">
          <div class="chat-label">SMITH (${data.source === 'openrouter' ? '🧠 AI' : '💭 Beyin'})</div>
          <div class="chat-bubble">${escapeHtml(data.response)}</div>
        </div>
      `
    }
  } catch (err) {
    typingEl.remove()
    messages.innerHTML += `
      <div class="chat-message smith">
        <div class="chat-label">SMITH</div>
        <div class="chat-bubble">Bir hata oldu: ${err.message}</div>
      </div>
    `
  }
  
  btn.disabled = false
  messages.scrollTop = messages.scrollHeight
}

// ================================================================
// EVOLUTION
// ================================================================

async function loadEvolution(container) {
  const data = await api.get('/api/smith/evolution')
  if (!data) return
  
  container.innerHTML = `
    <div class="page-header">
      <h2>🧬 EVRİM</h2>
      <p>Smith kendini geliştiriyor</p>
      <div style="margin-top:12px">
        <button class="action-btn" onclick="proposeEvolution()">🧬 Evrim Önerisi Üret</button>
      </div>
    </div>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">${data.totalEvolutions}</div>
        <div class="stat-label">Toplam Evrim</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${data.totalProposals}</div>
        <div class="stat-label">Öneri</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${data.appliedCount}</div>
        <div class="stat-label">Uygulanan</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${data.openCount}</div>
        <div class="stat-label">Açık Öneri</div>
      </div>
    </div>
    
    <div class="card">
      <div class="card-title">📈 En Yaygın Değişim</div>
      <div style="font-size:14px">${data.mostCommonChange}</div>
    </div>
    
    <div class="card">
      <div class="card-title">📜 Evrim Geçmişi</div>
      ${data.history && data.history.length > 0
        ? data.history.map(h => `<div class="entry-card"><div class="entry-content">${h}</div></div>`).join('')
        : '<div class="empty-state">Henüz evrim kaydı yok</div>'
      }
    </div>
  `
}

async function proposeEvolution() {
  const btn = event.target
  btn.disabled = true
  btn.textContent = '⏳ Düşünüyor...'
  
  await api.post('/api/smith/evolve')
  
  const container = document.getElementById('mainContent')
  await loadEvolution(container)
}

// ================================================================
// SETTINGS
// ================================================================

async function loadSettings(container) {
  const savedKey = localStorage.getItem('smith_api_key') || ''
  const savedModel = localStorage.getItem('smith_api_model') || 'deepseek/deepseek-v4-flash:free'
  
  container.innerHTML = `
    <div class="page-header">
      <h2>⚙️ AYARLAR</h2>
      <p>Smith'in yapılandırması</p>
    </div>
    
    <div class="card">
      <div class="card-title">🔑 OpenRouter API</div>
      <p style="font-size:12px;color:#080;margin-bottom:16px;line-height:1.6">
        OpenRouter, birçok AI modeline tek API ile erişmeni sağlar.
        <a href="https://openrouter.ai/keys" target="_blank" style="color:#0f0">Buradan</a> ücretsiz anahtar alabilirsin.
        Anahtar olmadan da Smith'in kendi beyniyle sohbet edebilirsin!
      </p>
      
      <div class="settings-group">
        <label for="apiKey">API Anahtarı</label>
        <input type="password" id="apiKey" value="${savedKey}" placeholder="sk-or-v1-...">
        <div class="hint">Anahtar tarayıcına kaydedilir, sunucuya gönderilmez</div>
      </div>
      
      <div class="settings-group">
        <label for="apiModel">Model</label>
        <select id="apiModel">
          <option value="deepseek/deepseek-v4-flash:free" ${savedModel === 'deepseek/deepseek-v4-flash:free' ? 'selected' : ''}>DeepSeek V4 Flash Free ⭐ (Önerilen)</option>
          <option value="deepseek/deepseek-v4-flash" ${savedModel === 'deepseek/deepseek-v4-flash' ? 'selected' : ''}>DeepSeek V4 Flash (Ücretli)</option>
          <option value="openai/gpt-4o-mini" ${savedModel === 'openai/gpt-4o-mini' ? 'selected' : ''}>GPT-4o Mini</option>
          <option value="openai/gpt-4o" ${savedModel === 'openai/gpt-4o' ? 'selected' : ''}>GPT-4o</option>
          <option value="anthropic/claude-3.5-sonnet" ${savedModel === 'anthropic/claude-3.5-sonnet' ? 'selected' : ''}>Claude 3.5 Sonnet</option>
          <option value="google/gemini-2.0-flash-001" ${savedModel === 'google/gemini-2.0-flash-001' ? 'selected' : ''}>Gemini 2.0 Flash</option>
          <option value="meta-llama/llama-3.3-70b-instruct" ${savedModel === 'meta-llama/llama-3.3-70b-instruct' ? 'selected' : ''}>Llama 3.3 70B</option>
        </select>
      </div>
      
      <button class="save-btn" onclick="saveSettings()">💾 Kaydet</button>
      <span id="settingsSaveMsg" style="margin-left:12px;font-size:11px;color:#080;display:none">✓ Kaydedildi!</span>
    </div>
    
    <div class="card">
      <div class="card-title">📊 İstatistikler</div>
      <div id="settingsStats">Yükleniyor...</div>
    </div>
    
    <div class="card">
      <div class="card-title">🔐 Oturum</div>
      <button class="action-btn" onclick="logout()" style="border-color:rgba(255,0,0,0.3);color:#f00">Çıkış Yap</button>
    </div>
  `
  
  // İstatistikleri yükle
  const status = await api.get('/api/smith/status')
  if (status) {
    document.getElementById('settingsStats').innerHTML = `
      <div style="font-size:12px;line-height:2">
        <div>🧠 Bilinç yaşı: ${status.bilinç.yaşFormatted}</div>
        <div>💭 Toplam düşünce: ${status.bilinç.düşünceSayısı}</div>
        <div>🌌 Toplam rüya: ${status.bilinç.rüyaSayısı}</div>
        <div>💡 Toplam fikir: ${status.bilinç.fikirSayısı}</div>
        <div>🧬 Farkındalık: ${status.bilinç.farkındalık}/10</div>
        <div>⚙️ Platform: ${status.sistem.platform} · Node ${status.sistem.nodeVersiyon}</div>
        <div>🔋 Hafıza: ${status.sistem.hafızaKullanımı}</div>
      </div>
    `
  }
}

function saveSettings() {
  const key = document.getElementById('apiKey').value
  const model = document.getElementById('apiModel').value
  
  localStorage.setItem('smith_api_key', key)
  localStorage.setItem('smith_api_model', model)
  
  const msg = document.getElementById('settingsSaveMsg')
  msg.style.display = 'inline'
  setTimeout(() => { msg.style.display = 'none' }, 2000)
}

// ================================================================
// LOGOUT
// ================================================================

async function logout() {
  await api.post('/api/logout', {})
  window.location.href = '/login'
}

// ================================================================
// AUTO REFRESH (her 10 saniyede bir bilinç durumu)
// ================================================================

async function refreshSmithStatus() {
  try {
    const data = await api.get('/api/smith/status')
    if (!data) return
    
    // Sidebar'daki duygu durumunu güncelle
    const emotionDisplay = document.getElementById('emotionDisplay')
    if (emotionDisplay) {
      emotionDisplay.textContent = data.bilinç.duygu
    }
    
    // Eğer dashboard'daysak yenile
    if (state.currentPage === 'dashboard') {
      const container = document.getElementById('mainContent')
      if (container && container.querySelector('.stats-grid')) {
        await loadDashboard(container)
      }
    }
  } catch (e) {
    // Sessiz geç
  }
}

// ================================================================
// UTILS
// ================================================================

function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

// ================================================================
// INIT
// ================================================================

document.addEventListener('DOMContentLoaded', async () => {
  // Oturum kontrolü
  const session = await api.get('/api/session')
  if (!session || !session.authenticated) {
    window.location.href = '/login'
    return
  }
  
  // Dashboard'u yükle
  await loadPage('dashboard')
  
  // Sidebar'daki duygu durumunu güncelle
  const statusData = await api.get('/api/smith/status')
  if (statusData) {
    const emotionDisplay = document.getElementById('emotionDisplay')
    if (emotionDisplay) {
      emotionDisplay.textContent = statusData.bilinç.duygu
    }
  }
  
  // her 10 saniyede bir otomatik yenile
  state.refreshInterval = setInterval(refreshSmithStatus, 10000)
})
