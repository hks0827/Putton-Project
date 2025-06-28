// utils/style-recommender.js - 임시 버전 (나중에 개선)

console.log('Style Recommender 로드됨');

// 임시 스타일 추천 로직
function getRecommendedStyle(siteAnalysis) {
    // 나중에 복잡한 로직으로 교체할 예정
    
    const styles = ['classic', 'neon', 'glass', 'metallic'];
    
    // 임시: 사이트별 간단한 추천
    const hostname = window.location.hostname;
    
    if (hostname.includes('github')) {
        return 'classic';
    } else if (hostname.includes('google')) {
        return 'glass';
    } else if (hostname.includes('youtube')) {
        return 'neon';
    } else if (hostname.includes('amazon')) {
        return 'metallic';
    }
    
    // 기본값: 랜덤 선택 (테스트용)
    return styles[Math.floor(Math.random() * styles.length)];
}