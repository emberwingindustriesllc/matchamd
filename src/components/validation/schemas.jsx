import { z } from 'zod';

export const onboardingSchemas = {
  step1: z.object({
    primary_goal: z.enum(['residency', 'fellowship', 'med_school'], {
      required_error: 'Please select your primary goal'
    })
  }),
  
  step2: z.object({
    country: z.string().min(1, 'Country is required'),
    target_state: z.string().optional(),
    target_city: z.string().optional()
  }),
  
  step3: z.object({
    medical_school: z.string().min(1, 'Medical school name is required'),
    medical_school_country: z.string().min(1, 'Medical school country is required'),
    graduation_year: z.number().min(1990).max(2030, 'Invalid graduation year')
  }),
  
  step4: z.object({
    target_specialty: z.string().min(1, 'Please select a specialty'),
    usmle_step1_status: z.enum(['not_started', 'studying', 'scheduled', 'passed', 'na']),
    usmle_step2_status: z.enum(['not_started', 'studying', 'scheduled', 'passed', 'na'])
  })
};

export const profileSchema = z.object({
  display_name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  languages: z.array(z.string()).min(1, 'Select at least one language'),
  visa_status: z.enum(['none', 'j1', 'h1b', 'green_card', 'citizen', 'other']).optional(),
  us_clinical_experience: z.boolean()
});

export const mentorRequestSchema = z.object({
  message: z.string()
    .min(20, 'Please write at least 20 characters')
    .max(1000, 'Message must be less than 1000 characters'),
  goal: z.enum(['residency', 'fellowship', 'med_school']),
  specialty_interest: z.string().min(1, 'Specialty is required')
});

export const postSchema = z.object({
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must be less than 200 characters'),
  content: z.string()
    .min(10, 'Content must be at least 10 characters')
    .max(5000, 'Content must be less than 5000 characters'),
  category: z.enum([
    'usmle_prep',
    'visa_questions',
    'eras_tips',
    'interviews',
    'match',
    'fellowship',
    'med_school',
    'general',
    'success_stories'
  ]),
  tags: z.array(z.string()).max(5, 'Maximum 5 tags allowed').optional()
});

export const commentSchema = z.object({
  content: z.string()
    .min(1, 'Comment cannot be empty')
    .max(2000, 'Comment must be less than 2000 characters')
});