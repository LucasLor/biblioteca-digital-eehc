import express from "express";
import db from "./database.js"
const router = express.Router();
router.post("/", (req, res) => {
    const { descricao } = req.body;
    const resultado = db.prepare("INSERT INTO indicacao (descricao) VALUES (?)").run(descricao);
    res.status(201).json({ id: resultado.lastInsertRowid, descricao });
})