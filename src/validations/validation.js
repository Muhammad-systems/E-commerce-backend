import * as z from "zod";
 

export const registerValidate = z.object({
  fullname: z.object({
    firstname: z.string({ required_error: "Firstname is required" }).trim()
                .min(2, "Too short")
                .max(50, "Too long"),
    lastname: z.string().optional(),
  }),
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginValidate = z.object({
  email:z.string().min(1,"all fields are required").email("Invalid email address"),
  password:z.string().min(1,"All fields are required")
})

export const createProductValidate = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title is too long'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters'),
  category: z.string()
    .min(1, 'Category is required'), 
  price: z.number()
    .positive('Price must be greater than 0'),
  stock: z.number()
    .int('Stock must be an integer') 
    .min(0, 'Stock cannot be negative'), 
  images: z.array(z.string())
    .min(1, 'At least one image is required')
});