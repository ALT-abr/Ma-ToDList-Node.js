const fs = require("node:fs/promises");
const path = require("node:path");
const pool = require('../config/db'); // ajuster le chemin si besoin

// Construit le chemin absolu vers data/tasks.json
const FILE = path.join(__dirname, "..", "data", "tasks.json");

async function readTasks() {
  // Lit et parse le fichier JSON
  // const content = await fs.readFile(FILE, "utf8");
  // return JSON.parse(content);

  // Lit et parse avec la base de données MySQL
  const [rows] = await pool.execute(
    'SELECT id, title, completed, created_at FROM tasks ORDER BY id'
  );
  return rows.map(task => ({
      id: task.id,
      title: task.title,
      done: Boolean(task.completed),
      created_at: task.created_at
  }));
}

// Récupère une tâche par son ID depuis la base de données MySQL
async function getTaskById(id) {
    const [rows] = await pool.execute(
        "SELECT id, title, completed, created_at FROM tasks WHERE id = ?",
        [id]
    );

    if (rows.length === 0) {
        return null;
    }

    const task = rows[0];

    return {
        id: task.id,
        title: task.title,
        done: Boolean(task.completed),
        created_at: task.created_at
    };
}

async function createTask(title) {
    const [result] = await pool.execute(
        "INSERT INTO tasks (title, completed) VALUES (?, ?)",
        [title, 0]
    );

    return {
        id: result.insertId,
        title: title,
        done: false
    };
}

async function updateTask(id, title, done) {
    const [result] = await pool.execute(
        "UPDATE tasks SET title = ?, completed = ? WHERE id = ?",
        [title, done ? 1 : 0, id]
    );

    if (result.affectedRows === 0) {
        return null;
    }

    return getTaskById(id);
}

async function patchTask(id, done) {
    const [result] = await pool.execute(
        "UPDATE tasks SET completed = ? WHERE id = ?",
        [done ? 1 : 0, id]
    );

    if (result.affectedRows === 0) {
        return null;
    }

    return getTaskById(id);
}

async function deleteTask(id) {
    const [result] = await pool.execute(
        "DELETE FROM tasks WHERE id = ?",
        [id]
    );

    return result.affectedRows > 0;
}


// Sérialise et écrit les tâches sur le disque
// async function writeTasks(tasks) {
//   const json = JSON.stringify(tasks, null, 2);
//   await fs.writeFile(FILE, json, "utf8");
// } 

module.exports = { readTasks, createTask, updateTask, patchTask, deleteTask, getTaskById };