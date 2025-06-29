// utils/site-analyzer.js - 웹사이트 및 버튼 분석 로직

console.log('Site Analyzer 로드됨');

/* ====================
   버튼 스타일 분석
   ==================== */

/**
 * 버튼의 기존 스타일을 상세히 분석
 * @param {HTMLElement} button - 분석할 버튼 요소
 * @returns {Object} 버튼 스타일 분석 결과
 */
function analyzeButtonStyle(button) {
    const computedStyle = window.getComputedStyle(button);
    const rect = button.getBoundingClientRect();
    
    // 기본 스타일 정보 추출
    const styleInfo = {
        // 색상 정보
        backgroundColor: computedStyle.backgroundColor,
        color: computedStyle.color,
        borderColor: computedStyle.borderColor,
        
        // 크기 및 형태
        width: rect.width,
        height: rect.height,
        borderRadius: parseFloat(computedStyle.borderRadius) || 0,
        borderWidth: parseFloat(computedStyle.borderWidth) || 0,
        
        // 타이포그래피
        fontSize: parseFloat(computedStyle.fontSize) || 14,
        fontWeight: computedStyle.fontWeight,
        fontFamily: computedStyle.fontFamily,
        
        // 여백 및 패딩
        padding: {
            top: parseFloat(computedStyle.paddingTop) || 0,
            right: parseFloat(computedStyle.paddingRight) || 0,
            bottom: parseFloat(computedStyle.paddingBottom) || 0,
            left: parseFloat(computedStyle.paddingLeft) || 0
        },
        
        // 기존 효과들
        boxShadow: computedStyle.boxShadow,
        transform: computedStyle.transform,
        transition: computedStyle.transition,
        
        // 배경 관련
        backgroundImage: computedStyle.backgroundImage,
        backgroundSize: computedStyle.backgroundSize,
        
        // 위치 정보
        position: {
            x: rect.left,
            y: rect.top,
            centerX: rect.left + rect.width / 2,
            centerY: rect.top + rect.height / 2
        }
    };
    
    // 스타일 특성 분석
    const characteristics = analyzeStyleCharacteristics(styleInfo, computedStyle);
    
    return {
        ...styleInfo,
        characteristics
    };
}

/**
 * 스타일 특성 분석 (플랫, 둥근 모서리, 그라디언트 등)
 */
function analyzeStyleCharacteristics(styleInfo, computedStyle) {
    const characteristics = {
        isFlat: false,
        isRounded: false,
        hasGradient: false,
        hasExistingShadow: false,
        isTransparent: false,
        designStyle: 'modern', // modern, classic, minimal, bold
        colorScheme: 'light' // light, dark, colorful
    };
    
    // 플랫 디자인 감지
    characteristics.isFlat = styleInfo.boxShadow === 'none' || 
                           styleInfo.boxShadow === 'rgba(0, 0, 0, 0) 0px 0px 0px 0px';
    
    // 둥근 모서리 감지
    characteristics.isRounded = styleInfo.borderRadius > 8;
    
    // 그라디언트 감지
    characteristics.hasGradient = styleInfo.backgroundImage.includes('gradient') ||
                                styleInfo.backgroundColor.includes('gradient');
    
    // 기존 그림자 감지
    characteristics.hasExistingShadow = styleInfo.boxShadow !== 'none' && 
                                      !styleInfo.boxShadow.includes('rgba(0, 0, 0, 0)');
    
    // 투명도 감지
    const bgColor = styleInfo.backgroundColor;
    characteristics.isTransparent = bgColor === 'transparent' || 
                                  bgColor === 'rgba(0, 0, 0, 0)' ||
                                  (bgColor.includes('rgba') && bgColor.includes('0)'));
    
    // 디자인 스타일 분석
    characteristics.designStyle = determineDesignStyle(styleInfo);
    
    // 색상 스키마 분석
    characteristics.colorScheme = determineColorScheme(styleInfo);
    
    return characteristics;
}

/**
 * 디자인 스타일 결정
 */
