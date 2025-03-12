import express from 'express'
import mysql from 'mysql2'

const app = express()
app.use(express.json())

const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'username',
  password: 'pass',
  database: 'combinations_db'
}).promise()

const generateCombinations = (items, length) => {
  const groups = {}
  items.forEach(item => {
    const key = item[0]
    if (!groups[key]) groups[key] = []
    groups[key].push(item)
  })

  const uniqueGroups = Object.values(groups)
  const result = []

  const backtrack = (index, path) => {
    if (path.length === length) {
      result.push([...path])
      return
    }
    for (let i = index; i < uniqueGroups.length; i++) {
      for (let item of uniqueGroups[i]) {
        path.push(item)
        backtrack(i + 1, path)
        path.pop()
      }
    }
  }
  
  backtrack(0, [])
  return result
}

app.post("/generate", async (req, res) => {
  const { items, length } = req.body
  if (!Array.isArray(items) || typeof length !== "number" || length <= 0) {
    return res.status(400).json({ error: "Invalid input format" })
  }

  const combinations = generateCombinations(items, length)

  try {
    const connection = await pool.getConnection()
    await connection.beginTransaction()

    await connection.query(
      "INSERT IGNORE INTO items (name) VALUES ?",
      [items.map(item => [item])]
    )

    const combinationIds = []
    for (let combo of combinations) {
      const [result] = await connection.query(
        "INSERT INTO combinations (combination) VALUES (?)",
        [JSON.stringify(combo)]
      )
      combinationIds.push(result.insertId)
    }

    const [responseResult] = await connection.query(
      "INSERT INTO responses (combination_ids) VALUES (?)",
      [JSON.stringify(combinationIds)]
    )

    await connection.commit()
    connection.release()
    res.json({ id: responseResult.insertId, combination: combinations })
  } catch (error) {
    res.status(500).send('Database error')
  }
})

app.listen(3000, () => console.log("Server running on port 3000"))
