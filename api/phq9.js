export default function handler(req, res) {
  const score = req.body.score
  console.log("PHQ-9 score received:", score)
  res.status(200).json({ message: "Score received" })
}
