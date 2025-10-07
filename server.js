import express from "express"
import cors from "cors"

const app = express()

app.use(cors())
app.use(express.json())

app.get("/api/hello",(req,res)=>{
res.json({message:"Yello bro!"})
})

app.post("/api/contact", (req, res) => {
  const { name, email, message } = req.body;
  res.json({ success: true, data: { name, email, message } });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


