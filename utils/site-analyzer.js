// utils/site-analyzer.js - 임시 버전 (나중에 개선)

// 현재는 기본 기능만 제공
console.log('Site Analyzer 로드됨');

// 나중에 구현할 함수들의 임시 버전
function detectSiteCategory() {
    const hostname = window.location.hostname;
    
    if (hostname.includes('shop') || hostname.includes('buy') || hostname.includes('store')) {
        return 'ecommerce';
    } else if (hostname.includes('github') || hostname.includes('gitlab')) {
        return 'development';
    } else if (hostname.includes('google') || hostname.includes('microsoft')) {
        return 'corporate';
    }
    
    return 'general';
}

function extractDominantColors() {
    // 임시: 기본 색상 반환
    return ['rgb(59, 130, 246)', 'rgb(255, 255, 255)', 'rgb(0, 0, 0)'];
}

function calculateAverageBrightness() {
    // 임시: 중간 밝기 반환
    return 0.5;
}