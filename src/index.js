import axios from "axios";
const todoAPI = axios.create({
  baseURL: process.env.API_URL
});
function login(token) {
  localStorage.setItem("token", token);
  todoAPI.defaults.headers["Authorization"] = `Bearer ${token}`;
}
function logout() {
  localStorage.removeItem("token");
  delete todoAPI.defaults.headers["Authorization"];
}
const rootEl = document.querySelector(".root");
const templates = {
  login: document.querySelector("#login").content,
  todoList: document.querySelector("#todo").content,
  todoItem: document.querySelector("#todo-item").content,
  todoModified: document.querySelector("#todo-modified").content
};
// 로그인 페이지
async function loginPage() {
  const fragment = document.importNode(templates.login, true);
  fragment.querySelector(".login__form").addEventListener("submit", async e => {
    e.preventDefault();
    const payload = {
      username: e.target.elements.username.value,
      password: e.target.elements.password.value
    };
    const res = await todoAPI.post("/users/login", payload);
    login(res.data.token);
    todosPage();
  });
  rootEl.appendChild(fragment);
  // todosPage()
}
// 할 일 페이지
async function todosPage() {
  const listFragment = document.importNode(templates.todoList, true);
  const res = await todoAPI.get("/todos");
  res.data.forEach(todos => {
    console.log(todos.id)
    const fragment = document.importNode(templates.todoItem, true);
    fragment.querySelector(".todo-item__body").textContent = todos.body;
    // 완료목록 데코레이션
    if(todos.complete) {
      fragment.querySelector(".todo-item__body").classList.add('deco')
    }
    // 할 일 목록에서 삭제 
    fragment.querySelector(".todo-item__remove-btn").addEventListener("click", async e => {
      const res = await todoAPI.delete(`/todos/${todos.id}`)
      todosPage()
    });
    // 할 일 완료
    fragment.querySelector('.todo-item__complete-btn').addEventListener('click', async e => {
      const payload = {
        complete: true 
      }
      const res = await todoAPI.patch(`todos/${todos.id}`, payload)
      todosPage()
    })
    // 할 일 수정하기 
    // fragment.querySelector(".todo-item__modified-btn").addEventListener('click',async e => {
    //   console.log('lsdakfn')
    //   const modifiedFragment = document.importNode(templates.todoModified, true)
    //   fragment.querySelector(".modified").appendChild(modifiedFragment)
    // })
    listFragment.querySelector(".todo-list").appendChild(fragment);
  });
  //  새 할 일 추가
  listFragment.querySelector(".new-todos").addEventListener("submit", async e => {
      e.preventDefault();
      const payload = {
        body: e.target.elements.body.value,
        complete: false
      };
      const res = await todoAPI.post("/todos", payload);
      todosPage();
    });
  rootEl.textContent = "";
  rootEl.appendChild(listFragment);
}

// 처음 화면
loginPage();
