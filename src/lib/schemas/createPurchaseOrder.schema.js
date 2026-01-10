import { z } from "zod";
import { UNIT_OF_MEASUREMENT } from "@/constants/entities";

const orderItemSchema = z.object({
  productId: z.string().min(1, "Please select a product"),
  quantity: z
    .number({ invalid_type_error: "Quantity must be a number" })
    .positive("Quantity must be greater than 0"),
  unit: z.enum(Object.values(UNIT_OF_MEASUREMENT), {
    errorMap: () => ({ message: "Please select a valid unit" }),
  }),
});

export const createPurchaseOrderSchema = z.object({
  vendorId: z.string().min(1, "Please select a vendor"),
  plantId: z.string().min(1, "Please select a plant"),
  expectedDeliveryDate: z
    .string()
    .min(1, "Please select expected delivery date")
    .refine((date) => {
      const selected = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selected >= today;
    }, "Expected delivery date cannot be in the past"),
  orderItems: z
    .array(orderItemSchema)
    .min(1, "Please add at least one item"),
});

/**
 * @typedef {z.infer<typeof createPurchaseOrderSchema>} CreatePurchaseOrderInput
 * @typedef {z.infer<typeof orderItemSchema>} OrderItemInput
 */
