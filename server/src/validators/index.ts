import { z } from 'zod';

const mediaUrlSchema = z.string().trim().max(500).refine(
  val => val === '' || /^https?:\/\//.test(val) || /^\//.test(val),
  { message: 'URL deve ser absoluta (http/https), relativa (/caminho) ou vazia' },
);

export const registerSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres.'),
  fullName: z.string().trim().min(1).max(120).optional().default(''),
  companyName: z.string().trim().max(120).optional().default(''),
  cnpj: z.string().trim().max(32).optional().default(''),
  phone: z.string().trim().max(32).optional().default(''),
  customerType: z.string().trim().max(64).optional().default(''),
  city: z.string().trim().max(120).optional().default(''),
  state: z.string().trim().max(2).optional().default(''),
  cep: z.string().trim().max(16).optional().default(''),
  addressStreet: z.string().trim().max(180).optional().default(''),
  addressNumber: z.string().trim().max(16).optional().default(''),
  addressComplement: z.string().trim().max(160).optional().default(''),
  addressNeighborhood: z.string().trim().max(120).optional().default(''),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1, 'Senha é obrigatória'),
});

const orderItemSchema = z.object({
  product_id: z.string().trim().min(1),
  product_name: z.string().trim().min(1).max(180),
  product_sku: z.string().trim().max(64).optional().default(''),
  quantity: z.coerce.number().int().positive(),
  unit_price: z.coerce.number().nonnegative(),
});

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'O pedido precisa ter pelo menos um item'),
  notes: z.string().trim().max(1000).optional().default(''),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']),
});

const baseProductSchema = z.object({
  name: z.string().trim().min(1).max(180),
  sku: z.string().trim().max(64).optional().default(''),
  category: z.string().trim().max(120).optional().default(''),
  price: z.number().nonnegative(),
  stock_quantity: z.number().int().nonnegative(),
  image_url: mediaUrlSchema.optional().default(''),
  images: z.array(mediaUrlSchema).optional().default([]),
  description: z.string().trim().max(4000).optional().default(''),
  status: z.enum(['draft', 'published']).optional().default('draft'),
});

export const createProductSchema = baseProductSchema;

export const updateProductSchema = baseProductSchema;

const variationSchema = z.object({
  name: z.string().trim().min(1).max(120),
  sku: z.string().trim().max(64).optional().default(''),
  price_modifier: z.number().default(0),
  stock_quantity: z.number().int().nonnegative().default(0),
  image_url: mediaUrlSchema.optional().default(''),
  sort_order: z.number().int().nonnegative().default(0),
});

export const upsertVariationsSchema = z.array(variationSchema);

export const updateRoleSchema = z.object({
  role: z.enum(['b2b_pending', 'b2b_approved', 'b2b_rejected', 'admin']),
});

export const contactSubmissionSchema = z.object({
  name: z.string().trim().min(1).max(180),
  email: z.string().trim().email(),
  phone: z.string().trim().max(32).optional().default(''),
  subject: z.string().trim().max(180).optional().default(''),
  message: z.string().trim().min(1).max(2000),
});

const blogPostSchema = z.object({
  title: z.string().trim().min(1).max(180),
  content: z.string().trim().min(1),
  excerpt: z.string().trim().max(360).optional().default(''),
  category: z.string().trim().max(120).optional().default(''),
  image_url: mediaUrlSchema.optional().default(''),
});

export const createPostSchema = blogPostSchema;
export const updatePostSchema = blogPostSchema;

export const categorySchema = z.object({
  name: z.string().trim().min(1).max(120),
  slug: z.string().trim().min(1).max(180),
  parent_id: z.string().trim().min(1).optional().nullable(),
});

export const idParamSchema = z.object({
  id: z.string().trim().min(1),
});

export const paginationSchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(20),
  offset: z.coerce.number().int().nonnegative().default(0),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z.string().min(8, 'Nova senha deve ter pelo menos 8 caracteres'),
});

export const shippingMethodSchema = z.object({
  name: z.string().trim().min(1).max(180),
  description: z.string().trim().max(500).optional().default(''),
  price: z.number().nonnegative().default(0),
  regions: z.array(z.string().trim().max(120)).optional().default([]),
  estimated_days: z.string().trim().max(120).optional().default(''),
  sort_order: z.number().int().nonnegative().default(0),
  active: z.boolean().default(true),
});

export const paymentMethodSchema = z.object({
  name: z.string().trim().min(1).max(180),
  description: z.string().trim().max(500).optional().default(''),
  icon: z.string().trim().max(64).optional().default(''),
  discount_text: z.string().trim().max(120).optional().nullable(),
  sort_order: z.number().int().nonnegative().default(0),
  active: z.boolean().default(true),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductVariationInput = z.infer<typeof variationSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type ContactSubmissionInput = z.infer<typeof contactSubmissionSchema>;
