import express from "express";
import db from "./database.js"
const router = express.Router();
router.post("/", (req, res) => {
    const {nome } = req.body;
    const resultado = db.prepare("INSERT INTO genero (nome) VALUES (?)").run(nome);
    res.status(201).json({ id: resultado.lastInsertRowid, nome });
})
router.get('/', (req, res) => {
    const generos = db.prepare("select * from genero").all();
    res.json(generos);
})
router.put('/:id', (req, res) => {
    const { nome } = req.body;
    if (!nome) {
        return res.status(400).json({ error: "nome is required" });
    }
    const resultado = db.prepare("update genero set nome = ? where id = ?").run(nome, req.params.id);
    res.json({ id: req.params.id, nome });
})
router.delete('/:id', (req, res) => {
    db.prepare("delete from genero where id = ?").run(req.params.id);
    res.status(204).send();
})
export default router; 