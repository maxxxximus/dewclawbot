#!/usr/bin/env node

/**
 * Локальний тест для Cloud Function
 * Перевіряє що функція працює через Functions Framework
 */

const { exec } = require('child_process');
const fetch = require('node-fetch');

// Конфігурація
const LOCAL_PORT = 8080;
const LOCAL_URL = `http://localhost:${LOCAL_PORT}`;
const PROXY_SECRET = process.env.PROXY_SECRET || 'test-secret';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

console.log('🧪 Testing Gemini Proxy Cloud Function locally...\n');

if (!GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY environment variable is required');
    process.exit(1);
}

// Запуск локального сервера
console.log(`🚀 Starting local server on port ${LOCAL_PORT}...`);

const serverProcess = exec(`npx functions-framework --target=geminiProxy --port=${LOCAL_PORT}`, {
    env: {
        ...process.env,
        PROXY_SECRET,
        GEMINI_API_KEY
    }
});

serverProcess.stdout.on('data', (data) => {
    console.log(`[SERVER] ${data.toString().trim()}`);
});

serverProcess.stderr.on('data', (data) => {
    console.error(`[SERVER ERROR] ${data.toString().trim()}`);
});

// Дочекатись запуску сервера та провести тест
setTimeout(async () => {
    try {
        console.log('\n🧪 Running tests...\n');

        // Тест 1: Перевірка OPTIONS (CORS)
        console.log('1. Testing CORS preflight...');
        const optionsResponse = await fetch(LOCAL_URL, { method: 'OPTIONS' });
        console.log(`   Status: ${optionsResponse.status}`);
        console.log(`   CORS headers: ${optionsResponse.headers.get('access-control-allow-origin')}`);

        // Тест 2: Перевірка авторизації
        console.log('\n2. Testing authorization...');
        const unauthorizedResponse = await fetch(LOCAL_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: 'test' })
        });
        console.log(`   Unauthorized request status: ${unauthorizedResponse.status}`);

        // Тест 3: Валідний запит (може fail через API quota/policy)
        console.log('\n3. Testing valid request...');
        const validResponse = await fetch(LOCAL_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${PROXY_SECRET}`
            },
            body: JSON.stringify({
                prompt: 'Generate a simple geometric shape, a red circle on white background',
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1000
                }
            })
        });

        console.log(`   Valid request status: ${validResponse.status}`);
        
        if (validResponse.ok) {
            const result = await validResponse.json();
            console.log(`   Response has candidates: ${result.candidates?.length || 0}`);
            
            if (result.candidates?.[0]?.content?.parts) {
                const hasImage = result.candidates[0].content.parts.some(part => part.inlineData);
                const hasText = result.candidates[0].content.parts.some(part => part.text);
                console.log(`   Has image data: ${hasImage}`);
                console.log(`   Has text data: ${hasText}`);
            }
        } else {
            const errorText = await validResponse.text();
            console.log(`   Error: ${errorText}`);
        }

        console.log('\n✅ Local testing complete!');
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
    } finally {
        // Завершити сервер
        serverProcess.kill();
        process.exit(0);
    }
}, 3000); // 3 секунди на запуск сервера