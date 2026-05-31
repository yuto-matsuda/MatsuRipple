import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { MapPage } from './pages/MapPage';
import { CMSPage } from './pages/CMSPage';
import { FestivalDetailPage } from './pages/FestivalDetailPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';
import { EditFestivalPage } from './pages/EditFestivalPage';
import { GroupsPage } from './pages/GroupsPage';
import { GroupDetailPage } from './pages/GroupDetailPage';
import { ParticipantsPage } from './pages/ParticipantsPage';

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<MapPage />} />
            <Route path="/festivals/:id" element={<FestivalDetailPage />} />
            <Route path="/cms" element={<CMSPage />} />
            <Route path="/cms/:id" element={<EditFestivalPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/account" element={<Navigate to="/me" replace />} />
            <Route path="/me" element={<ProfilePage />} />
            <Route path="/groups" element={<GroupsPage />} />
            <Route path="/groups/:id" element={<GroupDetailPage />} />
            <Route path="/festivals/:id/participants" element={<ParticipantsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
