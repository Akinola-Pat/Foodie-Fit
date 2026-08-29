import {
  calculateBMR,
  calculateTDEE,
  generateNutritionPlan,
  CALORIC_SAFETY_FLOORS,
  SAFETY_NOTICE_MESSAGE,
  UserProfileInput,
} from '../src/services/nutritionEngine';

describe('Foodie Fit Nutrition Engine', () => {
  describe('BMR & TDEE Calculations (Mifflin-St Jeor)', () => {
    it('calculates BMR accurately for standard male baseline', () => {
      // 30yo, male, 180cm, 80kg
      // BMR = 10(80) + 6.25(180) - 5(30) + 5 = 800 + 1125 - 150 + 5 = 1780 kcal
      const bmr = calculateBMR(30, 'male', 180, 80);
      expect(bmr).toBe(1780);
    });

    it('calculates BMR accurately for standard female baseline', () => {
      // 28yo, female, 165cm, 60kg
      // BMR = 10(60) + 6.25(165) - 5(28) - 161 = 600 + 1031.25 - 140 - 161 = 1330.25 -> 1330 kcal
      const bmr = calculateBMR(28, 'female', 165, 60);
      expect(bmr).toBe(1330);
    });

    it('calculates TDEE with correct activity multipliers', () => {
      const bmr = 1780;
      expect(calculateTDEE(bmr, 'sedentary')).toBe(Math.round(1780 * 1.2)); // 2136
      expect(calculateTDEE(bmr, 'light')).toBe(Math.round(1780 * 1.375)); // 2448
      expect(calculateTDEE(bmr, 'moderate')).toBe(Math.round(1780 * 1.55)); // 2759
      expect(calculateTDEE(bmr, 'very_active')).toBe(Math.round(1780 * 1.725)); // 3071
    });
  });

  describe('Standard User Profiles (Unclamped)', () => {
    it('generates standard fat loss plan without clamping for high-TDEE user', () => {
      const plan = generateNutritionPlan({
        age: 30,
        gender: 'male',
        heightCm: 180,
        weightKg: 80,
        activityLevel: 'moderate',
        goal: 'lose_weight',
      });

      expect(plan.bmr).toBe(1780);
      expect(plan.tdee).toBe(2759);
      expect(plan.rawTargetCalories).toBe(2259);
      expect(plan.targetCalories).toBe(2259);
      expect(plan.isCalorieClamped).toBe(false);
      expect(plan.safetyNotice).toBeUndefined();
      expect(plan.proteinGrams).toBe(160); // 80kg * 2.0g
    });

    it('generates muscle gain plan with 300 kcal surplus', () => {
      const plan = generateNutritionPlan({
        age: 25,
        gender: 'male',
        heightCm: 175,
        weightKg: 75,
        activityLevel: 'moderate',
        goal: 'build_muscle',
      });

      expect(plan.rawTargetCalories).toBe(plan.tdee + 300);
      expect(plan.targetCalories).toBe(plan.tdee + 300);
      expect(plan.isCalorieClamped).toBe(false);
    });
  });

  describe('Low-TDEE Profiles & Safe Minimum Floor Clamping (Harvard Guidance)', () => {
    it('clamps low-TDEE female user to 1200 kcal floor and returns safety notice', () => {
      const plan = generateNutritionPlan({
        age: 45,
        gender: 'female',
        heightCm: 150,
        weightKg: 48,
        activityLevel: 'sedentary',
        goal: 'lose_weight',
      });

      expect(plan.rawTargetCalories).toBe(738);
      expect(plan.targetCalories).toBe(CALORIC_SAFETY_FLOORS.female); // 1200
      expect(plan.isCalorieClamped).toBe(true);
      expect(plan.safetyNotice).toBe(SAFETY_NOTICE_MESSAGE);
    });

    it('clamps low-TDEE male user to 1500 kcal floor and returns safety notice', () => {
      const plan = generateNutritionPlan({
        age: 60,
        gender: 'male',
        heightCm: 155,
        weightKg: 50,
        activityLevel: 'sedentary',
        goal: 'lose_weight',
      });

      expect(plan.rawTargetCalories).toBe(909);
      expect(plan.targetCalories).toBe(CALORIC_SAFETY_FLOORS.male); // 1500
      expect(plan.isCalorieClamped).toBe(true);
      expect(plan.safetyNotice).toBe(SAFETY_NOTICE_MESSAGE);
    });
  });

  describe('Macro-Sum Invariant Tests Across Extreme & Clamped Inputs', () => {
    const testProfiles: UserProfileInput[] = [
      // 1. Standard male
      { age: 30, gender: 'male', heightCm: 180, weightKg: 80, activityLevel: 'moderate', goal: 'lose_weight' },
      // 2. Standard female
      { age: 28, gender: 'female', heightCm: 165, weightKg: 60, activityLevel: 'light', goal: 'maintain' },
      // 3. Clamped low-weight female (48kg, 1200 kcal)
      { age: 50, gender: 'female', heightCm: 148, weightKg: 48, activityLevel: 'sedentary', goal: 'lose_weight' },
      // 4. Clamped high-weight female (95kg, 1200 kcal floor - test protein cap & carbs non-zero)
      { age: 55, gender: 'female', heightCm: 150, weightKg: 95, activityLevel: 'sedentary', goal: 'lose_weight' },
      // 5. Clamped very high-weight female (120kg, 1200 kcal floor)
      { age: 60, gender: 'female', heightCm: 152, weightKg: 120, activityLevel: 'sedentary', goal: 'lose_weight' },
      // 6. Clamped high-weight male (110kg, 1500 kcal floor)
      { age: 65, gender: 'male', heightCm: 160, weightKg: 110, activityLevel: 'sedentary', goal: 'lose_weight' },
      // 7. Heavy muscle builder (100kg, high calorie surplus)
      { age: 24, gender: 'male', heightCm: 190, weightKg: 100, activityLevel: 'very_active', goal: 'build_muscle' },
      // 8. Lean endurance athlete (55kg, high expenditure)
      { age: 22, gender: 'female', heightCm: 170, weightKg: 55, activityLevel: 'very_active', goal: 'maintain' },
    ];

    test.each(testProfiles)(
      'asserts macro sum invariant (P*4 + F*9 + C*4 ≈ Target) for profile: %p',
      (profile) => {
        const plan = generateNutritionPlan(profile);
        const macroSum = (plan.proteinGrams * 4) + (plan.fatGrams * 9) + (plan.carbsGrams * 4);
        
        // Assert macro sum matches target within rounding margin (<= 6 kcal)
        const diff = Math.abs(macroSum - plan.targetCalories);
        expect(diff).toBeLessThanOrEqual(6);

        // Assert carbohydrates are never silently zeroed out even for high-weight low-calorie edge cases
        expect(plan.carbsGrams).toBeGreaterThanOrEqual(15);
        expect(plan.proteinGrams).toBeGreaterThan(0);
        expect(plan.fatGrams).toBeGreaterThan(0);
      }
    );
  });
});
