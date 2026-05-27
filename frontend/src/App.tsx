import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { MapPage } from './pages/MapPage';
import { CMSPage } from './pages/CMSPage';
import { FestivalDetailPage } from './pages/FestivalDetailPage';
import { PhotoPage } from './pages/PhotoPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AccountPage } from './pages/AccountPage';
import { EditFestivalPage } from './pages/EditFestivalPage';
import { GroupsPage } from './pages/GroupsPage';
import { GroupDetailPage } from './pages/GroupDetailPage';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<MapPage />} />
            <Route path="/festivals/:id" element={<FestivalDetailPage />} />
            <Route path="/cms" element={<CMSPage />} />
            <Route path="/cms/:id" element={<EditFestivalPage />} />
            <Route path="/photos" element={<PhotoPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/groups" element={<GroupsPage />} />
            <Route path="/groups/:id" element={<GroupDetailPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
