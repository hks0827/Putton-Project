// utils/style-recommender.js - 지능형 3D 스타일 추천 시스템

console.log('Style Recommender 로드됨');

/* ====================
   메인 추천 시스템
   ==================== */

/**
 * 버튼과 사이트 분석 결과를 바탕으로 최적의 3D 스타일 추천
 * @param {Object} buttonAnalysis - analyzeButtonStyle() 결과
 * @param {Object} siteAnalysis - analyzeSiteDesignSystem() 결과  
 * @param {Object} userPreferences - 사용자 설정 (강도, 스타일 등)
 * @returns {Object} 추천 결과
 */
function recommendOptimalStyle(buttonAnalysis, siteAnalysis, userPreferences = {}) {
    // 추천 점수 시스템
    const styleScores = {
        classic: 0,
        neon: 0,
        glass: 0,
        metallic: 0
    };
    
    // 각 요소별 점수 계산
    const categoryScore = calculateCategoryScore(siteAnalysis.category);
    const designScore = calculateDesignScore(buttonAnalysis.characteristics);
    const colorScore = calculateColorScore(buttonAnalysis, siteAnalysis);
    const contextScore = calculateContextScore(buttonAnalysis);
    const compatibilityScore = calculateCompatibilityScore(buttonAnalysis);
    
    // 점수 합산
    Object.keys(styleScores).forEach(style => {
        styleScores[style] = 
            categoryScore[style] +
            designScore[style] +
            colorScore[style] +
            contextScore[style] +
            compatibilityScore[style];
    });
    
    // 최고 점수 스타일 선택
    const recommendedStyle = Object.keys(styleScores).reduce((a, b) => 
        styleScores[a] > styleScores[b] ? a : b
    );
    
    // 상세 추천 정보 생성
    const recommendation = {
        primaryStyle: recommendedStyle,
        confidence: Math.max(...Object.values(styleScores)) / 100,
        reasoning: generateReasoning(styleScores, buttonAnalysis, siteAnalysis),
        customizations: generateCustomizations(buttonAnalysis, siteAnalysis),
        intensity: recommendIntensity(buttonAnalysis, siteAnalysis),
        fallbackStyles: getFallbackStyles(styleScores),
        warnings: generateWarnings(buttonAnalysis, siteAnalysis)
    };
    
    console.log('스타일 추천 결과:', recommendation);
    return recommendation;
}

/* ====================
   점수 계산 시스템
   ==================== */

/**
 * 사이트 카테고리별 점수 계산
 */
function calculateCategoryScore(category) {
    const categoryPreferences = {
        ecommerce: { classic: 20, neon: 30, glass: 15, metallic: 25 },
        social: { classic: 10, neon: 35, glass: 30, metallic: 15 },
        news: { classic: 35, neon: 10, glass: 25, metallic: 20 },
        entertainment: { classic: 15, neon: 40, glass: 20, metallic: 15 },
        education: { classic: 30, neon: 15, glass: 30, metallic: 15 },
        corporate: { classic: 25, neon: 10, glass: 20, metallic: 35 },
        development: { classic: 30, neon: 25, glass: 25, metallic: 10 },
        finance: { classic: 20, neon: 5, glass: 25, metallic: 40 },
        health: { classic: 35, neon: 5, glass: 30, metallic: 20 },
        government: { classic: 40, neon: 5, glass: 25, metallic: 20 },
        general: { classic: 25, neon: 25, glass: 25, metallic: 25 }
    };
    
    return categoryPreferences[category] || categoryPreferences.general;
}

/**
 * 디자인 특성별 점수 계산
 */
