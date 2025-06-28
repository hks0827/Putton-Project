// content.js - 3D Button Effects 핵심 로직

// 전역 상태 관리
let isEnabled = true;
let currentStyle = 'auto';
let currentIntensity = 2;
let excludedSites = [];
let processedButtons = new Set();

// 초기화
(function init() {
    console.log('3D Button Effects 확장 프로그램 시작');
    
    // 설정 로드
    loadSettings().then(() => {
        // 현재 사이트가 제외 목록에 있는지 확인
        if (isCurrentSiteExcluded()) {
            console.log('현재 사이트는 제외 목록에 있습니다.');
            return;
        }
        
        // DOM 준비 완료 후 실행
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', startButtonEnhancement);
        } else {
            startButtonEnhancement();
        }
    });
})();

// 설정 로드
async function loadSettings() {
    try {
        const settings = await chrome.storage.sync.get({
            enabled: true,
            style: 'auto',
            intensity: 2,
            excludedSites: []
        });
        
        isEnabled = settings.enabled;
        currentStyle = settings.style;
        currentIntensity = settings.intensity;
        excludedSites = settings.excludedSites;
    } catch (error) {
        console.error('설정 로드 실패:', error);
    }
}

// 현재 사이트가 제외 목록에 있는지 확인
function isCurrentSiteExcluded() {
    const hostname = window.location.hostname;
    return excludedSites.some(site => hostname.includes(site));
}

// 버튼 향상 기능 시작
function startButtonEnhancement() {
    if (!isEnabled) return;
    
    console.log('버튼 3D 효과 적용 시작');
    
    // 초기 버튼 처리
    enhanceAllButtons();
    
    // 동적으로 추가되는 버튼들을 위한 Observer 설정
    setupMutationObserver();
    
    // 스크롤 최적화를 위한 Intersection Observer 설정
    setupIntersectionObserver();
}

// 모든 버튼에 3D 효과 적용
function enhanceAllButtons() {
    const buttons = findAllButtons();
    console.log(`${buttons.length}개의 버튼을 발견했습니다.`);
    
    buttons.forEach(button => enhanceButton(button));
}

// 버튼 요소 찾기 (포괄적인 셀렉터)
function findAllButtons() {
    const selectors = [
        'button',
        'input[type="button"]',
        'input[type="submit"]',
        'input[type="reset"]',
        '[role="button"]',
        '.btn',
        '.button',
        'a[class*="btn"]',
        'a[class*="button"]',
        '[class*="cta"]',
        '[class*="call-to-action"]'
    ];
    
    const allButtons = [];
    
    selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            // 이미 처리된 버튼이 아니고, 숨겨져 있지 않은 경우만 추가
            if (!processedButtons.has(el) && isElementVisible(el)) {
                allButtons.push(el);
            }
        });
    });
    
    return allButtons;
}

// 요소가 보이는지 확인
function isElementVisible(element) {
    const style = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           style.opacity !== '0' &&
           rect.width > 0 && 
           rect.height > 0;
}

// 개별 버튼에 3D 효과 적용
function enhanceButton(button) {
    if (processedButtons.has(button)) return;
    
    try {
        // 버튼 분석
        const buttonAnalysis = analyzeButton(button);
        
        // 스타일 결정
        let selectedStyle = currentStyle;
        if (currentStyle === 'auto') {
            selectedStyle = recommendStyle(buttonAnalysis);
        }
        
        // 3D 효과 적용
        applyButtonEffect(button, selectedStyle, buttonAnalysis);
        
        // 처리 완료 표시
        processedButtons.add(button);
        
        console.log(`버튼에 ${selectedStyle} 스타일 적용:`, button);
        
    } catch (error) {
        console.error('버튼 처리 중 오류:', error, button);
    }
}

// 버튼 분석 함수
function analyzeButton(button) {
    const computedStyle = window.getComputedStyle(button);
    const rect = button.getBoundingClientRect();
    
    // 색상 분석
    const backgroundColor = computedStyle.backgroundColor;
    const color = computedStyle.color;
    const borderColor = computedStyle.borderColor;
    
    // 크기 분석
    const area = rect.width * rect.height;
    const aspectRatio = rect.width / rect.height;
    
    // 위치 분석 (뷰포트 기준)
    const positionScore = calculatePositionImportance(rect);
    
    // 텍스트 분석
    const buttonText = button.textContent.trim().toLowerCase();
    const textImportance = calculateTextImportance(buttonText);
    
    // 스타일 특성 분석
    const borderRadius = parseFloat(computedStyle.borderRadius) || 0;
    const isFlat = computedStyle.boxShadow === 'none';
    const hasGradient = backgroundColor.includes('gradient');
    
    return {
        backgroundColor,
        color,
        borderColor,
        area,
        aspectRatio,
        positionScore,
        textImportance,
        borderRadius,
        isFlat,
        hasGradient,
        text: buttonText,
        rect,
        element: button
    };
}

