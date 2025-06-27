// 팝업 초기화
document.addEventListener('DOMContentLoaded', async () => {
  await initializePopup();
  setupEventListeners();
});

async function initializePopup() {
  // 저장된 설정 불러오기
  const settings = await chrome.storage.sync.get({
    enabled: true,
    style: 'auto',
    intensity: 2,
    excludedSites: []
  });

  // UI 상태 설정
  document.getElementById('main-toggle').checked = settings.enabled;
  document.getElementById('intensity').value = settings.intensity;
  
  // 활성 스타일 버튼 표시
  document.querySelectorAll('.style-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.style === settings.style) {
      btn.classList.add('active');
    }
  });

  // 현재 탭의 버튼 개수 표시
  await updateButtonCount();
}

function setupEventListeners() {
  // 메인 토글
  document.getElementById('main-toggle').addEventListener('change', async (e) => {
    const enabled = e.target.checked;
    await chrome.storage.sync.set({ enabled });
    sendMessageToCurrentTab({ action: 'toggle', enabled });
  });

  // 스타일 선택
  document.querySelectorAll('.style-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      // 활성 버튼 변경
      document.querySelectorAll('.style-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const style = btn.dataset.style;
      await chrome.storage.sync.set({ style });
      sendMessageToCurrentTab({ action: 'changeStyle', style });
    });
  });

  // 강도 조절
  document.getElementById('intensity').addEventListener('input', async (e) => {
    const intensity = parseInt(e.target.value);
    await chrome.storage.sync.set({ intensity });
    sendMessageToCurrentTab({ action: 'changeIntensity', intensity });
  });

  // 사이트 제외
  document.getElementById('exclude-site').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const url = new URL(tab.url);
    const domain = url.hostname;

    const { excludedSites = [] } = await chrome.storage.sync.get('excludedSites');
    if (!excludedSites.includes(domain)) {
      excludedSites.push(domain);
      await chrome.storage.sync.set({ excludedSites });
      sendMessageToCurrentTab({ action: 'disable' });
      document.getElementById('exclude-site').textContent = '제외됨';
      document.getElementById('exclude-site').disabled = true;
    }
  });
}

async function sendMessageToCurrentTab(message) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await chrome.tabs.sendMessage(tab.id, message);
  } catch (error) {
    console.log('메시지 전송 실패:', error);
  }
}

async function updateButtonCount() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'getButtonCount' });
    
    if (response && response.count !== undefined) {
      document.getElementById('button-count').textContent = `버튼 ${response.count}개 발견`;
    }
  } catch (error) {
    document.getElementById('button-count').textContent = '버튼 수를 가져올 수 없음';
  }
}