import api from './api';

/**
 * AI Report Assistant API Call
 */
export const postAiReportAssistApi = async (description, city = 'Hyderabad') => {
  try {
    const response = await api.post('/ai/report-assist', { description, city });
    return response.data;
  } catch (error) {
    console.warn('AI assist API offline/fallback active:', error);
    return {
      originalDescription: description,
      enhancedDescription: description,
      suggestedCategory: 'OTHER',
      suggestedCategoryLabel: 'Other',
      suggestedPriority: 'LOW',
      summary: description,
      extractedKeyDetails: [],
      fallback: true,
      message: 'AI assistance is temporarily unavailable. You can continue manually.',
    };
  }
};

/**
 * AI Report Summary API Call
 */
export const postAiReportSummaryApi = async (reportId) => {
  try {
    const response = await api.post(`/ai/report-summary/${reportId}`);
    return response.data;
  } catch (error) {
    console.warn('AI summary API offline/fallback active:', error);
    return {
      reportId: `Report #${reportId}`,
      whatHappened: 'Report details available in official record.',
      importantDetails: 'Emergency incident reported.',
      reportedLocation: 'Coordinates logged in database.',
      suggestedUrgency: 'MEDIUM',
      fallback: true,
      notice: 'AI summary temporarily unavailable. Direct report record displayed.',
    };
  }
};

/**
 * AI Safety Assistant Chat API Call
 */
export const postAiChatApi = async (message, city = 'Hyderabad') => {
  try {
    const response = await api.post('/ai/chat', { message, city });
    return response.data;
  } catch (error) {
    console.warn('AI chat API offline/fallback active:', error);
    return {
      userMessage: message,
      aiAnswer: 'SafeCity Assistant is operating in offline guidance mode.',
      actionSteps: [
        'In immediate danger, call 112 / 100 / 101 / 108 immediately.',
        'File emergency reports on SafeCity Safety Map.',
        'Stay in a safe location until emergency responders arrive.',
      ],
      emergencyDisclaimer: '🚨 EMERGENCY NOTICE: Call emergency dispatch (112 / 100 / 101) directly for immediate danger.',
      fallback: true,
    };
  }
};

/**
 * AI Natural-Language Search Parsing API Call
 */
export const postAiParseSearchQueryApi = async (query) => {
  try {
    const response = await api.post('/ai/parse-search-query', { query });
    return response.data;
  } catch (error) {
    console.warn('AI parse search query API offline/fallback active:', error);
    return {
      originalQuery: query,
      parsedCategory: null,
      parsedPriority: null,
      parsedStatus: null,
      parsedCity: null,
      queryExplanation: 'Fallback keyword filter applied.',
      fallback: true,
    };
  }
};

/**
 * Recommended Safety Tips API Call
 */
export const getAiSafetyTipsApi = async (city = 'Hyderabad') => {
  try {
    const response = await api.get('/ai/safety-tips', { params: { city } });
    return response.data;
  } catch (error) {
    console.warn('AI safety tips API offline/fallback active:', error);
    return [
      {
        id: 'fallback-1',
        title: 'Emergency Contacts Preparedness',
        category: 'Public Safety',
        tip: 'Save local emergency dispatch numbers (112, 100, 101, 108) on speed dial.',
        iconSymbol: '📱',
      },
      {
        id: 'fallback-2',
        title: 'Precise Location Sharing',
        category: 'Report Filing',
        tip: 'Always provide landmark references or turn on GPS when submitting emergency reports.',
        iconSymbol: '📍',
      },
    ];
  }
};
