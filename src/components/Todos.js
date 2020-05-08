import React, { useState, useRef } from "react";
import useSWR from "swr";
import { useRefState } from "../lib/hooks";
import { fetcher } from "../lib/data-fetching";
import { v4 } from "uuid";

export default function Todos() {
  let [newTodo, setNewTodo] = useState({ text: "", isDone: false });
  let [savingCount, setSavingCount] = useState(0);
  let newTodoInputRef = useRef();

  const { data, mutate: mutateTodos } = useSWR("/api/todos");

  async function createTodo(event) {
    event.preventDefault();
    setSavingCount((savingCount) => ++savingCount);

    let tempId = v4();

    // Optimistically updates the cache
    await mutateTodos((data) => {
      return {
        ...data,
        todos: [...data.todos, { ...newTodo, id: tempId }],
      };
    }, false);

    // Reset the new todo textbox
    setNewTodo({ text: "", isDone: false });

    // Create the todo
    try {
      let json = await fetcher("/api/todos", {
        method: "POST",
        body: JSON.stringify({ todo: newTodo }),
      });

      await mutateTodos((data) => {
        return {
          ...data,
          todos: data.todos.map((todo) =>
            todo.id === tempId ? json.todo : todo
          ),
        };
      }, false);
    } catch (err) {
      // Revert changes on error
      await mutateTodos((data) => {
        return {
          ...data,
          todos: data.todos.filter((todo) => todo.id !== tempId),
        };
      }, false);
      setNewTodo(newTodo);
    }

    setSavingCount((savingCount) => --savingCount);
  }

  function handleChange(event) {
    setNewTodo({ ...newTodo, text: event.target.value });
  }

  return (
    <div className="max-w-sm px-4 py-6 mx-auto bg-white rounded shadow-lg">
      <div className="flex items-center justify-between px-3">
        <h1 className="text-2xl font-bold">Todos</h1>

        <div className="text-blue-500">
          {/* Saving indicator */}
          {savingCount > 0 && (
            <svg
              className="w-4 h-4 fill-current"
              viewBox="0 0 20 20"
              data-testid="saving"
            >
              <path d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1z" />
            </svg>
          )}
        </div>
      </div>

      <div className="mt-6">
        {!data ? (
          <p className="px-3 text-gray-500" data-testid="loading">
            Loading...
          </p>
        ) : (
          <div>
            <div className="px-3">
              <form onSubmit={createTodo} data-testid="new-todo-form">
                <input
                  type="text"
                  value={newTodo.text}
                  onChange={handleChange}
                  placeholder="New todo"
                  ref={newTodoInputRef}
                  className={`block w-full px-3 py-2 placeholder-gray-500 bg-white rounded shadow focus:outline-none`}
                />
              </form>
            </div>

            {data.todos.length > 0 ? (
              <ul className="mt-8">
                {data.todos.map((todo) => (
                  <Todo todo={todo} onChange={() => {}} key={todo.id} />
                ))}
              </ul>
            ) : (
              <p
                className="px-3 mt-16 text-lg text-center text-gray-500"
                data-testid="no-todos"
              >
                Everything's done!
              </p>
            )}

            <div className="flex justify-between px-3 mt-12 text-sm font-medium text-gray-500">
              {data.todos.length > 0 ? (
                <p data-testid="completed-todos">
                  {data.todos.filter((todo) => todo.isDone).length} /{" "}
                  {data.todos.length} complete
                </p>
              ) : null}
              {data.todos.filter((todo) => todo.isDone).length > 0 ? (
                <button
                  onClick={() => {}}
                  className="font-medium text-blue-500 focus:outline-none focus:text-blue-300"
                  data-testid="clear-completed"
                >
                  Clear completed
                </button>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Todo({ todo, onChange }) {
  let [isFocused, setIsFocused] = useState(false);
  let [localTodoRef, setLocalTodo] = useRefState({ ...todo });

  function handleChange(event) {
    setLocalTodo({ ...localTodoRef.current, ...{ text: event.target.value } });
  }

  function handleCheck(event) {
    setLocalTodo({
      ...localTodoRef.current,
      ...{ isDone: event.target.checked },
    });

    commitChanges();
  }

  function handleSubmit(event) {
    event.preventDefault();
    commitChanges(localTodoRef.current);
  }

  function commitChanges() {
    setIsFocused(false);

    let hasChanges =
      localTodoRef.current.text !== todo.text ||
      localTodoRef.current.isDone !== todo.isDone;

    if (hasChanges) {
      onChange(localTodoRef.current);
    }
  }

  return (
    <li
      className={`
        my-1 rounded focus:bg-white border-2 flex items-center relative
        ${isFocused ? "bg-white border-gray-300" : ""}
        ${!isFocused ? "border-transparent hover:bg-gray-200" : ""}
        ${!isFocused && localTodoRef.current.isDone ? "opacity-50" : ""}
      `}
      data-testid="todo"
      data-todoid={localTodoRef.current.id}
    >
      <input
        type="checkbox"
        checked={localTodoRef.current.isDone}
        onChange={handleCheck}
        className="ml-2"
      />

      <form onSubmit={handleSubmit} className="relative w-full">
        <input
          type="text"
          value={localTodoRef.current.text}
          onChange={handleChange}
          placeholder="New Todo"
          onFocus={() => setIsFocused(true)}
          onBlur={commitChanges}
          className={`
            bg-transparent focus:outline-none px-3 py-1 block w-full
            ${localTodoRef.current.isDone && !isFocused ? "line-through" : ""}
          `}
        />
      </form>
    </li>
  );
}
