import { MiddlewareRoute, validateAndTransformBody } from "@medusajs/framework"
import { z } from "zod"

const NewsletterSignupSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
})

export const newsletterMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/store/newsletter-signup",
    method: "POST",
    middlewares: [validateAndTransformBody(NewsletterSignupSchema)],
  },
]
