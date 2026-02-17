// Test all possible Gemini model names
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyA_m_R5y2NurgfKZTMu4vqKkrTz21LPOFo';

console.log('🧪 Testing Gemini API Key with Multiple Models...\n');
console.log('🔑 API Key:', API_KEY.substring(0, 15) + '...');
console.log('');

const genAI = new GoogleGenerativeAI(API_KEY);

const modelsToTest = [
    'gemini-pro',
    'gemini-1.5-pro',
    'gemini-1.5-flash',
    'gemini-1.5-pro-latest',
    'gemini-1.5-flash-latest',
    'models/gemini-pro',
    'models/gemini-1.5-pro',
    'models/gemini-1.5-flash',
];

async function testAllModels() {
    for (const modelName of modelsToTest) {
        console.log(`\n📡 Testing: ${modelName}`);
        console.log('─'.repeat(50));

        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            console.log('  ✅ Model created');

            const result = await model.generateContent('Say "Hello"');
            const response = await result.response;
            const text = response.text();

            console.log(`  ✅ SUCCESS! Response: "${text}"`);
            console.log(`  ✅ Working model found: ${modelName}`);
            console.log('\n🎉 ========== API KEY IS VALID ==========');
            console.log(`🎉 Use this model name: ${modelName}`);
            console.log('🎉 ========================================\n');
            return modelName;

        } catch (error) {
            console.log(`  ❌ Failed: ${error.message}`);
            if (error.status) {
                console.log(`  ❌ Status: ${error.status}`);
            }
        }
    }

    console.log('\n❌ ========================================');
    console.log('❌ ALL MODELS FAILED');
    console.log('❌ ========================================');
    console.log('\n⚠️  Possible issues:');
    console.log('  1. API key is not activated for Gemini API');
    console.log('  2. API key is for a different Google service');
    console.log('  3. API key has been revoked or expired');
    console.log('  4. Billing is not enabled on the Google Cloud project');
    console.log('\n📝 To get a valid API key:');
    console.log('  1. Visit: https://aistudio.google.com/app/apikey');
    console.log('  2. Create a new API key');
    console.log('  3. Make sure "Generative Language API" is enabled');
    console.log('  4. Update .env.local with the new key\n');
}

testAllModels();
