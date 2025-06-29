// content.js - 업데이트된 3D Button Effects 핵심 로직

// 전역 상태 관리
let isEnabled = true;
let currentStyle = 'auto';
let currentIntensity = 2;
let excludedSites = [];
let processedButtons = new Set();
let siteDesignSystem = null; // 사이트 전체 분석 결과 캐시

// 초기화
(function init() {
    console.log('3D Button Effects 확장 프로그램 시작 (업데이트된 버전)');
    
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
        
        console.log('설정 로드 완료:', { isEnabled, currentStyle, currentIntensity });
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
    
    console.log('새로운 버튼 3D 효과 적용 시작');
    
    // 사이트 전체 분석 (한 번만)
    analyzeSiteOnce().then(() => {
        // 초기 버튼 처리
        enhanceAllButtons();
        
        // 동적으로 추가되는 버튼들을 위한 Observer 설정
        setupMutationObserver();
        
        // 스크롤 최적화를 위한 Intersection Observer 설정
        setupIntersectionObserver();
    });
}

// 사이트 분석 (한 번만 실행)
async function analyzeSiteOnce() {
    if (siteDesignSystem) return; // 이미 분석됨
    
    try {
        console.log('사이트 디자인 시스템 분석 중...');
        siteDesignSystem = window.siteAnalyzer.analyzeSiteDesignSystem();
        console.log('사이트 분석 완료:', siteDesignSystem);
    } catch (error) {
        console.error('사이트 분석 실패:', error);
        // 기본값 설정
        siteDesignSystem = {
            category: 'general',
            theme: 'light',
            primaryColors: ['rgb(59, 130, 246)', 'rgb(255, 255, 255)'],
            framework: 'custom'
        };
    }
}

// 모든 버튼에 3D 효과 적용
function enhanceAllButtons() {
    const buttons = findAllButtons();
    console.log(`${buttons.length}개의 버튼을 발견했습니다.`);
    
    buttons.forEach(button => enhanceButton(button));
}

// 버튼 요소 찾기 (기존과 동일)
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

// 개별 버튼에 3D 효과 적용 (업데이트된 버전)
function enhanceButton(button) {
    if (processedButtons.has(button)) return;
    
    try {
        console.log('버튼 분석 시작:', button);
        
        // 1. 버튼 스타일 상세 분석
        const buttonAnalysis = window.siteAnalyzer.analyzeButtonStyle(button);
        console.log('버튼 분석 결과:', buttonAnalysis);
        
        // 2. 스타일 추천
        let recommendation;
        if (currentStyle === 'auto') {
            recommendation = window.styleRecommender.recommendOptimalStyle(
                buttonAnalysis, 
                siteDesignSystem,
                { intensity: currentIntensity }
            );
            console.log('스타일 추천 결과:', recommendation);
        } else {
            // 수동 스타일 선택
            recommendation = {
                primaryStyle: currentStyle,
                intensity: currentIntensity,
                customizations: window.styleRecommender.generateCustomizations(buttonAnalysis, siteDesignSystem),
                reasoning: [`사용자가 ${currentStyle} 스타일을 선택했습니다`]
            };
        }
        
        // 3. 향상된 3D 효과 적용
        applyEnhanced3DEffect(button, buttonAnalysis, recommendation);
        
        // 4. 처리 완료 표시
        processedButtons.add(button);
        
        console.log(`버튼에 ${recommendation.primaryStyle} 스타일 적용 완료:`, button);
        
    } catch (error) {
        console.error('버튼 처리 중 오류:', error, button);
        // 폴백: 기본 효과 적용
        applyBasic3DEffect(button);
        processedButtons.add(button);
    }
}

// 향상된 3D 효과 적용 (기존 스타일 존중)
function applyEnhanced3DEffect(button, buttonAnalysis, recommendation) {
    // 기본 클래스 추가
    button.classList.add('btn-3d-enhanced');
    
    // 추천된 스타일 클래스 추가
    button.classList.add(`btn-3d-${recommendation.primaryStyle}`);
    
    // 강도 클래스 추가
    const intensity = recommendation.intensity || currentIntensity;
    button.classList.add(`btn-3d-intensity-${intensity}`);
    
    // 중요도 클래스 추가
    const importance = calculateButtonImportance(buttonAnalysis);
    if (importance > 80) {
        button.classList.add('btn-3d-priority-high');
    } else if (importance > 50) {
        button.classList.add('btn-3d-priority-medium');
    }
    
    // 기존 스타일 보존을 위한 커스텀 속성 설정
    applyCustomizations(button, buttonAnalysis, recommendation.customizations);
    
    // 접근성 속성 추가
    if (!button.getAttribute('aria-label') && button.textContent.trim()) {
        button.setAttribute('aria-enhanced', '3d-effect');
    }
}

// 커스터마이징 적용 (기존 스타일 보존)
function applyCustomizations(button, buttonAnalysis, customizations) {
    if (!customizations) return;
    
    // 기존 색상 보존
    if (customizations.preserveOriginalColors && buttonAnalysis.backgroundColor) {
        const bgRGB = window.siteAnalyzer.extractRGBValues(buttonAnalysis.backgroundColor);
        if (bgRGB) {
            button.style.setProperty('--original-bg-r', bgRGB.r);
            button.style.setProperty('--original-bg-g', bgRGB.g);
            button.style.setProperty('--original-bg-b', bgRGB.b);
            button.style.setProperty('--original-bg-color', buttonAnalysis.backgroundColor);
        }
    }
    
    // 기존 테두리 반경 보존
    if (customizations.respectBorderRadius && buttonAnalysis.borderRadius > 0) {
        button.style.setProperty('--original-border-radius', `${buttonAnalysis.borderRadius}px`);
    }
    
    // 기존 그림자와 블렌딩
    if (customizations.adaptToExistingShadow && buttonAnalysis.characteristics.hasExistingShadow) {
        button.style.setProperty('--original-shadow', buttonAnalysis.boxShadow);
        button.classList.add('btn-3d-blend-shadow');
    }
    
    // 기존 패딩 보존 (레이아웃 깨지지 않도록)
    const padding = buttonAnalysis.padding;
    button.style.setProperty('--original-padding-top', `${padding.top}px`);
    button.style.setProperty('--original-padding-right', `${padding.right}px`);
    button.style.setProperty('--original-padding-bottom', `${padding.bottom}px`);
    button.style.setProperty('--original-padding-left', `${padding.left}px`);
    
    // 기존 폰트 크기 보존
    if (buttonAnalysis.fontSize) {
        button.style.setProperty('--original-font-size', `${buttonAnalysis.fontSize}px`);
    }
    
    // 커스텀 속성들 적용
    if (customizations.customProperties) {
        Object.entries(customizations.customProperties).forEach(([property, value]) => {
            button.style.setProperty(property, value);
        });
    }
    
    // 중요도 및 강도 설정
    const importance = calculateButtonImportance(buttonAnalysis);
    button.style.setProperty('--btn-3d-importance', importance);
    button.style.setProperty('--btn-3d-intensity', customizations.intensity || currentIntensity);
    
    // 테마별 조정
    if (siteDesignSystem.theme === 'dark') {
        button.classList.add('btn-3d-dark-theme');
    }
    
    // 기존 스타일 특성에 따른 조정
    if (buttonAnalysis.characteristics.isFlat) {
        button.classList.add('btn-3d-flat-base');
    }
    
    if (buttonAnalysis.characteristics.isRounded) {
        button.classList.add('btn-3d-rounded-base');
    }
    
    if (buttonAnalysis.characteristics.hasGradient) {
        button.classList.add('btn-3d-gradient-base');
    }
    
    if (buttonAnalysis.characteristics.isTransparent) {
        button.classList.add('btn-3d-transparent-base');
    }
}

// 버튼 중요도 계산 (개선된 버전)
function calculateButtonImportance(buttonAnalysis) {
    let importance = 0;
    
    // 크기 기반 점수 (30점)
    const area = buttonAnalysis.width * buttonAnalysis.height;
    importance += Math.min(30, (area / 500)); // 500px² 당 1점
    
    // 위치 기반 점수 (30점)
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    // 상단/중앙에 위치할수록 높은 점수
    const topScore = Math.max(0, 15 - (buttonAnalysis.position.y / viewportHeight * 15));
    const centerScore = Math.max(0, 15 - Math.abs(buttonAnalysis.position.centerX - viewportWidth/2) / (viewportWidth/2) * 15);
    importance += topScore + centerScore;
    
    // 텍스트 기반 점수 (40점)
    const buttonText = buttonAnalysis.element?.textContent?.trim().toLowerCase() || '';
    const importantKeywords = {
        high: ['buy', 'purchase', 'order', 'checkout', 'pay', 'subscribe', 'sign up', 'register', 'login', 'download', 'start', 'begin',
               '구매', '주문', '결제', '가입', '회원가입', '로그인', '다운로드', '시작', '등록', '신청'],
        medium: ['learn more', 'read more', 'view', 'see', 'explore', 'discover', 'try', 'demo', 'free trial',
                 '더보기', '자세히', '보기', '시도', '탐색', '확인', '체험', '무료'],
        low: ['cancel', 'close', 'skip', 'maybe later', 'no thanks', 'back', 'previous',
              '취소', '닫기', '건너뛰기', '나중에', '아니오', '뒤로', '이전']
    };
    
    if (importantKeywords.high.some(keyword => buttonText.includes(keyword))) {
        importance += 40;
    } else if (importantKeywords.medium.some(keyword => buttonText.includes(keyword))) {
        importance += 25;
    } else if (importantKeywords.low.some(keyword => buttonText.includes(keyword))) {
        importance += 5;
    } else {
        importance += 15; // 기본 점수
    }
    
    return Math.min(100, importance);
}

// 기본 3D 효과 적용 (폴백용)
function applyBasic3DEffect(button) {
    button.classList.add('btn-3d-enhanced');
    button.classList.add('btn-3d-classic'); // 안전한 기본 스타일
    button.classList.add(`btn-3d-intensity-${currentIntensity}`);
}

// 동적 버튼 감지를 위한 MutationObserver (기존과 동일하지만 향상된 처리)
function setupMutationObserver() {
    const observer = new MutationObserver((mutations) => {
        let hasNewButtons = false;
        
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const newButtons = node.querySelectorAll ? 
                            Array.from(node.querySelectorAll('button, input[type="button"], input[type="submit"], [role="button"], .btn, .button')) : 
                            [];
                        
                        if (node.matches && node.matches('button, input[type="button"], input[type="submit"], [role="button"], .btn, .button')) {
                            newButtons.push(node);
                        }
                        
                        if (newButtons.length > 0) {
                            hasNewButtons = true;
                            // 약간의 지연을 두고 처리 (DOM 안정화 대기)
                            setTimeout(() => {
                                newButtons.forEach(button => {
                                    if (isElementVisible(button) && !processedButtons.has(button)) {
                                        enhanceButton(button);
                                    }
                                });
                            }, 100);
                        }
                    }
                });
            }
        });
        
        if (hasNewButtons) {
            console.log('새로운 버튼들이 감지되어 향상된 3D 효과를 적용했습니다.');
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// 성능 최적화를 위한 Intersection Observer (기존과 동일)
function setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            const button = entry.target;
            
            if (entry.isIntersecting) {
                button.classList.add('btn-3d-visible');
            } else {
                button.classList.remove('btn-3d-visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '50px'
    });
    
    // 처리된 버튼들을 관찰 대상에 추가
    processedButtons.forEach(button => {
        observer.observe(button);
    });
    
    // 새로 추가되는 버튼들도 자동으로 관찰
    const originalAdd = processedButtons.add;
    processedButtons.add = function(button) {
        originalAdd.call(this, button);
        observer.observe(button);
        return this;
    };
}

