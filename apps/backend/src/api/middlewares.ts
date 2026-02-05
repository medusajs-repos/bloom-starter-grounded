import { defineMiddlewares } from "@medusajs/framework/http"
import { newsletterMiddlewares } from "./store/newsletter-signup/middlewares"

export default defineMiddlewares({
  routes: [...newsletterMiddlewares],
})