function calculateDesignScore(characteristics) {
    const scores = { classic: 0, neon: 0, glass: 0, metallic: 0 };
    
    // 플랫 디자인
    if (characteristics.isFlat) {
        scores.glass += 25;
        scores.neon += 20;
        scores.classic += 10;
        scores.metallic += 5;
    } else {
        scores.classic += 20;
        scores.metallic += 25;
        scores.glass += 10;
        scores.neon += 15;
    }
    
    // 둥근 모서리
    if (characteristics.isRounded) {
        scores.glass += 20;
        scores.neon += 15;
        scores.classic += 10;
        scores.metallic += 5;
    } else {
        scores.classic += 15;
        scores.metallic += 20;
        scores.glass += 5;
        scores.neon += 10;
    }
    
    // 기존 그라디언트
    if (characteristics.hasGradient) {
        scores.metallic += 25;
        scores.glass += 15;
        scores.classic += 10;
        scores.neon += 5;
    }
    
    // 기존 그림자
    if (characteristics.hasExistingShadow) {
        scores.classic += 20;
        scores.metallic += 15;
        scores.glass += 10;
        scores.neon += 5;
    } else {
        scores.glass += 15;
        scores.neon += 20;
    }
    
    // 투명 배경
    if (characteristics.isTransparent) {
        scores.glass += 30;
        scores.neon += 20;
        scores.classic += 5;
        scores.metallic += 5;
    }
    
    // 디자인 스타일별
    switch (characteristics.designStyle) {
        case 'minimal':
            scores.glass += 20;
            scores.classic += 15;
            break;
        case 'classic':
            scores.classic += 25;
            scores.metallic += 15;
            break;
        case 'bold':
            scores.neon += 25;
            scores.metallic += 20;
            break;
        case 'modern':
            scores.glass += 15;
            scores.neon += 15;
            scores.metallic += 15;
            break;
    }
    
    return scores;
}

/**
 * 색상 기반 점수 계산
 */
function calculateColorScore(buttonAnalysis, siteAnalysis) {
    const scores = { classic: 0, neon: 0, glass: 0, metallic: 0 };
    
    // 사이트 테마별
    if (siteAnalysis.theme === 'dark') {
        scores.neon += 25;
        scores.glass += 20;
        scores.metallic += 15;
        scores.classic += 10;
    } else {
        scores.classic += 20;
        scores.metallic += 20;
        scores.glass += 15;
        scores.neon += 15;
    }
    
    // 버튼 색상 분석
    const bgRGB = window.siteAnalyzer.extractRGBValues(buttonAnalysis.backgroundColor);
    if (bgRGB) {
        const brightness = window.siteAnalyzer.calculateBrightness(bgRGB);
        const saturation = calculateSaturation(bgRGB);
        
        // 밝기별 점수
        if (brightness < 100) {
            // 어두운 버튼
            scores.neon += 20;
            scores.glass += 15;
        } else if (brightness > 200) {
            // 밝은 버튼
            scores.classic += 20;
            scores.metallic += 15;
        } else {
            // 중간 밝기
            scores.glass += 20;
            scores.classic += 15;
        }
        
        // 채도별 점수
        if (saturation > 50) {
            // 고채도 (컬러풀)
            scores.neon += 20;
            scores.metallic += 15;
        } else {
            // 저채도 (모노톤)
            scores.classic += 15;
            scores.glass += 20;
        }
    }
    
    // 색상 스키마별
    switch (buttonAnalysis.characteristics.colorScheme) {
        case 'dark':
            scores.neon += 15;
            scores.glass += 10;
            break;
        case 'colorful':
            scores.neon += 20;
            scores.metallic += 15;
            break;
        case 'light':
            scores.classic += 15;
            scores.glass += 15;
            break;
    }
    
    return scores;
}

/**
 * 버튼 컨텍스트별 점수 계산
 */
function calculateContextScore(buttonAnalysis) {
    const scores = { classic: 0, neon: 0, glass: 0, metallic: 0 };
    
    // 버튼 크기별
    const area = buttonAnalysis.width * buttonAnalysis.height;
    
    if (area > 10000) {
        // 큰 버튼 (CTA 등)
        scores.neon += 25;
        scores.metallic += 20;
        scores.classic += 10;
        scores.glass += 15;
    } else if (area < 3000) {
        // 작은 버튼
        scores.glass += 20;
        scores.classic += 15;
        scores.neon += 10;
        scores.metallic += 5;
    } else {
        // 중간 크기
        scores.classic += 15;
        scores.glass += 15;
        scores.metallic += 15;
        scores.neon += 15;
    }
    
    // 위치별 (화면 중앙에 가까울수록 중요)
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const distanceFromCenter = Math.sqrt(
        Math.pow(buttonAnalysis.position.centerX - centerX, 2) +
        Math.pow(buttonAnalysis.position.centerY - centerY, 2)
    );
    
    const maxDistance = Math.sqrt(Math.pow(centerX, 2) + Math.pow(centerY, 2));
    const centralness = 1 - (distanceFromCenter / maxDistance);
    
    if (centralness > 0.7) {
        // 중앙에 위치한 중요한 버튼
        scores.neon += 20;
        scores.metallic += 15;
    } else if (centralness < 0.3) {
        // 가장자리 버튼
        scores.classic += 15;
        scores.glass += 15;
    }
    
    return scores;
}

