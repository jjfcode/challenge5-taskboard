// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("task")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId"));



// Todo: create a function to generate a unique task id
function generateTaskId() {

    if (nextId) {
        nextId = nextId + 1
    } else {
        nextId = 1
    }

    localStorage.setItem('nextId', JSON.stringify(nextId))
    
    return nextId
};

// Todo: create a function to create a task card
function createTaskCard(task) {

    const taskCard = $('<div>')
        .addClass('card task-card draggable my-3')
        .attr('data-taskid', task.id);
    const cardHeader = $('<div>').addClass('card-header h4').text(task.title);
    const cardBody = $('<div>').addClass('card-body');
    const cardDescription = $('<p>').addClass('card-text').text(task.description);
    const cardDueDate = $('<p>').addClass('card-text').text(task.dueDate);
    const cardDeleteBtn = $('<button>')
        .addClass('btn btn-danger delete')
        .text('Delete')
        .attr('data-taskid', task.id);
    cardDeleteBtn.on('click', handleDeleteTask);

    if (task.dueDate && task.status !== 'done') {
        const now = dayjs();
        const taskDueDate = dayjs(task.dueDate, 'DD/MM/YYYY');

        if (now.isSame(taskDueDate, 'day')) {
            taskCard.addClass('bg-warning text-white');
        } else if (now.isAfter(taskDueDate)) {
            taskCard.addClass('bg-danger text-white');
            cardDeleteBtn.addClass('border-light');
        }
    }

    cardBody.append(cardDescription, cardDueDate, cardDeleteBtn);
    taskCard.append(cardHeader, cardBody);

    return taskCard;
}

// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {

    const todoList = $('#todo-cards');
    todoList.empty();

    const inProgressList = $('#in-progress-cards');
    inProgressList.empty();

    const doneList = $('#done-cards');
    doneList.empty();

    for (let task of taskList) {

        if (task.status === 'to-do') {
            todoList.append(createTaskCard(task));
        } else if (task.status === 'in-progress') {
            inProgressList.append(createTaskCard(task));
        } else if (task.status === 'done') {
            doneList.append(createTaskCard(task));
        }
    }

    $('.draggable').draggable({
        opacity: 0.7,
        zIndex: 100,
        helper: function (e) {
            const original = $(e.target).hasClass('ui-draggable')
                ? $(e.target)
                : $(e.target).closest('.ui-draggable');
            return original.clone().css({
                width: original.outerWidth(),
            });
        },
    });
}

// Todo: create a function to handle adding a new task
function handleAddTask(event) {
    event.preventDefault();

    const taskTitle = $('#title').val().trim();
    const taskDueDate = $('#due-date').val();
    const taskDescription = $('#description').val();

    const newTask = {
        id: generateTaskId(),
        title: taskTitle,
        dueDate: taskDueDate,
        description: taskDescription,
        status: 'to-do',
    };

    taskList.push(newTask);

    localStorage.setItem('tasks', JSON.stringify(taskList));

    renderTaskList();

    $('#title').val('');
    $('#due-date').val('');
    $('#description').val('');
}

// Todo: create a function to handle deleting a task
function handleDeleteTask(event) {
    const taskId = $(this).attr('data-taskid');
    
    taskList.forEach((task) => {
        if (task.id === parseInt(taskId)) {
            taskList.splice(taskList.indexOf(task), 1);
        }
    });

    localStorage.setItem('tasks',JSON.stringify(taskList))

    renderTaskList();
}

// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
    const taskId = ui.draggable[0].dataset.taskid;
    const newStatus = event.target.id;

    for (let task of taskList) {

        if (task.id === parseInt(taskId)) {
            task.status = newStatus;
        }
    }

    localStorage.setItem('tasks', JSON.stringify(taskList));
    renderTaskList();
}

// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {

    renderTaskList();

    $('#due-date').datepicker({
        changeMonth: true,
        changeYear: true,
    });

    $('#task-form').on('submit', handleAddTask)

    $('.lane').droppable({
        accept: '.draggable',
        drop: handleDrop,
    });
});
