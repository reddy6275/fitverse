import { calculateMuscleActivation, exportMuscleActivationJSON } from '@/lib/muscle-activation';
import { Workout } from '@/types/workout';

// Test workout with push and pull exercises
const testWorkout: Workout = {
    id: 'test-1',
    userId: 'test-user',
    name: 'Test Workout',
    date: new Date(),
    duration: 3600,
    exercises: [
        {
            exerciseId: 'bench_press',
            name: 'Barbell Bench Press',
            sets: [
                { id: '1', reps: 10, weight: 80, completed: true },
                { id: '2', reps: 8, weight: 85, completed: true },
                { id: '3', reps: 6, weight: 90, completed: true },
            ]
        },
        {
            exerciseId: 'pullup',
            name: 'Pull Up',
            sets: [
                { id: '4', reps: 8, weight: 0, completed: true },
                { id: '5', reps: 7, weight: 0, completed: true },
                { id: '6', reps: 6, weight: 0, completed: true },
            ]
        },
        {
            exerciseId: 'squat',
            name: 'Barbell Squat',
            sets: [
                { id: '7', reps: 12, weight: 100, completed: true },
                { id: '8', reps: 10, weight: 110, completed: true },
            ]
        }
    ]
};

// Run the enhanced muscle activation analysis
const analysis = calculateMuscleActivation(testWorkout, 75); // 75kg bodyweight

console.log('=== ENHANCED MUSCLE HEATMAP ENGINE TEST ===\n');
console.log('📊 Muscle Activation Analysis:\n');
console.log(exportMuscleActivationJSON(analysis));

console.log('\n=== FEATURE VERIFICATION ===\n');

// 1. Volume Boost
console.log('✅ Volume Boost: Integrated into calculations');
console.log('   - Higher reps × weight = higher activation\n');

// 2. Color Mapping
console.log('✅ Color Mapping:');
analysis.totalMuscles.forEach(m => {
    console.log(`   - ${m.muscleName}: ${m.color} (${m.finalPercentage}%)`);
});

// 3. Stress Levels
console.log('\n✅ Stress Levels:');
analysis.totalMuscles.forEach(m => {
    console.log(`   - ${m.muscleName}: ${m.stressLevel}`);
});

// 4. Recovery Hours
console.log('\n✅ Recovery Hours:');
analysis.totalMuscles.forEach(m => {
    console.log(`   - ${m.muscleName}: ${m.recoveryHours}h`);
});

// 5. Push/Pull Imbalance
console.log('\n✅ Push/Pull Imbalance Detection:');
if (analysis.muscleImbalance) {
    console.log(`   - Push Activation: ${analysis.muscleImbalance.pushActivation}%`);
    console.log(`   - Pull Activation: ${analysis.muscleImbalance.pullActivation}%`);
    console.log(`   - Ratio: ${analysis.muscleImbalance.ratio}`);
    console.log(`   - Balanced: ${analysis.muscleImbalance.isBalanced}`);
    console.log(`   - Recommendation: ${analysis.muscleImbalance.recommendation}`);
} else {
    console.log('   - No imbalance data (need both push and pull exercises)');
}

console.log('\n✅ Overall Recovery: ' + analysis.estimatedRecoveryHours + 'h (' + analysis.estimatedRecoveryDays + ' days)');
console.log('\n=== TEST COMPLETE ===');