function determineDesignStyle(styleInfo) {
    const { borderRadius, boxShadow, backgroundImage, fontSize } = styleInfo;
    
    // 미니멀 스타일 (플랫 + 작은 폰트)
    if (boxShadow === 'none' && borderRadius <= 4 && fontSize <= 14) {
        return 'minimal';
    }
    
    // 클래식 스타일 (테두리 + 전통적인 모양)
    if (styleInfo.borderWidth > 0 && borderRadius <= 8) {
        return 'classic';
    }
    
    // 볼드 스타일 (큰 크기 + 강한 색상)
    if (styleInfo.width > 120 || styleInfo.height > 40 || fontSize > 16) {
        return 'bold';
    }
    
    // 기본값: 모던
    return 'modern';
}

/**
 * 색상 스키마 결정
 */
function determineColorScheme(styleInfo) {
    const bgColor = styleInfo.backgroundColor;
    const textColor = styleInfo.color;
    
    // RGB 값 추출
    const bgRGB = extractRGBValues(bgColor);
    const textRGB = extractRGBValues(textColor);
    
    if (!bgRGB || !textRGB) return 'light';
    
    // 밝기 계산
    const bgBrightness = calculateBrightness(bgRGB);
    const textBrightness = calculateBrightness(textRGB);
    
    // 다크 테마 감지
    if (bgBrightness < 50 && textBrightness > 200) {
        return 'dark';
    }
    
    // 컬러풀 테마 감지 (채도가 높은 경우)
    const bgSaturation = calculateSaturation(bgRGB);
    if (bgSaturation > 50) {
        return 'colorful';
    }
    
    return 'light';
}

/* ====================
   사이트 전체 분석
   ==================== */

/**
 * 웹사이트 전체의 디자인 시스템 분석
 */
function analyzeSiteDesignSystem() {
    const designSystem = {
        category: detectSiteCategory(),
        theme: detectSiteTheme(),
        primaryColors: extractDominantColors(),
        typography: analyzeSiteTypography(),
        layout: analyzeSiteLayout(),
        framework: detectCSSFramework()
    };
    
    return designSystem;
}

/**
 * 사이트 카테고리 감지 (개선된 버전)
 */
function detectSiteCategory() {
    const hostname = window.location.hostname.toLowerCase();
    const title = document.title.toLowerCase();
    const metaDescription = getMetaDescription().toLowerCase();
    const bodyText = document.body.textContent.toLowerCase();
    
    // 키워드 기반 분류
    const categories = {
        ecommerce: ['shop', 'store', 'buy', 'cart', 'product', 'price', 'order', 'checkout', 'amazon', 'ebay'],
        social: ['social', 'community', 'friend', 'follow', 'like', 'share', 'post', 'facebook', 'twitter', 'instagram'],
        news: ['news', 'article', 'breaking', 'report', 'journalist', 'media', 'press'],
        entertainment: ['video', 'movie', 'music', 'game', 'entertainment', 'youtube', 'netflix', 'spotify'],
        education: ['learn', 'course', 'education', 'school', 'university', 'tutorial', 'study'],
        corporate: ['company', 'business', 'enterprise', 'corporate', 'about', 'services'],
        development: ['github', 'code', 'developer', 'programming', 'api', 'documentation', 'repository'],
        finance: ['bank', 'finance', 'money', 'payment', 'investment', 'trading'],
        health: ['health', 'medical', 'doctor', 'hospital', 'medicine', 'care'],
        government: ['gov', 'government', 'official', 'public', 'municipal']
    };
    
    // 점수 계산
    const scores = {};
    for (const [category, keywords] of Object.entries(categories)) {
        scores[category] = 0;
        
        keywords.forEach(keyword => {
            if (hostname.includes(keyword)) scores[category] += 10;
            if (title.includes(keyword)) scores[category] += 5;
            if (metaDescription.includes(keyword)) scores[category] += 3;
        });
    }
    
    // 가장 높은 점수의 카테고리 반환
    const maxCategory = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
    return scores[maxCategory] > 0 ? maxCategory : 'general';
}

/**
 * 사이트 테마 감지 (다크/라이트 모드)
 */
