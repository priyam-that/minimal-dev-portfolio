---
title: Building My First React App
date: 2025-01-05
excerpt: Lessons learned from creating my first React application and the challenges I faced
---

# Building My First React App ⚛️

Creating my first React application was both exciting and overwhelming. Coming from vanilla JavaScript, the concept of components, JSX, and state management felt like learning a completely new language. Here's the story of my journey and the lessons I learned along the way.

## The Project: A Personal Task Manager

I decided to build a personal task manager for my first React project. It seemed simple enough:
- Add tasks
- Mark tasks as complete
- Delete tasks
- Filter tasks (all, active, completed)

Little did I know how much I'd learn from this "simple" project!

## Initial Struggles

### JSX Confusion
Coming from HTML, JSX felt weird at first:

```jsx
// This looked strange initially
function TaskItem({ task, onToggle, onDelete }) {
    return (
        <div className="task-item">
            <input 
                type="checkbox" 
                checked={task.completed}
                onChange={() => onToggle(task.id)}
            />
            <span className={task.completed ? 'completed' : ''}>
                {task.text}
            </span>
            <button onClick={() => onDelete(task.id)}>
                Delete
            </button>
        </div>
    );
}
```

**What confused me:**
- `className` instead of `class`
- JavaScript expressions in curly braces
- Event handlers as props
- The mixing of HTML-like syntax with JavaScript

### State Management Learning Curve

Understanding when and how to use state was challenging:

```jsx
// My first attempt (not great)
function TaskApp() {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState('');
    const [filter, setFilter] = useState('all');
    
    // I put everything in one component initially
    const addTask = () => {
        if (newTask.trim()) {
            setTasks([...tasks, {
                id: Date.now(),
                text: newTask,
                completed: false
            }]);
            setNewTask('');
        }
    };
    
    // ... rest of the component logic
}
```

## Key Breakthroughs

### Component Thinking
The biggest "aha!" moment was understanding component composition:

```jsx
// Breaking down into smaller components
function App() {
    return (
        <div className="app">
            <Header />
            <TaskInput onAddTask={addTask} />
            <TaskFilter currentFilter={filter} onFilterChange={setFilter} />
            <TaskList 
                tasks={filteredTasks} 
                onToggleTask={toggleTask}
                onDeleteTask={deleteTask}
            />
            <TaskStats tasks={tasks} />
        </div>
    );
}
```

### Props Flow Understanding
Learning how data flows down and events flow up:

```jsx
// Parent component
function TaskList({ tasks, onToggleTask, onDeleteTask }) {
    return (
        <div className="task-list">
            {tasks.map(task => (
                <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={onToggleTask}
                    onDelete={onDeleteTask}
                />
            ))}
        </div>
    );
}

// Child component
function TaskItem({ task, onToggle, onDelete }) {
    return (
        <div className="task-item">
            <input 
                type="checkbox"
                checked={task.completed}
                onChange={() => onToggle(task.id)} // Event flows up
            />
            <span>{task.text}</span>
            <button onClick={() => onDelete(task.id)}>
                Delete
            </button>
        </div>
    );
}
```

### useEffect for Side Effects
Understanding when to use useEffect was crucial:

```jsx
function TaskApp() {
    const [tasks, setTasks] = useState([]);
    
    // Load tasks from localStorage on mount
    useEffect(() => {
        const savedTasks = localStorage.getItem('tasks');
        if (savedTasks) {
            setTasks(JSON.parse(savedTasks));
        }
    }, []); // Empty dependency array = run once on mount
    
    // Save tasks whenever tasks change
    useEffect(() => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }, [tasks]); // Run whenever tasks array changes
}
```

## Mistakes I Made (And What I Learned)

### 1. Mutating State Directly
```jsx
// Wrong ❌
const toggleTask = (id) => {
    const task = tasks.find(t => t.id === id);
    task.completed = !task.completed; // Mutating directly
    setTasks(tasks);
};

// Right ✅
const toggleTask = (id) => {
    setTasks(tasks.map(task => 
        task.id === id 
            ? { ...task, completed: !task.completed }
            : task
    ));
};
```

### 2. Not Using Keys Properly
```jsx
// Wrong ❌
{tasks.map((task, index) => (
    <TaskItem key={index} task={task} />
))}

// Right ✅
{tasks.map(task => (
    <TaskItem key={task.id} task={task} />
))}
```

