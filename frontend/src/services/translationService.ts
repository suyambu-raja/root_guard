import OpenAI from 'openai';

// Initialize OpenAI lazily or safely
const getOpenAIClient = () => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey || apiKey === 'undefined' || apiKey.includes('sk-proj-')) { // Basic check for dummy or missing key
    if (!apiKey) console.warn('VITE_OPENAI_API_KEY is missing. AI translations will be disabled.');
  }

  return new OpenAI({
    apiKey: apiKey || 'dummy-key', // Prevent constructor from throwing if possible
    dangerouslyAllowBrowser: true
  });
};

const openai = getOpenAIClient();

export interface TranslationRequest {
  text: string;
  targetLanguage: 'ta' | 'en';
  context?: string;
}

export class TranslationService {
  private static cache = new Map<string, string>();

  static async translateText({ text, targetLanguage, context }: TranslationRequest): Promise<string> {
    const cacheKey = `${text}-${targetLanguage}-${context}`;

    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      const systemPrompt = targetLanguage === 'ta'
        ? `You are a professional translator specializing in agriculture and technology terms. Translate the given text from English to Tamil. Maintain technical accuracy and use appropriate Tamil terminology for agriculture and irrigation systems. ${context ? `Context: ${context}` : ''}`
        : `You are a professional translator specializing in agriculture and technology terms. Translate the given text from Tamil to English. Maintain technical accuracy and use appropriate English terminology for agriculture and irrigation systems. ${context ? `Context: ${context}` : ''}`;

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Translate: "${text}"`
          }
        ],
        temperature: 0.1,
        max_tokens: 200
      });

      const translation = response.choices[0]?.message?.content?.trim() || text;

      // Cache the translation
      this.cache.set(cacheKey, translation);

      return translation;
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Return original text if translation fails
    }
  }

  static async translateBatch(requests: TranslationRequest[]): Promise<string[]> {
    const promises = requests.map(request => this.translateText(request));
    return Promise.all(promises);
  }

  static clearCache(): void {
    this.cache.clear();
  }
}