function detectSiteTheme() {
    // 1. CSS 변수나 클래스로 명시적 테마 감지
    const htmlElement = document.documentElement;
    const bodyElement = document.body;
    
    // 일반적인 다크모드 클래스/속성들
    const darkModeIndicators = [
        'dark', 'dark-mode', 'dark-theme', 'theme-dark',
        'night', 'night-mode', 'black-theme'
    ];
    
    const lightModeIndicators = [
        'light', 'light-mode', 'light-theme', 'theme-light',
        'day', 'day-mode', 'white-theme'
    ];
    
    // HTML/Body 클래스 확인
    const htmlClasses = htmlElement.className.toLowerCase();
    const bodyClasses = bodyElement.className.toLowerCase();
    const allClasses = htmlClasses + ' ' + bodyClasses;
    
    if (darkModeIndicators.some(indicator => allClasses.includes(indicator))) {
        return 'dark';
    }
    
    if (lightModeIndicators.some(indicator => allClasses.includes(indicator))) {
        return 'light';
    }
    
    // 2. data 속성 확인
    const themeAttr = htmlElement.getAttribute('data-theme') || 
                     bodyElement.getAttribute('data-theme');
    if (themeAttr) {
        if (themeAttr.includes('dark')) return 'dark';
        if (themeAttr.includes('light')) return 'light';
    }
    
    // 3. CSS 변수 확인
    const rootStyles = getComputedStyle(htmlElement);
    const colorScheme = rootStyles.getPropertyValue('color-scheme').trim();
    if (colorScheme.includes('dark')) return 'dark';
    if (colorScheme.includes('light')) return 'light';
    
    // 4. 배경색으로 추정
    const bodyBg = getComputedStyle(bodyElement).backgroundColor;
    const bgRGB = extractRGBValues(bodyBg);
    
    if (bgRGB) {
        const brightness = calculateBrightness(bgRGB);
        return brightness < 128 ? 'dark' : 'light';
    }
    
    // 5. 시스템 설정 확인
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    
    return 'light'; // 기본값
}

/**
 * 주요 색상 추출 (개선된 버전)
 */
function extractDominantColors() {
    const colors = new Map();
    
    // 주요 UI 요소들에서 색상 수집
    const selectors = [
        'header', 'nav', 'main', 'footer',
        '.header', '.navbar', '.nav',
        'button', 'a', '.btn', '.button',
        'h1', 'h2', 'h3', '.title'
    ];
    
    selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            const style = getComputedStyle(element);
            
            // 배경색 수집
            const bgColor = style.backgroundColor;
            if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
                colors.set(bgColor, (colors.get(bgColor) || 0) + 1);
            }
            
            // 텍스트 색상 수집
            const textColor = style.color;
            if (textColor && textColor !== 'rgba(0, 0, 0, 0)') {
                colors.set(textColor, (colors.get(textColor) || 0) + 1);
            }
            
            // 테두리 색상 수집
            const borderColor = style.borderColor;
            if (borderColor && borderColor !== 'rgba(0, 0, 0, 0)') {
                colors.set(borderColor, (colors.get(borderColor) || 0) + 1);
            }
        });
    });
    
    // 빈도수 기준으로 정렬
    const sortedColors = Array.from(colors.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([color]) => color);
    
    return sortedColors.length > 0 ? sortedColors : [
        'rgb(59, 130, 246)', // 기본 파란색
        'rgb(255, 255, 255)', // 흰색
        'rgb(0, 0, 0)' // 검은색
    ];
}

/**
 * 사이트 타이포그래피 분석
 */
function analyzeSiteTypography() {
    const bodyStyle = getComputedStyle(document.body);
    const h1Style = getComputedStyle(document.querySelector('h1') || document.body);
    
    return {
        primaryFont: bodyStyle.fontFamily,
        headingFont: h1Style.fontFamily,
        baseFontSize: parseFloat(bodyStyle.fontSize) || 16,
        headingFontSize: parseFloat(h1Style.fontSize) || 24,
        fontWeight: bodyStyle.fontWeight,
        lineHeight: bodyStyle.lineHeight
    };
}

/**
 * 사이트 레이아웃 분석
 */
function analyzeSiteLayout() {
    const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
    };
    
    const layout = {
        viewport,
        hasHeader: !!document.querySelector('header, .header, nav, .navbar'),
        hasFooter: !!document.querySelector('footer, .footer'),
        hasSidebar: !!document.querySelector('aside, .sidebar, .side-nav'),
        containerWidth: getMainContainerWidth(),
        isResponsive: detectResponsiveDesign()
    };
    
    return layout;
}

