const { CloudEvent } = require('@google-cloud/functions-framework');

/**
 * Cloud Function proxy for Gemini Image Generation API
 * Обходить гео-блокування datacenter IP адрес
 */
exports.geminiProxy = async (req, res) => {
  // CORS headers для веб-запитів
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Only POST method allowed' });
    return;
  }

  try {
    // Перевірка авторизації
    const proxySecret = process.env.PROXY_SECRET;
    const authHeader = req.get('Authorization');
    
    if (!proxySecret || authHeader !== `Bearer ${proxySecret}`) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Отримання API ключа з environment
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
      return;
    }

    // Парсинг запиту
    const { prompt, generationConfig, safetySettings } = req.body;
    
    if (!prompt) {
      res.status(400).json({ error: 'prompt is required' });
      return;
    }

    console.log(`Proxying request for prompt: ${prompt.substring(0, 50)}...`);

    // Формування запиту до Gemini API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`;
    
    const geminiRequest = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseModalities: ["TEXT", "IMAGE"],
        ...generationConfig
      },
      safetySettings: safetySettings || [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH", 
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    // Виклик Gemini API
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(geminiRequest)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API error ${response.status}: ${errorText}`);
      res.status(response.status).json({ 
        error: 'Gemini API error', 
        details: errorText,
        status: response.status 
      });
      return;
    }

    const geminiResult = await response.json();
    
    // Логування для debugging
    console.log('Gemini API response received:', {
      candidates: geminiResult.candidates?.length || 0,
      hasImageData: geminiResult.candidates?.[0]?.content?.parts?.some(p => p.inlineData) || false
    });

    // Повертаємо результат клієнту
    res.status(200).json(geminiResult);

  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: 'Internal proxy error', 
      message: error.message 
    });
  }
};