// 팝업으로부터의 메시지 처리 (업데이트된 버전)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('메시지 수신:', request);
    
    switch (request.action) {
        case 'toggle':
            isEnabled = request.enabled;
            if (isEnabled) {
                // 사이트 다시 분석 후 적용
                siteDesignSystem = null; // 캐시 초기화
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
            sendResponse({ count: processedButtons.size });
            break;
            
        case 'getButtonInfo':
            // 디버깅용: 처리된 버튼들의 정보 반환
            const buttonInfo = Array.from(processedButtons).map(button => ({
                text: button.textContent.trim(),
                classes: Array.from(button.classList),
                position: button.getBoundingClientRect()
            }));
            sendResponse({ buttons: buttonInfo });
            break;
    }
    
    return true;
});

// 모든 효과 제거 (업데이트된 버전)
function removeAllEffects() {
    processedButtons.forEach(button => {
        // 추가된 클래스들 제거
        const classesToRemove = Array.from(button.classList).filter(className => 
            className.startsWith('btn-3d-')
        );
        
        classesToRemove.forEach(className => {
            button.classList.remove(className);
        });
        
        // 커스텀 CSS 속성들 제거
        const stylesToRemove = [
            '--original-bg-r', '--original-bg-g', '--original-bg-b', '--original-bg-color',
            '--original-border-radius', '--original-shadow', '--original-padding-top',
            '--original-padding-right', '--original-padding-bottom', '--original-padding-left',
            '--original-font-size', '--btn-3d-intensity', '--btn-3d-importance'
        ];
        
        stylesToRemove.forEach(property => {
            button.style.removeProperty(property);
        });
        
        // aria 속성 제거
        if (button.getAttribute('aria-enhanced') === '3d-effect') {
            button.removeAttribute('aria-enhanced');
        }
    });
    
    processedButtons.clear();
    console.log('모든 3D 효과가 제거되었습니다.');
}

