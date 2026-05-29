// ================= CLOCK =================

const clock = document.getElementById("clock");

function updateClock() {
    clock.textContent = new Date().toLocaleTimeString();
}

setInterval(updateClock, 1000);
updateClock();


// ================= THEME =================

const themeBtn = document.getElementById("themeBtn");

themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
});


// ================= COUNTER =================

let count = 0;

const countEl = document.getElementById("count");

document.getElementById("plus").onclick = () => {
    count++;
    countEl.textContent = count;
};

document.getElementById("minus").onclick = () => {
    count--;
    countEl.textContent = count;
};


// ================= LIVE PREVIEW =================

const input = document.getElementById("liveInput");
const preview = document.getElementById("preview");

input.addEventListener("input", () => {
    preview.textContent = input.value;
});


// ================= QUOTES =================

const quotes = [
    "JavaScript can build amazing things.",
    "Frameworks come and go, JS stays.",
    "Learn fundamentals before libraries.",
    "The browser is your playground.",
    "Small code can create big experiences."
];

const quoteEl = document.getElementById("quote");

function randomQuote() {
    const random =
        quotes[Math.floor(Math.random() * quotes.length)];

    quoteEl.textContent = random;
}

document.getElementById("quoteBtn")
    .addEventListener("click", randomQuote);

randomQuote();


// ================= TODO APP =================

const todoInput = document.getElementById("todoInput");
const todoList = document.getElementById("todoList");
const search = document.getElementById("search");

let todos =
    JSON.parse(localStorage.getItem("todos")) || [];

function saveTodos() {
    localStorage.setItem(
        "todos",
        JSON.stringify(todos)
    );
}

function renderTodos(filter = "") {

    todoList.innerHTML = "";

    todos
        .filter(todo =>
            todo.toLowerCase()
            .includes(filter.toLowerCase())
        )
        .forEach((todo, index) => {

            const li = document.createElement("li");

            li.className =
                "bg-gray-100 p-3 rounded flex justify-between items-center";

            li.innerHTML = `
                <span>${todo}</span>
                <button class="bg-red-500 text-white px-3 py-1 rounded">
                    Delete
                </button>
            `;

            li.querySelector("button")
                .addEventListener("click", () => {

                    todos.splice(index, 1);
                    saveTodos();
                    renderTodos(search.value);
                });

            todoList.appendChild(li);
        });
}

document.getElementById("addTodo")
    .addEventListener("click", () => {

        const value = todoInput.value.trim();

        if (!value) return;

        todos.push(value);

        saveTodos();
        renderTodos();

        todoInput.value = "";
    });

search.addEventListener("input", () => {
    renderTodos(search.value);
});

renderTodos();