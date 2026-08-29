export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type EquipmentType = 'bodyweight' | 'dumbbells' | 'resistance_bands' | 'full_gym';

export interface Exercise {
  id: string;
  name: string;
  targetMuscle: string;
  sets: number;
  repsOrDuration: string;
  restSeconds: number;
  instructions: string;
  tips?: string;
}

export interface WorkoutRoutine {
  id: string;
  title: string;
  difficulty: DifficultyLevel;
  durationMinutes: number;
  estimatedCaloriesBurned: number;
  equipment: EquipmentType[];
  category: 'strength' | 'hiit' | 'cardio' | 'mobility' | 'core';
  description: string;
  exercises: Exercise[];
}

export interface WorkoutLogEntry {
  id: string;
  userId: string;
  workoutId: string;
  workoutTitle: string;
  durationMinutes: number;
  caloriesBurned?: number;
  completedAt: string;
}
