// background/service-worker.js - 기본 버전

console.log('3D Button Effects Service Worker 시작');

// 확장 프로그램 설치 시 기본 설정
chrome.runtime.onInstalled.addListener(() => {
    console.log('3D Button Effects 확장 프로그램이 설치되었습니다.');
    
    // 기본 설정 저장
    chrome.storage.sync.set({
        enabled: true,
        style: 'auto',
        intensity: 2,
        excludedSites: []
    });
});

// 탭 업데이트 감지 (나중에 필요시 사용)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        console.log('페이지 로드 완료:', tab.url);
    }
});

// 메시지 처리 (현재는 기본만)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Service Worker 메시지 수신:', request);
    
    if (request.action === 'getSettings') {
        chrome.storage.sync.get(['enabled', 'style', 'intensity', 'excludedSites'], (result) => {
            sendResponse(result);
        });
        return true;
    }
    
    sendResponse({success: true});
});