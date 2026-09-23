
const STORAGE_KEY = "study-folders-v3";

// Stores user's study data.
const state = {
  view: "subjects",
  subjectId: null,
  assignmentId: null,
  data: loadData(),
};

// Locate areas on the screen
const content = document.querySelector("#content");
const summary = document.querySelector("#summary");
const screenTitle = document.querySelector("#screenTitle");
const contextLabel = document.querySelector("#contextLabel");
const backButton = document.querySelector("#backButton");
const addButton = document.querySelector("#addButton");
const addButtonLabel = document.querySelector("#addButtonLabel");
const dialog = document.querySelector("#entryDialog");
const form = document.querySelector("#entryForm");
const dialogTitle = document.querySelector("#dialogTitle");
const dialogContext = document.querySelector("#dialogContext");
const dialogFields = document.querySelector("#dialogFields");
const cancelDialog = document.querySelector("#cancelDialog");

// Loads saved data from localStorage when the app starts.
function loadData() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? { subjects: [] };
}

// Saves the current data object into localStorage.
function saveData() {
  // data object -> JSON
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));
}

// Creates an ID for each subject, assignment, and task.
function createId() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

// Gets the subject that is currently open.
function currentSubject() {
  // Finds the subject whose ID matches the selected subject ID in state.
  return state.data.subjects.find((subject) => subject.id === state.subjectId);
}

// Gets the assignment that is currently open.
function currentAssignment() {
  // First finds the current subject, then finds the selected assignment inside it.
  return currentSubject()?.assignments.find((assignment) => assignment.id === state.assignmentId);
}

function formatDate(value) {
  if (!value) return "No deadline";
  const date = new Date(`${value}T12:00:00`);
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: date.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
  }).format(date);
}

// Day until deadline
function deadlineTone(value) {
  
  // Gets today's date and time.
  const today = new Date();
  // Sets the deadline to the end of the selected day.
  const deadline = new Date(`${value}T23:59:59`);
  // Calculates how many days are left until the deadline.
  const days = Math.ceil((deadline - today) / 86400000);

  // If the deadline has passed, mark it as overdue.
  if (days < 0) return "Overdue";
  // If the deadline is today, make that obvious.
  if (days === 0) return "Due today";
  // If the deadline is tomorrow, show a friendly label.
  if (days === 1) return "Due tomorrow";
  // Otherwise, show the formatted due date.
  return `Due ${formatDate(value)}`;
}

// Chooses which screen-rendering function should run.
function render() {
  const viewMap = {
    subjects: renderSubjects,
    assignments: renderAssignments,
    tasks: renderTasks,
  };

  // Runs the correct render function.
  viewMap[state.view]();
}

// Draws the first screen (subject)
function renderSubjects() {
  const subjects = state.data.subjects;
  // Counts every assignment across all subjects.
  const assignmentCount = subjects.reduce((count, subject) => count + subject.assignments.length, 0);
  // Counts every task across every assignment in every subject.
  const taskCount = subjects.reduce(
    (count, subject) =>
      count + subject.assignments.reduce((sum, assignment) => sum + assignment.tasks.length, 0),
    0,
  );

  //Subjects page headers
  contextLabel.textContent = "Subjects";
  screenTitle.textContent = "Study";
  backButton.classList.add("hidden");
  addButtonLabel.textContent = "Add subject";
  summary.innerHTML = stats([
    [subjects.length, "Subjects"],
    [assignmentCount, "Assignments"],
    [taskCount, "Tasks"],
  ]);

  // Shows either the subject list or an empty state if there are no subjects.
  content.innerHTML = subjects.length
    ? `<div class="list">${subjects.map(subjectRow).join("")}</div>`
    // Gives the user an action if the list is empty:
    : emptyState("Add subject", "Create your first subject folder and keep assignments neatly tucked inside.");

  // Finds every subject row after it has been inserted into the page.
  content.querySelectorAll("[data-subject-id]").forEach((button) => {
    button.addEventListener("click", () => {
      state.subjectId = button.dataset.subjectId;
      // Moves the app into the assignments view.
      state.view = "assignments";
      // Redraws the screen for the new view.
      render();
    });
  });
}