### 3. Putting Too Much Logic in Components
```jsx
// Better approach: Extract custom hooks
function useTasks() {
    const [tasks, setTasks] = useState([]);
    
    const addTask = (text) => {
        const newTask = {
            id: Date.now(),
            text: text.trim(),
            completed: false,
            createdAt: new Date().toISOString()
        };
        setTasks(prev => [...prev, newTask]);
    };
    
    const toggleTask = (id) => {
        setTasks(prev => prev.map(task => 
            task.id === id 
                ? { ...task, completed: !task.completed }
                : task
        ));
    };
    
    const deleteTask = (id) => {
        setTasks(prev => prev.filter(task => task.id !== id));
    };
    
    return { tasks, addTask, toggleTask, deleteTask };
}
```

## Tools That Helped

### React Developer Tools
The React DevTools browser extension was invaluable for:
- Inspecting component hierarchy
- Viewing props and state
- Debugging re-renders

### Create React App
Starting with CRA removed the complexity of build configuration:
```bash
npx create-react-app my-task-manager
cd my-task-manager
npm start
```

### VS Code Extensions
- ES7+ React/Redux/React-Native snippets
- Bracket Pair Colorizer
- Auto Rename Tag

## Advanced Features I Added Later

### Local Storage Persistence
```jsx
const useLocalStorage = (key, initialValue) => {
    const [value, setValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });
    
    const setStoredValue = (value) => {
        try {
            setValue(value);
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    };
    
    return [value, setStoredValue];
};
```

### Drag and Drop Reordering
Using the HTML5 Drag and Drop API with React was tricky but rewarding.

### Theme Support
Added dark/light mode toggle using CSS custom properties and React context.

## Performance Lessons

### Unnecessary Re-renders
I learned to use `React.memo` and `useMemo` to optimize performance:

```jsx
const TaskItem = React.memo(({ task, onToggle, onDelete }) => {
    return (
        <div className="task-item">
            {/* Component content */}
        </div>
    );
});

const ExpensiveComponent = ({ data }) => {
    const expensiveValue = useMemo(() => {
        return data.reduce((acc, item) => acc + item.value, 0);
    }, [data]);
    
    return <div>{expensiveValue}</div>;
};
```

## Testing My React App

I started with simple tests using React Testing Library:

```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import TaskApp from './TaskApp';

test('adds a new task', () => {
    render(<TaskApp />);
    
    const input = screen.getByPlaceholderText('Add a new task...');
    const button = screen.getByText('Add Task');
    
    fireEvent.change(input, { target: { value: 'Test task' } });
    fireEvent.click(button);
    
    expect(screen.getByText('Test task')).toBeInTheDocument();
});
```

## What I'd Do Differently

1. **Start with TypeScript**: Type safety would have caught many bugs early
2. **Plan component structure**: Sketch the component hierarchy first
3. **Use a state management library**: For complex state, Redux or Zustand helps
4. **Write tests from the beginning**: Don't wait until the end
5. **Focus on accessibility**: Add proper ARIA labels and keyboard navigation

## The Final Result

My task manager ended up with:
- ✅ Add, edit, and delete tasks
- ✅ Mark tasks as complete
- ✅ Filter tasks by status
- ✅ Drag and drop reordering
- ✅ Local storage persistence
- ✅ Dark/light theme toggle
- ✅ Responsive design
- ✅ Keyboard accessibility

## Key Takeaways

1. **React is powerful but has a learning curve**: Don't get discouraged by initial confusion
2. **Think in components**: Break UI into small, reusable pieces
3. **Data flows down, events flow up**: This pattern makes apps predictable
4. **State management is crucial**: Learn useState, useEffect, and custom hooks
5. **Practice makes perfect**: Build multiple projects to solidify concepts

## Recommendations for React Beginners

1. **Learn JavaScript well first**: ES6+, arrays, objects, destructuring
2. **Start with functional components**: Hooks are the modern way
3. **Build real projects**: Tutorial hell is real; build things you care about
4. **Read the documentation**: React docs are excellent
5. **Join the community**: React Discord, Reddit, Stack Overflow

## What's Next?

Now that I'm comfortable with React basics, I'm exploring:
- **Next.js**: For server-side rendering and full-stack apps
- **React Query**: For better data fetching and caching
- **Framer Motion**: For smooth animations
- **React Hook Form**: For complex form handling

Building my first React app was challenging but incredibly rewarding. It opened up a whole new world of possibilities and made me a better developer.

If you're thinking about learning React, just start building. The concepts will click with practice!

---

*Have you built your first React app? What challenges did you face? [Share your experience](../contact.html) with me!*
