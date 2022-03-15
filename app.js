const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

const hasStatusPropertyResponse = (responseBody)=>{
    return {
        response.status(400);
        response.send("Invalid Todo Status");
    };
};

const hasPriorityPropertyResponse = (responseBody)=>{
    return{
        response.status(400);
        response.send("Invalid Todo Priority");
    
    };
};
const hasCategoryPropertyResponse = (responseBody)=>{
    return{
        response.status(400);
        response.send("Invalid Todo Category");
    
    };
};
const hasDueDatePropertyResponse = (responseBody)=>{
    return{
        response.status(400);
        response.send("Invalid Due Date");
    
    };
};

const hasStatusProperty = (requestQuery)=>{
    return requestQuery.status !== undefined;
};
const hasPriorityProperty = (requestQuery)=>{
    return requestQuery.priority !== undefined;
};

const hasPriorityAndStatus = (requestBody) =>{
    return requestQuery.priority !== undefined && requestQuery.status !== undefined;
};

const hasSearchQProperty = (requestQuery) => {
    return requestQuery.search_q !== undefined;
};
const hasCategoryAndStatusProperty = (requestQuery) => {
    return requestQuery.category !== undefined && requestQuery.status !== undefined;
};
const hasCategoryProperty = (requestQuery) => {
    return requestQuery.category !== undefined;
};

const hasCategoryAndPriorityProperty = (requestQuery)=>{
    return requestQuery.category !== undefined && requestQuery.priority !== undefined;
};



app.get("/todos/",async (request,response)=>{
    let data = null;
    let getTodoQuery = "";
    const {search_q="",priority,status,category}= request.query;
    switch(true){
        case hasStatusProperty(request.query):
            getTodoQuery =`SELECT * FROM todo WHERE todo LIKE '%${search_q}%'
            AND status = '${status}';`;
            break;
        case hasPriorityProperty(request.query):
            getTodoQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%'
            AND priority = '${priority}';`;
            break;
        case hasPriorityAndStatus(request.query):
            getTodoQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%'
            AND priority = '${priority}' AND status = '${status}';`;
            break;
        case hasSearchQProperty(request.query):
            getTodoQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%';`;
            break;
        case hasCategoryAndStatusProperty(request.query):
            getTodoQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%'
            AND category = '${category}' AND status = '${status}';`;
            break;
        case hasCategoryProperty(request.query):
            getTodoQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%'
            AND category = '${category}';`;
            break;
        case hasCategoryAndPriorityProperty(request.query):
            getTodoQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%'
            AND category = '${category}' AND priority = '${priority}';`;
            break;
    }

    data = await db.all(getTodoQuery);
    response.send(data);

});

app.get("/todos/:todoId/",async (request,response)=>{
    const {todoId} = request.params;
    const getTodoQuery = `SELECT * FROM todo WHERE id=${todoId};`;
    const todo = await db.get(getTodoQuery);
    response.send(todo);
});

app.get("/agenda/",async(request,response)=>{
    const {date} = request.query;
    const getAgendaQuery = `SELECT * FROM todo WHERE due_date= ${date};`;
    const todo = await db.get(getAgendaQuery);
    if(todo.due_date !== undefined){
        response.send(todo);
    }else{
        hasDueDatePropertyResponse(response);
    }
});

app.post("/todos/",async(request,response)=>{
    const {id,todo,priority,status,category,dueDate}= request.body;
    const AddTodoQuery = `INSERT INTO todo(id,todo,priority,status,category,due_date)
    VALUES(${id},'${todo}','${priority}','${status}','${category}','${dueDate}');`;
    await db.run(AddTodoQuery);
    response.send("Todo Successfully Added");
});

app.put("/todos/:todoId/",async (request,response)=>{
    const {todoId}= request.params;
    const requestBody = request.body;
    let updateColumn = "";
    switch(true){
        case requestBody.status !== undefined:
            updateColumn= "Status";
            break;
        case requestBody.priority !== undefined:
            updateColumn = "Priority";
            break;
        case requestBody.todo !== undefined:
            updateColumn = "Todo";
            break;
        case requestBody.category !== undefined:
            updateColumn= "Category";
            break;
        case requestBody.dueDate !== undefined:
            updateColumn = "Due Date";
            break;
    }
    const previousTodoQuery =`SELECT * FROM todo WHERE id=${todoId};`;
    const previousTodo = await db.get(previousTodoQuery);
    const {todo= previousTodo.todo,
        priority= previousTodo.priority,
        status= previousTodo.status
        category= previousTodo.category,
     dueDate= previousTodo.due_date,
    }= request.body;
    const updateTodoQuery = `UPDATE todo SET todo='${todo}',priority='${priority}',status='${status}',
    category='${category}', due_date= '${dueDate}';`;
    await db.run(updateTodoQuery);
    response.send(`${updateColumn} Updated`);

});

app.delete("/todos/:todoId/",async(request,response)=>{
    const {todoId} = request.params;
    const deleteTodoQuery = `DELETE FROM todo WHERE id=${todoId}; `;
    await db.run(deleteTodoQuery);
    response.send("Todo Deleted");
});

module.exports = app;