// 모든 버튼 스타일 업데이트 (향상된 버전)
function updateAllButtonStyles() {
    processedButtons.forEach(button => {
        // 기존 스타일 클래스 제거
        const styleClasses = ['btn-3d-classic', 'btn-3d-neon', 'btn-3d-glass', 'btn-3d-metallic'];
        styleClasses.forEach(className => button.classList.remove(className));
        
        // 새 스타일 결정 및 적용
        if (currentStyle === 'auto') {
            try {
                const buttonAnalysis = window.siteAnalyzer.analyzeButtonStyle(button);
                const recommendation = window.styleRecommender.recommendOptimalStyle(
                    buttonAnalysis, 
                    siteDesignSystem,
                    { intensity: currentIntensity }
                );
                button.classList.add(`btn-3d-${recommendation.primaryStyle}`);
            } catch (error) {
                console.error('스타일 업데이트 중 오류:', error);
                button.classList.add('btn-3d-classic'); // 폴백
            }
        } else {
            button.classList.add(`btn-3d-${currentStyle}`);
        }
    });
    
    console.log(`${processedButtons.size}개 버튼의 스타일이 업데이트되었습니다.`);
}

// 모든 버튼 강도 업데이트 (기존과 동일)
function updateAllButtonIntensity() {
    processedButtons.forEach(button => {
        // 기존 강도 클래스 제거
        ['btn-3d-intensity-1', 'btn-3d-intensity-2', 'btn-3d-intensity-3'].forEach(className => {
            button.classList.remove(className);
        });
        
        // 새 강도 적용
        button.classList.add(`btn-3d-intensity-${currentIntensity}`);
        button.style.setProperty('--btn-3d-intensity', currentIntensity);
    });
    
    console.log(`${processedButtons.size}개 버튼의 강도가 ${currentIntensity}로 업데이트되었습니다.`);
}

console.log('업데이트된 3D Button Effects content.js 로드 완료');