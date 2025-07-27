document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "https://dummyjson.com/todos";

  console.log(API_URL);

  let allTodos = [];
  let filteredTodos = [];
  let currentPage = 1;
  const todosPerPage = 10;

  const todoList = document.getElementById("todo-list");
  const loader = document.getElementById("loader");
  const errorDisplay = document.getElementById("error-display");
  const paginationControls = document.getElementById("pagination-controls");
  const searchInput = document.getElementById("search-input");
  const fromDateInput = document.getElementById("from-date-input");
  const toDateInput = document.getElementById("to-date-input");
  const resetFiltersBtn = document.getElementById("reset-filters-btn");
  const addTodoForm = document.getElementById("add-todo-form");
  const newTodoInput = document.getElementById("new-todo-input");

  /**

   * @param {boolean} isLoading 
   */
  const showLoader = (isLoading) => {
    loader.classList.toggle("d-none", !isLoading);
  };

  /**
   * @param {string} message
   */
  const showError = (message) => {
    errorDisplay.textContent = message;
    errorDisplay.classList.remove("d-none");
  };

  /**
   * @returns {Date}
   */
  const getRandomDate = () => {
    const end = new Date();
    const start = new Date();
    start.setFullYear(start.getFullYear() - 1);
    return new Date(
      start.getTime() + Math.random() * (end.getTime() - start.getTime())
    );
  };

  const renderTodos = () => {
    todoList.innerHTML = "";
    const startIndex = (currentPage - 1) * todosPerPage;
    const endIndex = startIndex + todosPerPage;
    const paginatedTodos = filteredTodos.slice(startIndex, endIndex);

    if (paginatedTodos.length === 0) {
      todoList.innerHTML =
        '<li class="list-group-item text-center">No tasks found.</li>';
      return;
    }

    paginatedTodos.forEach((todo) => {
      const listItem = document.createElement("li");
      listItem.className = `list-group-item d-flex justify-content-between align-items-center ${
        todo.completed ? "completed" : ""
      }`;

      const taskText = document.createElement("span");
      taskText.textContent = todo.todo;

      const taskDate = document.createElement("small");
      taskDate.className = "text-muted";
      taskDate.textContent = new Date(todo.createdAt).toLocaleDateString();

      listItem.appendChild(taskText);
      listItem.appendChild(taskDate);
      todoList.appendChild(listItem);
    });
  };

  const setupPagination = () => {
    paginationControls.innerHTML = "";
    const pageCount = Math.ceil(filteredTodos.length / todosPerPage);

    for (let i = 1; i <= pageCount; i++) {
      const pageItem = document.createElement("li");
      pageItem.className = "page-item";
      const pageLink = document.createElement("a");
      pageLink.className = "page-link";
      pageLink.href = "#";
      pageLink.innerText = i;
      if (i === currentPage) {
        pageItem.classList.add("active");
      }
      pageLink.addEventListener("click", (e) => {
        e.preventDefault();
        currentPage = i;
        renderTodos();
        setupPagination();
      });
      pageItem.appendChild(pageLink);
      paginationControls.appendChild(pageItem);
    }
  };

  const applyFilters = () => {
    const searchTerm = searchInput.value.toLowerCase();
    const fromDateValue = fromDateInput.value;
    const toDateValue = toDateInput.value;

    const fromDate = fromDateValue ? new Date(fromDateValue) : null;
    const toDate = toDateValue ? new Date(toDateValue) : null;
    if (toDate) toDate.setDate(toDate.getDate() + 1);

    filteredTodos = allTodos.filter((todo) => {
      const todoDate = new Date(todo.createdAt);

      const matchesSearch = todo.todo.toLowerCase().includes(searchTerm);
      const matchesFromDate = fromDate ? todoDate >= fromDate : true;
      const matchesToDate = toDate ? todoDate < toDate : true;

      return matchesSearch && matchesFromDate && matchesToDate;
    });

    currentPage = 1;
    renderTodos();
    setupPagination();
  };

  const resetFilters = () => {
    searchInput.value = "";
    fromDateInput.value = "";
    toDateInput.value = "";
    applyFilters();
  };

  const fetchTodos = async () => {
    showLoader(true);
    errorDisplay.classList.add("d-none");
    try {
      const response = await fetch(`${API_URL}?limit=150`);
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();

      allTodos = data.todos.map((todo) => ({
        ...todo,
        createdAt: getRandomDate(),
      }));

      applyFilters();
    } catch (error) {
      showError(`Failed to fetch todos. ${error.message}`);
    } finally {
      showLoader(false);
    }
  };

  const handleAddTodo = async (event) => {
    event.preventDefault();
    const newTodoText = newTodoInput.value.trim();
    if (!newTodoText) return;

    const newTodoData = {
      todo: newTodoText,
      completed: false,
      userId: 5,
    };

    try {
      const response = await fetch(`${API_URL}/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTodoData),
      });
      if (!response.ok) throw new Error(`API Error: ${response.status}`);

      const addedTodo = await response.json();
      addedTodo.createdAt = new Date();

      allTodos.unshift(addedTodo);
      resetFilters();

      addTodoForm.reset();
    } catch (error) {
      showError(`Failed to add todo. ${error.message}`);
    }
  };

  searchInput.addEventListener("input", applyFilters);
  fromDateInput.addEventListener("change", applyFilters);
  toDateInput.addEventListener("change", applyFilters);
  resetFiltersBtn.addEventListener("click", resetFilters);
  addTodoForm.addEventListener("submit", handleAddTodo);

  fetchTodos();
});