/**
 * 기존 스타일과의 호환성 점수 계산
 */
function calculateCompatibilityScore(buttonAnalysis) {
    const scores = { classic: 0, neon: 0, glass: 0, metallic: 0 };
    
    // 기존 스타일 보존 점수
    const { borderRadius, borderWidth, fontSize, padding } = buttonAnalysis;
    
    // 테두리 반경에 따른 호환성
    if (borderRadius > 15) {
        // 매우 둥근 버튼
        scores.glass += 25;
        scores.neon += 20;
    } else if (borderRadius > 5) {
        // 적당히 둥근 버튼
        scores.classic += 15;
        scores.glass += 20;
        scores.metallic += 15;
    } else {
        // 각진 버튼
        scores.classic += 20;
        scores.metallic += 20;
    }
    
    // 테두리 두께
    if (borderWidth > 2) {
        scores.classic += 20;
        scores.metallic += 15;
    } else if (borderWidth === 0) {
        scores.glass += 20;
        scores.neon += 15;
    }
    
    // 폰트 크기
    if (fontSize > 18) {
        scores.neon += 15;
        scores.metallic += 15;
    } else if (fontSize < 14) {
        scores.glass += 15;
        scores.classic += 10;
    }
    
    return scores;
}

/* ====================
   추천 세부사항 생성
   ==================== */

/**
 * 추천 이유 생성
 */
function generateReasoning(styleScores, buttonAnalysis, siteAnalysis) {
    const reasons = [];
    const topStyle = Object.keys(styleScores).reduce((a, b) => 
        styleScores[a] > styleScores[b] ? a : b
    );
    
    // 사이트 카테고리 기반 이유
    const categoryReasons = {
        ecommerce: '쇼핑몰에서는 구매 버튼이 눈에 잘 띄어야 합니다',
        social: 'SNS에서는 인터랙티브한 느낌이 중요합니다',
        corporate: '기업 사이트에서는 신뢰감 있는 디자인이 좋습니다',
        development: '개발 도구에서는 깔끔하고 기능적인 디자인이 적합합니다'
    };
    
    if (categoryReasons[siteAnalysis.category]) {
        reasons.push(categoryReasons[siteAnalysis.category]);
    }
    
    // 디자인 특성 기반 이유
    if (buttonAnalysis.characteristics.isFlat) {
        reasons.push('플랫 디자인에 어울리는 미묘한 효과를 선택했습니다');
    }
    
    if (buttonAnalysis.characteristics.isRounded) {
        reasons.push('둥근 모서리와 조화로운 부드러운 효과를 적용했습니다');
    }
    
    if (siteAnalysis.theme === 'dark') {
        reasons.push('다크모드에 적합한 글로우 효과를 추천합니다');
    }
    
    // 스타일별 특별 이유
    const styleReasons = {
        classic: '전통적이고 안정감 있는 그림자 효과',
        neon: '현대적이고 눈에 띄는 네온 글로우 효과',
        glass: '세련되고 우아한 글래스모피즘 효과',
        metallic: '고급스럽고 프리미엄한 메탈릭 효과'
    };
    
    reasons.push(styleReasons[topStyle]);
    
    return reasons;
}

/**
 * 커스터마이징 옵션 생성
 */
function generateCustomizations(buttonAnalysis, siteAnalysis) {
    const customizations = {
        preserveOriginalColors: true,
        adaptToExistingShadow: true,
        respectBorderRadius: true,
        adjustForTheme: true,
        customProperties: {}
    };
    
    // 기존 색상 보존
    const bgRGB = window.siteAnalyzer.extractRGBValues(buttonAnalysis.backgroundColor);
    if (bgRGB) {
        customizations.customProperties['--original-bg-color'] = buttonAnalysis.backgroundColor;
    }
    
    // 기존 테두리 반경 보존
    if (buttonAnalysis.borderRadius > 0) {
        customizations.customProperties['--original-border-radius'] = `${buttonAnalysis.borderRadius}px`;
    }
    
    // 기존 그림자와 조화
    if (buttonAnalysis.characteristics.hasExistingShadow) {
        customizations.customProperties['--original-shadow'] = buttonAnalysis.boxShadow;
        customizations.blendWithExistingShadow = true;
    }
    
    // 테마별 조정
    if (siteAnalysis.theme === 'dark') {
        customizations.customProperties['--theme-adjustment'] = 'dark';
        customizations.increasedGlow = true;
    }
    
    return customizations;
}

