"use client";
import { useState, useEffect } from 'react';

interface Todo {
    id: number;
    task: string;
    completed: boolean;
}

export default function TodoList() {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [task, setTask] = useState<string>('');
    const [editId, setEditId] = useState<number | null>(null);
    const [page, setPage] = useState<number>(1);
    const [total, setTotal] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        setLoading(true);
        fetch(`http://localhost:5000/todos?page=${page}`)
            .then(response => response.json())
            .then(data => {
                setTodos(data.todos);
                setTotal(data.total);
                setLoading(false);
            });
    }, [page]);

    const addOrEditTodo = () => {
        setLoading(true);
        if (editId) {
            fetch(`http://localhost:5000/todos/${editId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ task })
            })
            .then(response => response.json())
            .then(updatedTodo => {
                setTodos(todos.map(todo => (todo.id === editId ? updatedTodo : todo)));
                setEditId(null);
                setTask('');
                setLoading(false);
            });
        } else {
            fetch('http://localhost:5000/todos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ task })
            })
            .then(response => response.json())
            .then(newTodo => {
                setTodos([...todos, newTodo]);
                setTask('');
                setLoading(false);
            });
        }
    };

    const deleteTodo = (id: number) => {
        setLoading(true);
        fetch(`http://localhost:5000/todos/${id}`, { method: 'DELETE' })
        .then(() => {
            setTodos(todos.filter(todo => todo.id !== id));
            setLoading(false);
        });
    };

    const editTodo = (todo: Todo) => {
        setTask(todo.task);
        setEditId(todo.id);
    };

    return (
        <div className="container">
            <h1 className="title">Todo List</h1>
            <div className="input-container">
                <input className="input" value={task} onChange={(e) => setTask(e.target.value)} />
                <button className="button" onClick={addOrEditTodo}>{editId ? 'Update Task' : 'Add Task'}</button>
            </div>
            {loading && <div className="loading">Loading...</div>}
            <ul className="todo-list">
                {todos.map(todo => (
                    <li key={todo.id} className="todo-item">
                        {todo.task} 
                        <div className="buttons">
                        <button className="edit-button" onClick={() => editTodo(todo)}>Edit</button>
                        <button className="delete-button" onClick={() => deleteTodo(todo.id)}>Delete</button>
                        </div>
                    </li>
                ))}
            </ul>
            <div className="pagination">
                <button className="page-button" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>
                <span> Page {page} </span>
                <button className="page-button" disabled={page * 10 >= total} onClick={() => setPage(page + 1)}>Next</button>
            </div>
        </div>
    );
}
