import express from "express"
import cors from "cors"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import prisma from "./prismaClient.js"
import cookieParser from "cookie-parser"
import axios from "axios"
import nodemailer from "nodemailer"
import PDFDocument from "pdfkit"
import path from "path"
import fs from "fs"
import { verifyToken } from "./middleware/auth.js"

const app = express()

app.use(cors({
    origin: [
        "https://new-a-ites.vercel.app",
        "http://localhost:3000"],
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
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message:
                    "Password must be at least 8 characters long, include a number, an uppercase and lowercase letter.",
            });
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
            message: "Sign Up Successful",token, user: {
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
            message: "Logged in succesfully", token, user: {
                id: existingUser.id,
                name: existingUser.name,
                email: existingUser.email
            },
        })
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" })
    }
})

app.get("/api/dashboard", verifyToken, async (req, res) => {
  const userId = req.user.id; 
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { purchases: true },
  });

  res.json({ message: "Welcome to your dashboard", user });
});



app.post("/api/user/change-password", async (req, res) => {
    try {
        const { userId, oldPassword, newPassword } = req.body;

        const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
        if (!user) return res.status(404).json({ message: "User not found" });

        const valid = await bcrypt.compare(oldPassword, user.password);
        if (!valid) return res.status(400).json({ message: "Old password is incorrect" });

        // ✅ Validate new password format
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({
                message:
                    "Password must be at least 8 characters long, include a number, an uppercase and lowercase letter.",
            });
        }

        const hashed = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashed },
        });

        res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.get("/api/logout", async (req, res) => {
    res.cookie("authToken", "", {
        httpOnly: true,
        expires: new Date(0),
        secure: true,
        sameSite: "none",
        path: "/"
    })
    res.status(200).json({ message: "Logged out successfully" });
})

// Contact me

app.post("/api/contact", async (req, res) => {
    try {
        const { email, name, message } = req.body
        if (!name || !email || !message) {
            res.status(400).json({ error: "Missing input fields" })
        }
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        })

        const mailOptions = {
            from: email,
            to: process.env.EMAIL_USER,
            subject: `A new contact form from ${name}`,
            text: message
        }

        await transporter.sendMail(mailOptions)

        res.status(200).json({ message: "Message sent successfully" })

    } catch (error) {
        res.status(500).json({ error: "Internal server error" })
    }


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

app.get("/api/products/:id", async (req, res) => {
    const { id } = req.params
    try {
        const product = await prisma.product.findUnique({ where: { id: parseInt(id) } })
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json({ data: product });
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
})

// fetch User info

app.get("/api/user/:id", async (req, res) => {
    try {
        const { id } = req.params

        const user = await prisma.user.findUnique({ where: { id: parseInt(id) }, include: { purchases: { orderBy: { createdAt: "desc" } } } })

        if (!user) {
            return res.status(400).json({ message: "User not found!" })
        }
        res.status(200).json({ data: user })
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" })
    }
})

// Payment

app.post("/api/pay", async (req, res) => {

    try {
        const { email, amount, userId, productId } = req.body

        const paystackAmount = amount * 100

        const response = await axios.post(
            "https://api.paystack.co/transaction/initialize", {
            email,
            amount: paystackAmount,
            callback_url: `${process.env.CLIENT_URL}/verify-payment`,
            metadata: { userId, productId, amount: paystackAmount },
        }, {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                "Content-Type": "application/json"
            }
        }
        )
        res.status(200).json(response.data)
    } catch (error) {
        console.error("Paystack init error:", error.response?.data || error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

app.get("/api/verify/:reference", async (req, res) => {
    console.log("💳 /api/verify HIT:", req.body);
    try {
        const { reference } = req.params

        const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
            }
        })

        const data = response.data.data
        if (data.status === "success") {
            const { userId, productId, amount } = data.metadata

            await prisma.purchase.create({
                data: {
                    userId: parseInt(userId),
                    productId: parseInt(productId),
                    reference,
                    status: "success",
                    amount: amount / 100
                }
            })

            return res.status(200).json({ success: true, message: "Payment verified and saved" });
        } else {
            return res.status(400).json({ success: false, message: "Payment not successful" });
        }

    } catch (error) {
        console.error("Verification error:", error.response?.data || error.message);
    }
})


/*Get Purchases*/
app.get('/api/purchases/:userId', async (req, res) => {
    const { userId } = req.params
    try {
        const purchases = await prisma.purchase.findMany({
            where: { userId: parseInt(userId) },
            include: { product: true },
            orderBy: { createdAt: "desc" }
        })
        res.status(200).json({ data: purchases })
    } catch (error) {
        res.status(500).json({ error: "Internal server error" })
    }
})

// receipt

app.get("/api/receipt/:reference", async (req, res) => {
    const { reference } = req.params

    console.log("this is:", reference, typeof reference)
    try {
        const purchase = await prisma.purchase.findUnique({ where: { reference }, include: { user: true, product: true } })
        console.log(purchase)
        if (!purchase) {
            res.status(400).json({ message: "Purchase not found" })
        }
        res.status(200).json({ data: purchase })
    } catch (error) {
        res.status(500).json({ error: "internal server error nooo" })
    }
})

// pdf receipt

app.get('/api/receipt/:reference/pdf', async (req, res) => {

    const { reference } = req.params

    try {
        const purchase = await prisma.purchase.findUnique({
            where: { reference },
            include: { user: true, product: true },
        });

        if (!purchase) {
            return res.status(404).json({ message: "Purchase not found" });
        }
        const doc = new PDFDocument()
        const filePath = path.join("receipts", `receipt-${reference}.pdf`)
        if (!fs.existsSync("receipts")) fs.mkdirSync("receipts");
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        doc.fontSize(22).text("Payment Receipt", { align: "center" });
        doc.moveDown();
        doc.fontSize(14).text(`Reference: ${reference}`);
        doc.text(`Date: ${new Date(purchase.createdAt).toLocaleString()}`);
        doc.moveDown();

        doc.fontSize(16).text("Product Details", { underline: true });
        doc.text(`Product Name: ${purchase.product.name}`);
        doc.text(`Description: ${purchase.product.description}`);
        doc.text(`Price: ${purchase.product.price.toLocaleString()}Naira`);
        doc.moveDown();

        doc.fontSize(16).text("Customer", { underline: true });
        doc.text(`Name: ${purchase.user.name}`);
        doc.text(`Email: ${purchase.user.email}`);
        doc.moveDown();

        doc.fontSize(16).text("Payment Summary", { underline: true });
        doc.text(`Amount Paid: ${purchase.amount.toLocaleString()} Naira`);
        doc.text(`Status: ${purchase.status}`);
        doc.moveDown();

        doc.fontSize(14).text("Thank you for your purchase!", {
            align: "center",
        });

        doc.end();

        stream.on("finish", () => {
            res.download(filePath);
        });

    } catch (error) {
        console.error("PDF Generation Error:", error.message);
        res.status(500).json({ error: "Failed to generate receipt PDF" });
    }
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log("Server running on port 5000"))

