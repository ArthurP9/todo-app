import React, { useState, useEffect } from "react";
import Modal from "./components/Modal";
import axios from "axios";
import { getCSRFToken } from './utils';  // Importer l'intercepteur

function App() {
  // Initialisation de l'état avec useState
  const [viewCompleted, setViewCompleted] = useState(false);
  const [todoList, setTodoList] = useState([]);
  const [modal, setModal] = useState(false);
  const [activeItem, setActiveItem] = useState({
    title: "",
    description: "",
    completed: false,
  });

  // useEffect remplace componentDidMount
  useEffect(() => {
    refreshList();
  }, []);

  // Fonction pour rafraîchir la liste des tâches
  const refreshList = () => {
    axios
      .get("http://localhost:8000/api/todos/")
      .then((res) => setTodoList(res.data))
      .catch((err) => console.log(err));
  };

  // Fonction pour basculer l'état de la modal
  const toggle = () => {
    setModal(!modal);
  };

  // Fonction pour soumettre une nouvelle tâche ou mettre à jour une tâche existante
  const handleSubmit = (item) => {
    toggle();

    if (item.id) {
      axios
        .put(`http://localhost:8000/api/todos/${item.id}/`, item, {
          headers: {
            "X-CSRFToken": getCSRFToken(),
          },
        })
        .then((res) => refreshList())
        .catch((err) => console.log(err));
      return;
    }
    axios
      .post("http://localhost:8000/api/todos/", item, {
        headers: {
          "X-CSRFToken": getCSRFToken(),
        },
      })
      .then((res) => refreshList())
      .catch((err) => console.log(err));
  };

  // Fonction pour supprimer une tâche
  const handleDelete = (item) => {
    axios
      .delete(`http://localhost:8000/api/todos/${item.id}/`, {
        headers: {
          "X-CSRFToken": getCSRFToken(),
        },
      })
      .then((res) => refreshList())
      .catch((err) => console.log(err));
  };

  // Fonction pour créer une nouvelle tâche (ouvre la modal)
  const createItem = () => {
    const item = { title: "", description: "", completed: false };
    setActiveItem(item);
    toggle();
  };

  // Fonction pour éditer une tâche existante (ouvre la modal)
  const editItem = (item) => {
    setActiveItem(item);
    toggle();
  };

  // Fonction pour afficher les tâches complétées ou non
  const displayCompleted = (status) => {
    setViewCompleted(status);
  };

  // Fonction pour rendre l'onglet de sélection (complété/incomplet)
  const renderTabList = () => {
    return (
      <div className="nav nav-tabs">
        <span
          onClick={() => displayCompleted(true)}
          className={viewCompleted ? "nav-link active" : "nav-link"}
        >
          Complete
        </span>
        <span
          onClick={() => displayCompleted(false)}
          className={viewCompleted ? "nav-link" : "nav-link active"}
        >
          Incomplete
        </span>
      </div>
    );
  };

  // Fonction pour rendre la liste des tâches
  const renderItems = () => {
    const newItems = todoList.filter(
      (item) => item.completed === viewCompleted
    );

    return newItems.map((item) => (
      <li
        key={item.id}
        className="list-group-item d-flex justify-content-between align-items-center"
      >
        <span
          className={`todo-title mr-2 ${
            viewCompleted ? "completed-todo" : ""
          }`}
          title={item.description}
        >
          {item.title}
        </span>
        <span>
          <button
            className="btn btn-secondary mr-2"
            onClick={() => editItem(item)}
          >
            Edit
          </button>
          <button
            className="btn btn-danger"
            onClick={() => handleDelete(item)}
          >
            Delete
          </button>
        </span>
      </li>
    ));
  };

  // Rendu principal du composant
  return (
    <main className="container">
      <h1 className="text-white text-uppercase text-center my-4">Todo app</h1>
      <div className="row">
        <div className="col-md-6 col-sm-10 mx-auto p-0">
          <div className="card p-3">
            <div className="mb-4">
              <button
                className="btn btn-primary"
                onClick={createItem}
              >
                Add task
              </button>
            </div>
            {renderTabList()}
            <ul className="list-group list-group-flush border-top-0">
              {renderItems()}
            </ul>
          </div>
        </div>
      </div>
      {modal ? (
        <Modal
          activeItem={activeItem}
          toggle={toggle}
          onSave={handleSubmit}
        />
      ) : null}
    </main>
  );
}

export default App;
