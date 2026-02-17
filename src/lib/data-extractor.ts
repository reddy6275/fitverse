import { UserProfile } from '@/types/user-profile';

/**
 * Extract user profile data from natural language text
 */
export function extractUserData(message: string): Partial<UserProfile> {
    const extracted: Partial<UserProfile> = {};
    const lowerMessage = message.toLowerCase();

    // Extract weight (kg)
    const weightPatterns = [
        /(\d+(?:\.\d+)?)\s*(?:kg|kilos?|kilograms?)/i,
        /weigh\s+(\d+(?:\.\d+)?)/i,
        /weight\s+(?:is\s+)?(\d+(?:\.\d+)?)/i,
    ];

    for (const pattern of weightPatterns) {
        const match = message.match(pattern);
        if (match) {
            extracted.weight = parseFloat(match[1]);
            break;
        }
    }

    // Extract height (cm)
    const heightPatterns = [
        /(\d+(?:\.\d+)?)\s*(?:cm|centimeters?)/i,
        /height\s+(?:is\s+)?(\d+(?:\.\d+)?)/i,
        /(?:i'm|i am)\s+(\d+(?:\.\d+)?)\s*(?:cm|tall)/i,
    ];

    for (const pattern of heightPatterns) {
        const match = message.match(pattern);
        if (match) {
            extracted.height = parseFloat(match[1]);
            break;
        }
    }

    // Extract age
    const agePatterns = [
        /(\d+)\s*(?:years?\s+old|yrs?\s+old)/i,
        /age\s+(?:is\s+)?(\d+)/i,
        /(?:i'm|i am)\s+(\d+)\s+(?:years?\s+old)?/i,
    ];

    for (const pattern of agePatterns) {
        const match = message.match(pattern);
        if (match) {
            const age = parseInt(match[1]);
            if (age >= 10 && age <= 100) {
                extracted.age = age;
                break;
            }
        }
    }

    // Extract gender
    if (lowerMessage.includes('male') && !lowerMessage.includes('female')) {
        extracted.gender = 'male';
    } else if (lowerMessage.includes('female')) {
        extracted.gender = 'female';
    } else if (lowerMessage.includes('man') || lowerMessage.includes('boy')) {
        extracted.gender = 'male';
    } else if (lowerMessage.includes('woman') || lowerMessage.includes('girl')) {
        extracted.gender = 'female';
    }

    // Extract fitness goal
    if (
        lowerMessage.includes('lose weight') ||
        lowerMessage.includes('fat loss') ||
        lowerMessage.includes('lose fat') ||
        lowerMessage.includes('cutting') ||
        lowerMessage.includes('shred')
    ) {
        extracted.fitnessGoal = 'fat_loss';
    } else if (
        lowerMessage.includes('gain muscle') ||
        lowerMessage.includes('build muscle') ||
        lowerMessage.includes('bulk') ||
        lowerMessage.includes('gain weight')
    ) {
        extracted.fitnessGoal = 'muscle_gain';
    } else if (
        lowerMessage.includes('maintain') ||
        lowerMessage.includes('maintenance')
    ) {
        extracted.fitnessGoal = 'maintenance';
    }

    // Extract activity level
    if (
        lowerMessage.includes('sedentary') ||
        lowerMessage.includes('no exercise') ||
        lowerMessage.includes('desk job')
    ) {
        extracted.activityLevel = 'sedentary';
    } else if (
        lowerMessage.includes('light') ||
        lowerMessage.includes('1-3 days') ||
        lowerMessage.includes('1-3 times')
    ) {
        extracted.activityLevel = 'light';
    } else if (
        lowerMessage.includes('moderate') ||
        lowerMessage.includes('3-5 days') ||
        lowerMessage.includes('3-5 times')
    ) {
        extracted.activityLevel = 'moderate';
    } else if (
        lowerMessage.includes('very active') ||
        lowerMessage.includes('intense') ||
        lowerMessage.includes('daily')
    ) {
        extracted.activityLevel = 'very_active';
    } else if (
        lowerMessage.includes('active') ||
        lowerMessage.includes('6-7 days')
    ) {
        extracted.activityLevel = 'active';
    }

    // Extract gym days per week
    const gymDaysPattern = /(\d+)\s*(?:days?|times?)\s*(?:per\s+week|a\s+week|\/week)/i;
    const gymMatch = message.match(gymDaysPattern);
    if (gymMatch) {
        const days = parseInt(gymMatch[1]);
        if (days >= 0 && days <= 7) {
            extracted.gymDaysPerWeek = days;
        }
    }

    return extracted;
}

/**
 * Check if message contains a request for calculations
 */
export function isCalculationRequest(message: string): boolean {
    const lowerMessage = message.toLowerCase();

    const calculationKeywords = [
        'calculate',
        'my calories',
        'my macros',
        'how many calories',
        'calorie target',
        'bmr',
        'tdee',
        'maintenance calories',
        'protein target',
        'what should i eat',
    ];

    return calculationKeywords.some(keyword => lowerMessage.includes(keyword));
}

/**
 * Check if message contains a meal plan request
 */
export function isMealPlanRequest(message: string): boolean {
    const lowerMessage = message.toLowerCase();

    const mealPlanKeywords = [
        'meal plan',
        'diet plan',
        'what should i eat',
        'food plan',
        'nutrition plan',
        'meal prep',
    ];

    return mealPlanKeywords.some(keyword => lowerMessage.includes(keyword));
}
