import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getUserProfile, updateUserProfile } from '@/services/user-profile-service';
import { getChatHistory, saveChatMessage, buildChatContext } from '@/services/chat-service';
import { extractUserData, isCalculationRequest, isMealPlanRequest } from '@/lib/data-extractor';
import { isProfileComplete, getMissingProfileFields } from '@/lib/fitness-calculations';
import { GOAL_LABELS, ACTIVITY_LABELS } from '@/types/user-profile';

// Initialize Gemini AI
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function POST(req: NextRequest) {
    console.log('\n🔵 ========== Personalized AI Coach API ==========');
    console.log('⏰ Timestamp:', new Date().toISOString());

    try {
        const body = await req.json();
        const { messages, userId } = body;

        if (!userId) {
            return NextResponse.json({
                role: 'assistant',
                content: 'User authentication required.',
            });
        }

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json({
                role: 'assistant',
                content: 'Invalid request format.',
            });
        }

        const lastUserMessage = messages[messages.length - 1];
        console.log('💬 User message:', lastUserMessage.content);
        console.log('👤 User ID:', userId);

        // Fetch user profile
        let userProfile = await getUserProfile(userId);
        console.log('📊 Profile loaded:', userProfile ? 'Yes' : 'No');

        // Extract data from user message
        const extractedData = extractUserData(lastUserMessage.content);
        console.log('📥 Extracted data:', extractedData);

        // Update profile if new data was extracted
        if (Object.keys(extractedData).length > 0) {
            console.log('💾 Updating profile with extracted data...');
            userProfile = await updateUserProfile(userId, extractedData);
            console.log('✅ Profile updated');
        }

        // Check if profile is complete
        const profileComplete = userProfile && isProfileComplete(userProfile);
        console.log('✅ Profile complete:', profileComplete);

        // Get chat history
        const chatHistory = await getChatHistory(userId, 8);
        console.log('📜 Chat history:', chatHistory.length, 'messages');

        // Build AI response
        let aiResponse: string;

        // If profile incomplete and user is asking for calculations
        if (!profileComplete && (isCalculationRequest(lastUserMessage.content) || isMealPlanRequest(lastUserMessage.content))) {
            const missingFields = getMissingProfileFields(userProfile || {});
            console.log('❌ Missing fields:', missingFields);

            aiResponse = `I need some information to calculate your personalized targets. Please tell me your:\n\n${missingFields.map(f => `• ${f.charAt(0).toUpperCase() + f.slice(1)}`).join('\n')}\n\nFor example: "I'm 25 years old, male, weigh 80kg, 175cm tall, moderately active, and want to lose fat."`;

            // Save messages
            await saveChatMessage(userId, 'user', lastUserMessage.content);
            await saveChatMessage(userId, 'assistant', aiResponse);

            return NextResponse.json({
                role: 'assistant',
                content: aiResponse,
            });
        }

        // Use Gemini AI for personalized response
        if (!genAI) {
            console.log('⚠️  No Gemini API key - using fallback');
            aiResponse = generateFallbackResponse(lastUserMessage.content, userProfile);
        } else {
            console.log('🤖 Generating AI response...');
            aiResponse = await generateGeminiResponse(
                lastUserMessage.content,
                userProfile,
                chatHistory
            );
            console.log('✅ AI response generated');
        }

        // Save messages to history
        await saveChatMessage(userId, 'user', lastUserMessage.content);
        await saveChatMessage(userId, 'assistant', aiResponse);

        console.log('✅ ========== Request Complete ==========\n');

        return NextResponse.json({
            role: 'assistant',
            content: aiResponse,
        });

    } catch (error: any) {
        console.error('❌ Error:', error);
        return NextResponse.json({
            role: 'assistant',
            content: 'Sorry, I encountered an error. Please try again.',
        });
    }
}