/**
 * CSS 프레임워크 감지
 */
function detectCSSFramework() {
    const frameworks = {
        bootstrap: ['.container', '.row', '.col', '.btn', '.navbar'],
        tailwind: ['.flex', '.grid', '.bg-', '.text-', '.p-', '.m-'],
        bulma: ['.hero', '.navbar', '.section', '.container'],
        foundation: ['.grid-container', '.grid-x', '.cell'],
        materialize: ['.container', '.row', '.col', '.btn', '.navbar-fixed'],
        semantic: ['.ui.container', '.ui.grid', '.ui.button']
    };
    
    for (const [framework, selectors] of Object.entries(frameworks)) {
        const found = selectors.filter(selector => document.querySelector(selector)).length;
        if (found >= selectors.length / 2) {
            return framework;
        }
    }
    
    return 'custom';
}

/* ====================
   유틸리티 함수들
   ==================== */

/**
 * RGB 값 추출
 */
function extractRGBValues(colorString) {
    if (!colorString) return null;
    
    // rgb(r, g, b) 형태
    const rgbMatch = colorString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
        return {
            r: parseInt(rgbMatch[1]),
            g: parseInt(rgbMatch[2]),
            b: parseInt(rgbMatch[3])
        };
    }
    
    // rgba(r, g, b, a) 형태
    const rgbaMatch = colorString.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/);
    if (rgbaMatch) {
        return {
            r: parseInt(rgbaMatch[1]),
            g: parseInt(rgbaMatch[2]),
            b: parseInt(rgbaMatch[3])
        };
    }
    
    // hex 색상 (#RGB 또는 #RRGGBB)
    const hexMatch = colorString.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/);
    if (hexMatch) {
        const hex = hexMatch[1];
        if (hex.length === 3) {
            return {
                r: parseInt(hex[0] + hex[0], 16),
                g: parseInt(hex[1] + hex[1], 16),
                b: parseInt(hex[2] + hex[2], 16)
            };
        } else {
            return {
                r: parseInt(hex.substr(0, 2), 16),
                g: parseInt(hex.substr(2, 2), 16),
                b: parseInt(hex.substr(4, 2), 16)
            };
        }
    }
    
    return null;
}

/**
 * 색상 밝기 계산 (0-255)
 */
function calculateBrightness(rgb) {
    return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
}

/**
 * 색상 채도 계산 (0-100)
 */
function calculateSaturation(rgb) {
    const max = Math.max(rgb.r, rgb.g, rgb.b);
    const min = Math.min(rgb.r, rgb.g, rgb.b);
    return max === 0 ? 0 : ((max - min) / max) * 100;
}

/**
 * 평균 밝기 계산 (전체 사이트)
 */
function calculateAverageBrightness() {
    const colors = extractDominantColors();
    let totalBrightness = 0;
    let validColors = 0;
    
    colors.forEach(color => {
        const rgb = extractRGBValues(color);
        if (rgb) {
            totalBrightness += calculateBrightness(rgb);
            validColors++;
        }
    });
    
    return validColors > 0 ? totalBrightness / validColors / 255 : 0.5;
}

/**
 * 메타 설명 가져오기
 */
function getMetaDescription() {
    const metaDesc = document.querySelector('meta[name="description"]');
    return metaDesc ? metaDesc.content : '';
}

/**
 * 메인 컨테이너 너비 계산
 */
function getMainContainerWidth() {
    const containers = document.querySelectorAll('.container, .main, main, #main, .content, #content');
    if (containers.length > 0) {
        return getComputedStyle(containers[0]).width;
    }
    return '100%';
}

/**
 * 반응형 디자인 감지
 */
function detectResponsiveDesign() {
    const viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) return false;
    
    const content = viewport.content.toLowerCase();
    return content.includes('width=device-width') || content.includes('responsive');
}

/* ====================
   내보내기 (전역 함수로 사용)
   ==================== */

// content.js에서 사용할 수 있도록 전역으로 내보내기
window.siteAnalyzer = {
    analyzeButtonStyle,
    analyzeSiteDesignSystem,
    detectSiteCategory,
    detectSiteTheme,
    extractDominantColors,
    calculateAverageBrightness,
    extractRGBValues,
    calculateBrightness
};

console.log('Site Analyzer 초기화 완료');