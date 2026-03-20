import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AppearanceProvider } from './contexts/AppearanceContext';

function App() {
  return (
    <AppearanceProvider>
      <RouterProvider router={router} />
    </AppearanceProvider>
  );
}

export default App;