// 위치 중요도 계산
function calculatePositionImportance(rect) {
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    // 상단에 위치할수록 높은 점수
    const topScore = (viewportHeight - rect.top) / viewportHeight * 30;
    
    // 중앙에 위치할수록 높은 점수
    const centerX = viewportWidth / 2;
    const distanceFromCenterX = Math.abs(rect.left + rect.width / 2 - centerX);
    const centerScore = (1 - distanceFromCenterX / centerX) * 20;
    
    // 크기 점수
    const sizeScore = Math.min(rect.width * rect.height / 10000, 25);
    
    return Math.min(topScore + centerScore + sizeScore, 100);
}

// 텍스트 중요도 계산
function calculateTextImportance(text) {
    const importantKeywords = {
        // 높은 중요도
        high: ['buy', 'purchase', 'order', 'checkout', 'pay', 'subscribe', 'sign up', 'register', 'login', 'download',
               '구매', '주문', '결제', '가입', '회원가입', '로그인', '다운로드', '시작', '등록'],
        // 중간 중요도  
        medium: ['learn more', 'read more', 'view', 'see', 'explore', 'discover', 'try', 'start',
                 '더보기', '자세히', '보기', '시도', '탐색', '확인'],
        // 낮은 중요도
        low: ['cancel', 'close', 'skip', 'maybe later', 'no thanks',
              '취소', '닫기', '건너뛰기', '나중에', '아니오']
    };
    
    if (importantKeywords.high.some(keyword => text.includes(keyword))) return 30;
    if (importantKeywords.medium.some(keyword => text.includes(keyword))) return 20;
    if (importantKeywords.low.some(keyword => text.includes(keyword))) return 5;
    
    return 10; // 기본 점수
}

// 스타일 추천 로직
function recommendStyle(analysis) {
    let scores = {
        classic: 0,
        neon: 0,
        glass: 0,
        metallic: 0
    };
    
    // 중요도에 따른 점수
    if (analysis.positionScore > 70 || analysis.textImportance > 25) {
        scores.neon += 30;
        scores.metallic += 20;
    }
    
    // 색상에 따른 점수
    if (analysis.backgroundColor.includes('rgb')) {
        const rgb = extractRGBValues(analysis.backgroundColor);
        if (rgb) {
            const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
            
            if (brightness < 100) {
                // 어두운 버튼
                scores.neon += 25;
                scores.glass += 15;
            } else if (brightness > 200) {
                // 밝은 버튼
                scores.classic += 25;
                scores.metallic += 20;
            } else {
                // 중간 밝기
                scores.glass += 30;
                scores.classic += 20;
            }
        }
    }
    
    // 형태에 따른 점수
    if (analysis.borderRadius > 10) {
        scores.glass += 20;
        scores.neon += 15;
    } else {
        scores.classic += 15;
        scores.metallic += 20;
    }
    
    // 크기에 따른 점수
    if (analysis.area > 5000) {
        scores.metallic += 15;
        scores.neon += 10;
    }
    
    // 가장 높은 점수의 스타일 반환
    const bestStyle = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
    
    console.log('스타일 점수:', scores, '선택된 스타일:', bestStyle);
    return bestStyle;
}

// RGB 값 추출
function extractRGBValues(rgbString) {
    const match = rgbString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
        return {
            r: parseInt(match[1]),
            g: parseInt(match[2]),
            b: parseInt(match[3])
        };
    }
    return null;
}

// 버튼에 3D 효과 적용
function applyButtonEffect(button, style, analysis) {
    // 기본 클래스 추가
    button.classList.add('btn-3d-enhanced');
    
    // 강도별 클래스 추가
    button.classList.add(`btn-3d-intensity-${currentIntensity}`);
    
    // 스타일별 클래스 추가
    button.classList.add(`btn-3d-${style}`);
    
    // 중요도에 따른 추가 클래스
    if (analysis.positionScore > 80 || analysis.textImportance > 25) {
        button.classList.add('btn-3d-priority-high');
    } else if (analysis.positionScore > 50 || analysis.textImportance > 15) {
        button.classList.add('btn-3d-priority-medium');
    }
    
    // 커스텀 CSS 속성 설정 (동적 조정용)
    button.style.setProperty('--btn-3d-intensity', currentIntensity);
    button.style.setProperty('--btn-3d-importance', analysis.positionScore + analysis.textImportance);
}