async function generateGeminiResponse(
    userMessage: string,
    userProfile: any,
    chatHistory: any[]
): Promise<string> {
    const model = genAI!.getGenerativeModel({ model: 'gemini-pro' });

    // Build personalized system prompt
    let systemPrompt = `You are a professional fitness and nutrition coach. Provide personalized, data-driven advice.

IMPORTANT RULES:
1. Always reference the user's specific data in your responses
2. Provide exact numerical calculations when relevant
3. Include Indian food options in meal plans (dal, roti, sabzi, paneer, etc.)
4. Be concise but professional (2-4 sentences for simple questions, more for meal plans)
5. Give actionable, specific advice
6. If asked about injuries, recommend consulting a healthcare professional

`;

    // Add user profile data if available
    if (userProfile && isProfileComplete(userProfile)) {
        systemPrompt += `USER PROFILE:
- Weight: ${userProfile.weight}kg
- Height: ${userProfile.height}cm
- Age: ${userProfile.age} years
- Gender: ${userProfile.gender}
- Goal: ${GOAL_LABELS[userProfile.fitnessGoal as keyof typeof GOAL_LABELS]}
- Activity Level: ${ACTIVITY_LABELS[userProfile.activityLevel as keyof typeof ACTIVITY_LABELS]}
- Gym Days: ${userProfile.gymDaysPerWeek || 'Not specified'}/week

CALCULATED TARGETS:
- BMR: ${userProfile.bmr} calories
- Maintenance: ${userProfile.maintenanceCalories} calories
- Target Calories: ${userProfile.targetCalories} calories (for ${GOAL_LABELS[userProfile.fitnessGoal as keyof typeof GOAL_LABELS]})
- Protein: ${userProfile.proteinTarget}g/day
- Carbs: ${userProfile.carbsTarget}g/day
- Fats: ${userProfile.fatsTarget}g/day

`;
    }

    // Add chat history
    if (chatHistory.length > 0) {
        systemPrompt += `RECENT CONVERSATION:\n${buildChatContext(chatHistory)}\n\n`;
    }

    systemPrompt += `User's current question: ${userMessage}\n\nRespond as their personal fitness coach:`;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    return response.text();
}

function generateFallbackResponse(userMessage: string, userProfile: any): string {
    const lowerMessage = userMessage.toLowerCase();

    // If profile is complete, show their targets
    if (userProfile && isProfileComplete(userProfile)) {
        if (isCalculationRequest(lowerMessage)) {
            return `Based on your profile (${userProfile.weight}kg, ${userProfile.height}cm, ${userProfile.age}yo, ${userProfile.gender}, ${GOAL_LABELS[userProfile.fitnessGoal as keyof typeof GOAL_LABELS]}):

**Your Targets:**
• BMR: ${userProfile.bmr} calories
• Maintenance: ${userProfile.maintenanceCalories} calories
• Target: ${userProfile.targetCalories} calories/day
• Protein: ${userProfile.proteinTarget}g
• Carbs: ${userProfile.carbsTarget}g
• Fats: ${userProfile.fatsTarget}g

Stick to these targets and track your progress! 💪`;
        }

        if (isMealPlanRequest(lowerMessage)) {
            return `Based on your ${userProfile.targetCalories} calorie target for ${GOAL_LABELS[userProfile.fitnessGoal as keyof typeof GOAL_LABELS]}:

**Sample Meal Plan:**

**Breakfast (${Math.round(userProfile.targetCalories * 0.25)} cal):**
• 4 egg whites + 2 whole eggs
• 2 slices whole wheat bread
• 1 cup milk

**Lunch (${Math.round(userProfile.targetCalories * 0.35)} cal):**
• 200g chicken/paneer
• 1 cup brown rice
• Dal and sabzi
• Salad

**Dinner (${Math.round(userProfile.targetCalories * 0.30)} cal):**
• 150g protein (fish/chicken/paneer)
• 2 rotis
• Sabzi and raita

**Snacks (${Math.round(userProfile.targetCalories * 0.10)} cal):**
• Protein shake
• Almonds (30g)
• Fruit

Total: Protein ${userProfile.proteinTarget}g | Carbs ${userProfile.carbsTarget}g | Fats ${userProfile.fatsTarget}g`;
        }
    }

    return "I'm here to help with personalized fitness and nutrition advice. To get started, tell me your weight, height, age, gender, activity level, and fitness goal!";
}
