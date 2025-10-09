import express from "express"
import cors from "cors"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import prisma from "./prismaClient.js"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));
app.use(express.json())
app.use(cookieParser())

app.post("/api/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body

        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" })
        }

        const existingUser = await prisma.user.findUnique({ where: { email } })
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" })
        }
        const hashedpassword = await bcrypt.hash(password, 10)
        const user = await prisma.user.create({
            data: { name, email, password: hashedpassword }
        })

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" })
        res.cookie("authToken", token, {
            httpOnly: true,
            sameSite: "none",
            secure: true
        })

        res.status(201).json({
            message: "Sign Up Successful", user: {
                id: user.id,
                name: user.name,
                email: user.email
            },
        })

    } catch (err) {
        console.log("Error:", err)
        res.status(500).json({ error: "Internal Server Error" });
    }


})


app.post("/api/login", async (req, res) => {


    try {
        const { email, password } = req.body
        if (!email || !password) {
            return res.status(401).json({ message: "Please input required fields" })
        }
        const existingUser = await prisma.user.findUnique({ where: { email } })
        if (!existingUser) {
            return res.status(401).json({ message: "User does not exist" })
        }
        const comparePass = await bcrypt.compare(password, existingUser.password)
        if (!comparePass) {
            return res.status(401).json({ message: "Incorrect password!Try again please." })
        }

        const token = jwt.sign({ userId: existingUser.id }, process.env.JWT_SECRET, { expiresIn: "1h" })
        res.cookie("authToken", token, {
            httpOnly: true,
            sameSite: "none",
            secure: true
        })

        res.status(201).json({
            message: "Logged in succesfully", user: {
                id: existingUser.id,
                name: existingUser.name,
                email: existingUser.email
            },
        })
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" })
    }
})
app.get("/api/logout", async (req,res)=>{
res.cookie("authToken","",{
    httpOnly:true,
    expires: new Date(0),
        secure: true,
    sameSite: "none",
    path:"/"
})
res.status(200).json({ message: "Logged out successfully" });
})

app.get("/api/products", async (req, res) => {
  try {
    const allProducts = await prisma.product.findMany();
    res.status(200).json({ data: allProducts });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log("Server running on port 5000"))