// 동적 버튼 감지를 위한 MutationObserver
function setupMutationObserver() {
    const observer = new MutationObserver((mutations) => {
        let hasNewButtons = false;
        
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // 추가된 노드가 버튼이거나 버튼을 포함하는 경우
                        const newButtons = node.querySelectorAll ? 
                            Array.from(node.querySelectorAll('button, input[type="button"], input[type="submit"], [role="button"]')) : 
                            [];
                        
                        if (node.matches && node.matches('button, input[type="button"], input[type="submit"], [role="button"]')) {
                            newButtons.push(node);
                        }
                        
                        if (newButtons.length > 0) {
                            hasNewButtons = true;
                            newButtons.forEach(button => {
                                if (isElementVisible(button) && !processedButtons.has(button)) {
                                    enhanceButton(button);
                                }
                            });
                        }
                    }
                });
            }
        });
        
        if (hasNewButtons) {
            console.log('새로운 버튼들이 감지되어 3D 효과를 적용했습니다.');
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// 성능 최적화를 위한 Intersection Observer
function setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            const button = entry.target;
            
            if (entry.isIntersecting) {
                // 뷰포트에 들어오면 애니메이션 활성화
                button.classList.add('btn-3d-visible');
            } else {
                // 뷰포트에서 나가면 애니메이션 최소화 (성능 향상)
                button.classList.remove('btn-3d-visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '50px'
    });
    
    // 기존 버튼들을 관찰 대상에 추가
    processedButtons.forEach(button => {
        observer.observe(button);
    });
}

// 팝업으로부터의 메시지 처리
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('메시지 수신:', request);
    
    switch (request.action) {
        case 'toggle':
            isEnabled = request.enabled;
            if (isEnabled) {
                enhanceAllButtons();
            } else {
                removeAllEffects();
            }
            break;
            
        case 'changeStyle':
            currentStyle = request.style;
            updateAllButtonStyles();
            break;
            
        case 'changeIntensity':
            currentIntensity = request.intensity;
            updateAllButtonIntensity();
            break;
            
        case 'disable':
            removeAllEffects();
            break;
            
        case 'getButtonCount':
            const buttonCount = processedButtons.size;
            sendResponse({ count: buttonCount });
            break;
    }
    
    return true;
});

// 모든 효과 제거
function removeAllEffects() {
    processedButtons.forEach(button => {
        button.classList.remove(
            'btn-3d-enhanced',
            'btn-3d-classic',
            'btn-3d-neon', 
            'btn-3d-glass',
            'btn-3d-metallic',
            'btn-3d-intensity-1',
            'btn-3d-intensity-2',
            'btn-3d-intensity-3',
            'btn-3d-priority-high',
            'btn-3d-priority-medium',
            'btn-3d-visible'
        );
        
        // 커스텀 CSS 속성 제거
        button.style.removeProperty('--btn-3d-intensity');
        button.style.removeProperty('--btn-3d-importance');
    });
    
    processedButtons.clear();
}

// 모든 버튼 스타일 업데이트
function updateAllButtonStyles() {
    processedButtons.forEach(button => {
        // 기존 스타일 클래스 제거
        button.classList.remove('btn-3d-classic', 'btn-3d-neon', 'btn-3d-glass', 'btn-3d-metallic');
        
        // 새 스타일 적용
        const analysis = analyzeButton(button);
        let selectedStyle = currentStyle;
        if (currentStyle === 'auto') {
            selectedStyle = recommendStyle(analysis);
        }
        
        button.classList.add(`btn-3d-${selectedStyle}`);
    });
}

// 모든 버튼 강도 업데이트
function updateAllButtonIntensity() {
    processedButtons.forEach(button => {
        // 기존 강도 클래스 제거
        button.classList.remove('btn-3d-intensity-1', 'btn-3d-intensity-2', 'btn-3d-intensity-3');
        
        // 새 강도 적용
        button.classList.add(`btn-3d-intensity-${currentIntensity}`);
        button.style.setProperty('--btn-3d-intensity', currentIntensity);
    });
}