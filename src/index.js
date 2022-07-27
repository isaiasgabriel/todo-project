const express = require("express");
const cors = require("cors");

const { v4: uuidv4, v4 } = require("uuid");
//v4()

const app = express();

app.use(cors());
app.use(express.json());

var users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;

  const user = users.find((user)=>user.username === username);

  if(!user){
    return response.status(404).json({error:"User doesn't exist"})
  }

  request.user = user;

  return next();
}

//User creation
app.post("/users", (request, response) => {
  //request from the body name and username
  const { name, username } = request.body;

  const check = users.some(
    (batata) => batata.username === username //e como se eu tivesse criando um objeto batat com o atributo username que vai ser comparado
  );

  if (check) {
    return response.status(400).json({ error: "Username already exist" });
  }

  users.push({
    id: v4(),
    name,
    username,
    todos: [],
  });

  return response.status(201).json(users.find((user)=>user.username===username));
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const {title,deadline} = request.body;
  const {user} = request;

  user.todos.push({ 
    id:v4(),
    title,
    done:false,
    deadline: new Date(deadline),
    created_at:new Date()

   });

   return response.status(201).send(user.todos);

});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const {id} = request.params;
  
  const {user} = request;
  
  const {title,deadline} = request.body;
  
  const todo = user.todos.find((todo)=>todo.id===id);

  if(!todo){
    return response.status(404).json({error:"Todo doesn't exists"})
  }

  todo.title=title;
  todo.deadline=new Date(deadline);


  return response.status(201).send(todo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;

  const todo = user.todos.find((todo)=>todo.id===id);

  if(!todo){
    return response.status(404).json({error:"Todo doesn't exists"})
  }

  todo.done=true;

  return response.status(201).send();
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;

  const todo = user.todos.find((todo)=>todo.id===id);

  user.todos.splice(todo,1);

  return response.status(201).send(user.todos)
});

module.exports = app;
