import express from "express";
import db from "./database.js"
const router = express.Router();
router.post("/", (req, res) => {
    const { descricao } = req.body;
    const resultado = db.prepare("INSERT INTO indicacao (descricao,status) VALUES (?,?)").run(descricao, "disponivel");
    res.status(201).json({ id: resultado.lastInsertRowid, descricao });
})
router.get('/', (req, res) => {
    const indicacao = db.prepare("select * from indicacao where status !='indisponivel'").all();
    res.json(indicacao);
})
router.put('/:id', (req, res) => {
    const { status } = req.body;
    if (!status) {
        return res.status(400).json({ error: "Status is required" });
    }
    const resultado = db.prepare("update indicacao set status = ? where id = ?").run(status, req.params.id);
    res.json({ id: req.params.id, status });
})
export default router;
