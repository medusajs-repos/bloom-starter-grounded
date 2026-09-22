import { defineMiddlewares } from "@medusajs/framework/http"
import { newsletterMiddlewares } from "./store/newsletter-signup/middlewares"
import { storeSearchMiddlewares } from "./store/search/middlewares"

export default defineMiddlewares({
  routes: [...newsletterMiddlewares, ...storeSearchMiddlewares],
})