/**
 * 강도 추천
 */
function recommendIntensity(buttonAnalysis, siteAnalysis) {
    let intensity = 2; // 기본값
    
    // 버튼 크기에 따른 조정
    const area = buttonAnalysis.width * buttonAnalysis.height;
    if (area > 15000) {
        intensity = 3; // 큰 버튼은 강한 효과
    } else if (area < 2000) {
        intensity = 1; // 작은 버튼은 약한 효과
    }
    
    // 사이트 카테고리에 따른 조정
    const intensityByCategory = {
        entertainment: 3,
        ecommerce: 3,
        social: 2,
        corporate: 1,
        government: 1,
        health: 1
    };
    
    if (intensityByCategory[siteAnalysis.category]) {
        intensity = Math.max(intensity, intensityByCategory[siteAnalysis.category]);
    }
    
    // 기존 스타일에 따른 조정
    if (buttonAnalysis.characteristics.isFlat) {
        intensity = Math.max(1, intensity - 1); // 플랫 디자인은 강도 낮춤
    }
    
    if (buttonAnalysis.characteristics.hasExistingShadow) {
        intensity = Math.max(1, intensity - 1); // 기존 그림자 있으면 강도 낮춤
    }
    
    return Math.min(3, Math.max(1, intensity));
}

/**
 * 대체 스타일 목록 생성
 */
function getFallbackStyles(styleScores) {
    return Object.entries(styleScores)
        .sort((a, b) => b[1] - a[1])
        .slice(1, 3)
        .map(([style]) => style);
}

/**
 * 경고사항 생성
 */
function generateWarnings(buttonAnalysis, siteAnalysis) {
    const warnings = [];
    
    // 성능 관련 경고
    if (siteAnalysis.framework === 'custom' && !buttonAnalysis.characteristics.hasExistingShadow) {
        warnings.push('커스텀 CSS와 충돌할 수 있으니 테스트가 필요합니다');
    }
    
    // 접근성 관련 경고
    const bgRGB = window.siteAnalyzer.extractRGBValues(buttonAnalysis.backgroundColor);
    const textRGB = window.siteAnalyzer.extractRGBValues(buttonAnalysis.color);
    
    if (bgRGB && textRGB) {
        const bgBrightness = window.siteAnalyzer.calculateBrightness(bgRGB);
        const textBrightness = window.siteAnalyzer.calculateBrightness(textRGB);
        const contrast = Math.abs(bgBrightness - textBrightness);
        
        if (contrast < 125) {
            warnings.push('색상 대비가 낮아 접근성에 주의가 필요합니다');
        }
    }
    
    // 레이아웃 관련 경고
    if (buttonAnalysis.width < 44 || buttonAnalysis.height < 44) {
        warnings.push('버튼 크기가 작아 터치 기기에서 사용하기 어려울 수 있습니다');
    }
    
    return warnings;
}

/* ====================
   유틸리티 함수
   ==================== */

/**
 * 색상 채도 계산
 */
function calculateSaturation(rgb) {
    const max = Math.max(rgb.r, rgb.g, rgb.b);
    const min = Math.min(rgb.r, rgb.g, rgb.b);
    return max === 0 ? 0 : ((max - min) / max) * 100;
}

/**
 * 간단한 스타일 추천 (빠른 버전)
 */
function getQuickRecommendation(buttonElement) {
    // 간단한 분석
    const style = window.getComputedStyle(buttonElement);
    const bgColor = style.backgroundColor;
    const borderRadius = parseFloat(style.borderRadius) || 0;
    const hasExistingShadow = style.boxShadow !== 'none';
    
    // 빠른 판정
    if (borderRadius > 15) return 'glass';
    if (hasExistingShadow) return 'classic';
    if (bgColor.includes('rgb(0, 0, 0)') || bgColor.includes('rgba(0, 0, 0')) return 'neon';
    
    return 'classic'; // 기본값
}

/* ====================
   내보내기
   ==================== */

// content.js에서 사용할 수 있도록 전역으로 내보내기
window.styleRecommender = {
    recommendOptimalStyle,
    getQuickRecommendation,
    calculateCategoryScore,
    calculateDesignScore,
    calculateColorScore,
    recommendIntensity
};

console.log('Style Recommender 초기화 완료');