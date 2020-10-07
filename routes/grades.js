import express from "express";
import { promises as fs } from "fs";

const { readFile, writeFile } = fs;

const router = express.Router();

router.post("/", async (req, res, next) => {
    try {
        let grade = req.body;

        if (!grade.student || !grade.subject || !grade.type || grade.value == null) {
            throw new Error("Estudante, Matéria, Tipo e Valor são obrigatórios.");
        }

        const data = JSON.parse(await readFile(fileName));

        grade = {
            id: data.nextId++,
            student: grade.student,
            subject: grade.subject,
            type: grade.type,
            value: grade.value,
            timestamp: new Date()
        }
        data.grades.push(grade);

        await writeFile(fileName, JSON.stringify(data, null, 2));

        res.send(grade);
    } catch (err) {
        next(err);
    }
});

router.patch("/", async (req, res, next) => {
    try {
        let grade = req.body;

        if (!grade.student || !grade.subject || !grade.type || grade.value == null || !grade.id) {
            throw new Error("Estudante, Matéria, Tipo, Valor e Id são obrigatórios.");
        }

        const data = JSON.parse(await readFile(fileName));
        const index = data.grades.findIndex(
            g => g.id === grade.id);

        if (index === -1) {
            throw new Error("Registro não encontrado");
        }

        data.grades[index].student = grade.student;
        data.grades[index].subject = grade.subject;
        data.grades[index].type = grade.type;
        data.grades[index].value = grade.value;

        await writeFile(fileName, JSON.stringify(data, null, 2));

        res.send(data.grades[index]);
    } catch (err) {
        next(err);
    }
});

router.delete("/:id", async (req, res, next) => {
    try {
        const data = JSON.parse(await readFile(fileName));

        data.grades = data.grades.filter(
            grade => grade.id !== parseInt(req.params.id));

        await writeFile(fileName, JSON.stringify(data, null, 2));

        res.end();
    } catch (err) {
        next(err);
    }
});

router.get("/:id", async (req, res, next) => {
    try {
        const data = JSON.parse(await readFile(fileName));

        const grade = data.grades.find(
            grade => grade.id === parseInt(req.params.id));

        res.send(grade);
    } catch (err) {
        next(err);
    }
});

router.get("/total/:student/:subject", async (req, res, next) => {
    try {
        const data = JSON.parse(await readFile(fileName));

        const total = data.grades.reduce((acc, grade) => {
            if (req.params.student === grade.student && req.params.subject === grade.subject) {
                return (acc + grade.value);
            }
            return acc;
        }, 0);

        res.send(`A nota do aluno ${req.params.student} na matéria ${req.params.subject} foi ${total}.`);
    } catch (err) {
        next(err);
    }
});

router.get("/average/:type/:subject", async (req, res, next) => {
    try {
        const data = JSON.parse(await readFile(fileName));

        const filtered = data.grades
            .filter(grade => (req.params.type === grade.type && req.params.subject === grade.subject))
        const average = filtered.reduce((acc, grade) => acc + grade.value, 0) / filtered.length;

        res.send(`A média de notas do tipo ${req.params.type} na matéria ${req.params.subject} foi ${average}.`);
    } catch (err) {
        next(err);
    }
});

router.get("/better3/:type/:subject", async (req, res, next) => {
    try {
        const data = JSON.parse(await readFile(fileName));

        const filtered = data.grades
            .filter(grade => (req.params.type === grade.type && req.params.subject === grade.subject))
        filtered.sort((a, b) => b.value - a.value);
        const better3 = [filtered[0], filtered[1], filtered[2]]
        res.send(better3);
    } catch (err) {
        next(err);
    }
});


router.use((err, req, res, next) => {
    console.log(`${req.method} ${req.baseUrl} - ${err.message}`);
    res.status(400).send({ error: err.message });
});

export default router;