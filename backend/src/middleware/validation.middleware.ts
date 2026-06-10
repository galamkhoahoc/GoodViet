import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema, ZodError } from 'zod';
import validator from 'validator';

/**
 * Validation middleware factory
 * Creates middleware that validates request body against a Zod schema
 */
export function validateRequest(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Validate and parse request body
      const validated = schema.parse(req.body);
      
      // Replace request body with validated data
      req.body = validated;
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format validation errors
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        res.status(400).json({
          error: 'Validation failed',
          message: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.',
          details: errors,
        });
      } else {
        next(error);
      }
    }
  };
}

/**
 * Common validation schemas
 */
export const validationSchemas = {
  /**
   * User registration schema
   */
  register: z.object({
    email: z
      .string()
      .email('Email không hợp lệ')
      .toLowerCase()
      .trim(),
    password: z
      .string()
      .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
      .regex(/[A-Za-z]/, 'Mật khẩu phải có ít nhất 1 chữ cái')
      .regex(/\d/, 'Mật khẩu phải có ít nhất 1 số'),
    fullName: z
      .string()
      .min(2, 'Tên phải có ít nhất 2 ký tự')
      .max(100, 'Tên không được quá 100 ký tự')
      .trim()
      .transform(val => validator.escape(val)),
    phoneNumber: z
      .string()
      .regex(/^0\d{9}$/, 'Số điện thoại không hợp lệ')
      .optional(),
    age: z
      .number()
      .int('Tuổi phải là số nguyên')
      .min(18, 'Tuổi phải từ 18 trở lên')
      .max(100, 'Tuổi không hợp lệ')
      .optional(),
    targetGoals: z
      .string()
      .transform(val => validator.escape(val))
      .optional(),
  }),

  /**
   * User login schema
   */
  login: z.object({
    email: z
      .string()
      .email('Email không hợp lệ')
      .toLowerCase()
      .trim(),
    password: z.string().min(1, 'Mật khẩu không được để trống'),
  }),

  /**
   * Update profile schema
   */
  updateProfile: z.object({
    fullName: z
      .string()
      .min(2, 'Tên phải có ít nhất 2 ký tự')
      .max(100, 'Tên không được quá 100 ký tự')
      .trim()
      .transform(val => validator.escape(val))
      .optional(),
    phoneNumber: z
      .string()
      .regex(/^0\d{9}$/, 'Số điện thoại không hợp lệ')
      .optional(),
    dateOfBirth: z
      .string()
      .datetime()
      .optional(),
    profileImageUrl: z.string().url('URL ảnh không hợp lệ').optional(),
    targetGoals: z.string().transform(val => validator.escape(val)).optional(),
    learningStyle: z.string().transform(val => validator.escape(val)).optional(),
  }),
};
