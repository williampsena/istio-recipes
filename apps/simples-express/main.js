const joker = require("./lib/joker")
const express = require("express")
const app = express()
const cookieParser = require("cookie-parser")

const K_REVISION = process.env.K_REVISION || "express-sticky-v99"
const REV = process.env.REVISION || "v99"
const PORT = parseInt(process.env.PORT || "3000")
const HOME_VIEW = `home.${REV}.hbs`
const SESSION_DURATION = 3600
const COOKIE_NAME = "session-version"

app.use(cookieParser())
app.set("view engine", "hbs")

app.get("/", async (req, res) => {
  const sessionVersion = req.cookies[COOKIE_NAME]

  if (!sessionVersion) {
    res.cookie(COOKIE_NAME, K_REVISION, {
      maxAge: SESSION_DURATION * 1000,
      httpOnly: true,
      path: "/",
    })
  }

  const joke = await joker.fetchJoke()

  console.debug(`🏞️ Using view: ${HOME_VIEW}`)

  res.render(HOME_VIEW, {
    revision: REV,
    title: `🏠 Home ${REV}`,
    subject: `📚 Using Knative revision ${K_REVISION} at image revision ${REV}`,
    message: `😂 ${joke} 🙃`,
    stickyCookie: sessionVersion || "generated now",
  })
})

app.get("/health", (_req, res) => {
  res.json({ status: "healthy", version: K_REVISION })
})

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`)
})
