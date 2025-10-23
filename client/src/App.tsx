import { RouterProvider } from 'react-router-dom';
import { router } from './router';

function App() {
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
