// Test script for AI Coach API
// Run with: node test-ai-api.mjs

const testMessages = [
    { role: "assistant", content: "Hi! I'm your AI Coach. How can I help you train today?" },
    { role: "user", content: "Generate a 30-minute HIIT workout" }
];

async function testAIAPI() {
    console.log('🧪 Testing AI Coach API...\n');

    try {
        console.log('📤 Sending request to http://localhost:3000/api/chat');
        console.log('📨 Payload:', JSON.stringify({ messages: testMessages }, null, 2));

        const response = await fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ messages: testMessages }),
        });

        console.log('\n📥 Response status:', response.status);
        console.log('📥 Response OK:', response.ok);

        const data = await response.json();
        console.log('\n✅ Response data:', JSON.stringify(data, null, 2));

        if (data.role === 'assistant' && data.content) {
            console.log('\n✅ SUCCESS! AI Coach is working!');
            console.log('🤖 AI Response:', data.content);
        } else {
            console.log('\n❌ FAILED! Invalid response format');
        }

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        console.error('Stack:', error.stack);
    }
}

testAIAPI();