// Renders Assignment page
function renderAssignments() {
  const subject = currentSubject();
  if (!subject) return goHome();

  const assignments = subject.assignments;
  // Counts tasks that have not been completed yet.
  const openTasks = assignments.reduce(
    (count, assignment) => count + assignment.tasks.filter((task) => !task.done).length,
    0,
  );

  // Assignments page header
  contextLabel.textContent = "Subject";
  screenTitle.textContent = subject.name;
  backButton.classList.remove("hidden");
  addButtonLabel.textContent = "Add assignment";
  summary.innerHTML = stats([
    [assignments.length, "Assignments"],
    [openTasks, "Open tasks"],
    [assignments.filter((item) => item.deadline).length, "Deadlines"],
  ]);

  // Shows either assignment rows or an empty state.
  content.innerHTML = assignments.length
    // Converts each assignment object into a clickable row.
    ? `<div class="list">${assignments.map(assignmentRow).join("")}</div>`
    // Explains what the user can add next.
    : emptyState(
        "Add assignment",
        "Add a deadline and split the work into small 25-minute blocks.",
      );

  // Finds all assignment rows after rendering.
  content.querySelectorAll("[data-assignment-id]").forEach((button) => {
    button.addEventListener("click", () => {
      state.assignmentId = button.dataset.assignmentId;
      state.view = "tasks";
      // Redraws the screen for the new view.
      render();
    });
  });
}

// Renders Tasks page
function renderTasks() {
  const assignment = currentAssignment();
  const subject = currentSubject();
  if (!assignment || !subject) return goHome();

  const complete = assignment.tasks.filter((task) => task.done).length;

  // Tasks Page Headers
  contextLabel.textContent = subject.name;
  screenTitle.textContent = assignment.name;
  backButton.classList.remove("hidden");
  addButtonLabel.textContent = "Add a 25 min task";
  summary.innerHTML = stats([
    [assignment.tasks.length, "Tasks"],
    [complete, "Done"],
    [formatDate(assignment.deadline), "Deadline"],
  ]);

  // Shows either task rows or an empty state.
  content.innerHTML = assignment.tasks.length
    ? `<div class="list">${assignment.tasks.map(taskRow).join("")}</div>`
    : emptyState(
        "Add a 25 min task",
        "Make the next step small enough to start without negotiating with yourself.",
      );

  content.querySelectorAll("[data-task-id]").forEach((button) => {
    // Adds a click handler so tasks can be marked done or undone.
    button.addEventListener("click", () => {
      const task = assignment.tasks.find((item) => item.id === button.dataset.taskId);
      task.done = !task.done;
      // Saves the updated task state.
      saveData();
      render();
    });
  });
}

// Creates the three small summary cards from an array of values.
function stats(items) {
  return items
    .map(([value, label]) => {
      const valueClass = Number.isFinite(value) ? "" : " text-stat";
      return `<div class="stat${valueClass}"><strong>${value}</strong><span>${label}</span></div>`;
    })
    .join("");
}

function emptyState(title, body) {
  return `
    <div class="empty">
      <div class="empty-mark"></div>
      <strong>${title}</strong>
      <p>${body}</p>
    </div>
  `;
}

// Creates one subject row.
function subjectRow(subject) {
  const assignments = subject.assignments.length;
  const tasks = subject.assignments.reduce((count, assignment) => count + assignment.tasks.length, 0);

  return `
    <button class="row" data-subject-id="${subject.id}">
      <span class="glyph">S</span>
      <span>
        <span class="row-title">${escapeHtml(subject.name)}</span>
        <span class="row-meta">${assignments} assignment${assignments === 1 ? "" : "s"} · ${tasks} task${tasks === 1 ? "" : "s"}</span>
      </span>
      <span class="arrow"></span>
    </button>
  `;
}

