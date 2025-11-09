import express from "express"
import sqlite3 from "sqlite3"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import cors from "cors"
import dotenv from "dotenv"

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

// Database setup
const db = new sqlite3.Database(":memory:", (err) => {
  if (err) console.error("Database error:", err)
  else console.log("SQLite database initialized")
})

// Initialize database schema
const initializeDatabase = () => {
  db.serialize(() => {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Emission factors table
    db.run(`
      CREATE TABLE IF NOT EXISTS emission_factors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT UNIQUE NOT NULL,
        factor REAL NOT NULL,
        unit TEXT NOT NULL,
        description TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Calculations table
    db.run(`
      CREATE TABLE IF NOT EXISTS calculations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        electricity REAL,
        transport REAL,
        flights REAL,
        diet TEXT,
        total_emissions REAL,
        category_breakdown TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `)

    // Tips/Reduction suggestions table
    db.run(`
      CREATE TABLE IF NOT EXISTS reduction_tips (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL,
        tip TEXT NOT NULL,
        impact TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Seed default emission factors
    db.run(`INSERT OR IGNORE INTO emission_factors (category, factor, unit, description) 
            VALUES ('electricity', 0.92, 'kg CO2e per kWh', 'Average grid emissions factor')`)
    db.run(`INSERT OR IGNORE INTO emission_factors (category, factor, unit, description) 
            VALUES ('transport', 0.21, 'kg CO2e per km', 'Average car emissions')`)
    db.run(`INSERT OR IGNORE INTO emission_factors (category, factor, unit, description) 
            VALUES ('flight_short', 0.255, 'kg CO2e per km', 'Short haul flights')`)
    db.run(`INSERT OR IGNORE INTO emission_factors (category, factor, unit, description) 
            VALUES ('flight_medium', 0.195, 'kg CO2e per km', 'Medium haul flights')`)
    db.run(`INSERT OR IGNORE INTO emission_factors (category, factor, unit, description) 
            VALUES ('flight_long', 0.155, 'kg CO2e per km', 'Long haul flights')`)
    db.run(`INSERT OR IGNORE INTO emission_factors (category, factor, unit, description) 
            VALUES ('diet_omnivore', 0.1, 'kg CO2e per day', 'Omnivore diet')`)
    db.run(`INSERT OR IGNORE INTO emission_factors (category, factor, unit, description) 
            VALUES ('diet_vegetarian', 0.06, 'kg CO2e per day', 'Vegetarian diet')`)
    db.run(`INSERT OR IGNORE INTO emission_factors (category, factor, unit, description) 
            VALUES ('diet_vegan', 0.04, 'kg CO2e per day', 'Vegan diet')`)

    // Seed sample reduction tips
    db.run(`INSERT OR IGNORE INTO reduction_tips (category, tip, impact) 
            VALUES ('electricity', 'Switch to renewable energy providers', 'Can reduce up to 100% of grid emissions')`)
    db.run(`INSERT OR IGNORE INTO reduction_tips (category, tip, impact) 
            VALUES ('electricity', 'Install LED bulbs throughout your home', 'Saves 75% energy vs incandescent')`)
    db.run(`INSERT OR IGNORE INTO reduction_tips (category, tip, impact) 
            VALUES ('transport', 'Use public transportation 3+ days per week', 'Reduces personal transport emissions by 60%')`)
    db.run(`INSERT OR IGNORE INTO reduction_tips (category, tip, impact) 
            VALUES ('transport', 'Switch to electric or hybrid vehicle', 'Can reduce emissions by up to 50%')`)
    db.run(`INSERT OR IGNORE INTO reduction_tips (category, tip, impact) 
            VALUES ('flights', 'Limit flights to 1-2 per year', 'One long haul flight ≈ 1 year car emissions')`)
    db.run(`INSERT OR IGNORE INTO reduction_tips (category, tip, impact) 
            VALUES ('diet', 'Reduce meat consumption to 2-3 times per week', 'Can reduce diet emissions by 50%')`)

    // Seed sample admin user
    const hashedPassword = bcrypt.hashSync("teacher123", 10)
    db.run(
      `INSERT OR IGNORE INTO users (email, password, name, role) 
            VALUES ('teacher@example.com', ?, 'Teacher Admin', 'admin')`,
      [hashedPassword],
    )

    // Seed sample regular user
    const studentPassword = bcrypt.hashSync("student123", 10)
    db.run(
      `INSERT OR IGNORE INTO users (email, password, name, role) 
            VALUES ('student@example.com', ?, 'Student User', 'user')`,
      [studentPassword],
    )

    console.log("Database schema initialized with seed data")
  })
}

initializeDatabase()

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

// Helper functions
const queryAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err)
      else resolve(rows)
    })
  })
}

const runAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err)
      else resolve(this)
    })
  })
}

// Auth middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]
  if (!token) return res.status(401).json({ error: "No token provided" })

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.userId = decoded.userId
    req.role = decoded.role
    next()
  } catch (err) {
    res.status(403).json({ error: "Invalid token" })
  }
}

const verifyAdmin = (req, res, next) => {
  if (req.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" })
  }
  next()
}

// Auth routes
app.post("/api/auth/signup", async (req, res) => {
  const { email, password, name } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" })
  }

  try {
    const hashedPassword = bcrypt.hashSync(password, 10)
    await runAsync("INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)", [
      email,
      hashedPassword,
      name || email.split("@")[0],
      "user",
    ])

    const token = jwt.sign({ userId: email, role: "user" }, JWT_SECRET, { expiresIn: "7d" })
    res.json({ token, user: { email, name: name || email.split("@")[0], role: "user" } })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" })
  }

  try {
    const users = await queryAsync("SELECT * FROM users WHERE email = ?", [email])

    if (users.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const user = users[0]
    const isValid = bcrypt.compareSync(password, user.password)

    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const token = jwt.sign({ userId: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" })
    res.json({ token, user: { email: user.email, name: user.name, role: user.role } })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Calculation routes
app.post("/api/calculations", verifyToken, async (req, res) => {
  const { electricity, transport, flights, diet } = req.body

  try {
    // Get emission factors
    const factors = await queryAsync("SELECT * FROM emission_factors")
    const factorMap = Object.fromEntries(factors.map((f) => [f.category, f.factor]))

    // Calculate emissions
    const electricityEmissions = (electricity || 0) * 12 * factorMap.electricity
    const transportEmissions = (transport || 0) * 52 * factorMap.transport

    // Flights calculation (assume 1000km, 2000km, 10000km for short/medium/long)
    const flightShort = (flights?.short || 0) * 1000 * factorMap.flight_short
    const flightMedium = (flights?.medium || 0) * 2000 * factorMap.flight_medium
    const flightLong = (flights?.long || 0) * 10000 * factorMap.flight_long
    const flightsEmissions = flightShort + flightMedium + flightLong

    // Diet calculation
    const dietFactor = factorMap[`diet_${diet}`] || factorMap.diet_omnivore
    const dietEmissions = dietFactor * 365

    const total = electricityEmissions + transportEmissions + flightsEmissions + dietEmissions

    const breakdown = {
      electricity: electricityEmissions,
      transport: transportEmissions,
      flights: flightsEmissions,
      diet: dietEmissions,
    }

    const result = await runAsync(
      "INSERT INTO calculations (user_id, electricity, transport, flights, diet, total_emissions, category_breakdown) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [req.userId, electricity, transport, JSON.stringify(flights), diet, total, JSON.stringify(breakdown)],
    )

    res.json({
      id: result.lastID,
      total: Math.round(total * 100) / 100,
      breakdown,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get("/api/calculations", verifyToken, async (req, res) => {
  try {
    const calculations = await queryAsync("SELECT * FROM calculations WHERE user_id = ? ORDER BY created_at DESC", [
      req.userId,
    ])

    calculations.forEach((calc) => {
      calc.category_breakdown = JSON.parse(calc.category_breakdown)
      calc.flights = JSON.parse(calc.flights)
    })

    res.json(calculations)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Tips routes
app.get("/api/tips/:category", async (req, res) => {
  try {
    const tips = await queryAsync("SELECT * FROM reduction_tips WHERE category = ? LIMIT 5", [req.params.category])
    res.json(tips)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Admin routes
app.get("/api/admin/emission-factors", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const factors = await queryAsync("SELECT * FROM emission_factors")
    res.json(factors)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.put("/api/admin/emission-factors/:id", verifyToken, verifyAdmin, async (req, res) => {
  const { factor, description } = req.body

  try {
    await runAsync(
      "UPDATE emission_factors SET factor = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [factor, description, req.params.id],
    )
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post("/api/admin/tips", verifyToken, verifyAdmin, async (req, res) => {
  const { category, tip, impact } = req.body

  try {
    const result = await runAsync("INSERT INTO reduction_tips (category, tip, impact) VALUES (?, ?, ?)", [
      category,
      tip,
      impact,
    ])
    res.json({ id: result.lastID, category, tip, impact })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.delete("/api/admin/tips/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    await runAsync("DELETE FROM reduction_tips WHERE id = ?", [req.params.id])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