function assignmentRow(assignment) {
  const openTasks = assignment.tasks.filter((task) => !task.done).length;

  return `
    <button class="row" data-assignment-id="${assignment.id}">
      <span class="glyph assignment">A</span>
      <span>
        <span class="row-title">${escapeHtml(assignment.name)}</span>
        <span class="row-meta">${deadlineTone(assignment.deadline)} · ${openTasks} open task${openTasks === 1 ? "" : "s"}</span>
      </span>
      <span class="arrow"></span>
    </button>
  `;
}

// Creates one task row.
function taskRow(task) {
  // Adds the "done" class when the task is completed.
  return `
    <button class="row task-row ${task.done ? "done" : ""}" data-task-id="${task.id}">
      <span class="glyph task">25</span>
      <span>
        <span class="row-title">${escapeHtml(task.name)}</span>
        <span class="row-meta">25 minutes</span>
      </span>
      <span class="task-check"></span>
    </button>
  `;
}

// Prevents user-entered text from being treated as HTML.
function escapeHtml(value) {
  // Replaces risky characters with safe HTML entities.
  return value.replace(/[&<>"']/g, (char) => {
    // Stores the replacement text for each risky character.
    const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
    // Returns the safe replacement for the current character.
    return entities[char];
  });
}

// Opens the add-item dialog.
function openDialog() {
  const config = {
    subjects: {
      context: "Subject folder",
      title: "Add subject",
      fields: [{ id: "name", label: "Subject name", type: "text", placeholder: "Biology" }],
    },
    // Window for adding an assignment.
    assignments: {
      context: currentSubject()?.name ?? "Assignment",
      title: "Add assignment",
      fields: [
        { id: "name", label: "Assignment name", type: "text", placeholder: "Cell structure notes" },
        { id: "deadline", label: "Deadline", type: "date" },
      ],
    },
    // Window for adding a task.
    tasks: {
      context: currentAssignment()?.name ?? "Task",
      title: "Add a 25 min task",
      fields: [{ id: "name", label: "Task name", type: "text", placeholder: "Read pages 12-18" }],
    },
  }[state.view];

  dialogContext.textContent = config.context;
  dialogTitle.textContent = config.title;
  dialogFields.innerHTML = config.fields
    .map(
      (field) => `
        <div class="field">
          <label for="${field.id}">${field.label}</label>
          <input id="${field.id}" name="${field.id}" type="${field.type}" ${field.placeholder ? `placeholder="${field.placeholder}"` : ""} required />
        </div>
      `,
    )
    .join("");

  dialog.showModal();
  dialog.querySelector("input")?.focus();
}

function handleSubmit(event) {
  event.preventDefault();
  const data = new FormData(form);
  const name = data.get("name")?.toString().trim();
  if (!name) return;

  if (state.view === "subjects") {
    state.data.subjects.unshift({ id: createId(), name, assignments: [] });
  }

  // If the user is inside a subject, create a new assignment.
  if (state.view === "assignments") {
    currentSubject().assignments.unshift({
      id: createId(),
      name,
      deadline: data.get("deadline")?.toString() ?? "",
      tasks: [],
    });
  }

  // If the user is inside an assignment, create a new task.
  if (state.view === "tasks") {
    currentAssignment().tasks.unshift({ id: createId(), name, done: false, minutes: 25 });
  }

  // Saves the updated app data to localStorage.
  saveData();
  form.reset();
  dialog.close();
  render();
}

// Sends the user back to the first screen.
function goHome() {
  state.view = "subjects";
  state.subjectId = null;
  state.assignmentId = null;
  render();
}

// Handles the back button behavior.
function goBack() {
  if (state.view === "tasks") {
    state.view = "assignments";
    state.assignmentId = null;
  } else {
    state.view = "subjects";
    state.subjectId = null;
  }
  render();
}

addButton.addEventListener("click", openDialog);
backButton.addEventListener("click", goBack);
cancelDialog.addEventListener("click", () => dialog.close());
form.addEventListener("submit", handleSubmit);

// start
render();
