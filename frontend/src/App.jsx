import { useState } from 'react';
import { LoginPage } from './components/pages/LoginPage';
import { DashboardLayout } from './components/DashboardLayout';
import { OwnerDashboard } from './components/pages/OwnerDashboard';
import { SupervisorDashboard } from './components/pages/SupervisorDashboard';
import { AdminDashboard } from './components/pages/AdminDashboard';
import { Toaster } from './components/ui/sonner';
import { GeofencingPage } from './components/pages/GeofencingPage';
import { FuelReports } from './components/pages/FuelReports';
import { ComplaintsPanel } from './components/pages/ComplaintsPanel';
import { Settings } from './components/pages/Settings';
import { ReportsData } from './components/pages/ReportsData';
import { CompanyRoutes } from './components/pages/CompanyRoutes';

const LoginPageAny = LoginPage;
const DashboardLayoutAny = DashboardLayout;
const OwnerDashboardAny = OwnerDashboard;
const SupervisorDashboardAny = SupervisorDashboard;
const AdminDashboardAny = AdminDashboard;
const GeofencingPageAny = GeofencingPage;
const FuelReportsAny = FuelReports;
const ComplaintsPanelAny = ComplaintsPanel;
const SettingsAny = Settings;
const ReportsDataAny = ReportsData;
const CompanyRoutesAny = CompanyRoutes;

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const token = localStorage.getItem('fleet.token');
    return !!token;
  });

  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('fleet.role') || 'user';
  });

  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedVehicleId, setSelectedVehicleId] = useState(undefined);

  const handleLogin = (role) => {
    setUserRole(role);
    setIsLoggedIn(true);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('fleet.token');
    localStorage.removeItem('fleet.role');
    localStorage.removeItem('fleet.email');
    setIsLoggedIn(false);
    setUserRole('user');
    setCurrentPage('dashboard');
    setSelectedVehicleId(undefined);
  };

  const handleNavigate = (page, vehicleId) => {
    setCurrentPage(page);
    setSelectedVehicleId(vehicleId);
  };

  if (!isLoggedIn) {
    return (
      <>
        <Toaster />
        <LoginPageAny onLogin={handleLogin} />
      </>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        if (userRole === 'admin') {
          return <AdminDashboardAny />;
        }
        return userRole === 'owner' ? (
          <OwnerDashboardAny onNavigate={handleNavigate} selectedVehicleId={selectedVehicleId} />
        ) : (
          <SupervisorDashboardAny onNavigate={handleNavigate} selectedVehicleId={selectedVehicleId} />
        );
      case 'vehicles':
        return <GeofencingPageAny />;
      case 'fuel':
        return <FuelReportsAny />;
      case 'complaints':
        return <ComplaintsPanelAny />;
      case 'settings':
        return <SettingsAny />;
      case 'reports':
        return <ReportsDataAny />;
      case 'routes':
        return <CompanyRoutesAny onNavigate={handleNavigate} />;
      default:
        if (userRole === 'admin') {
          return <AdminDashboardAny />;
        }
        return userRole === 'owner' ? (
          <OwnerDashboardAny onNavigate={handleNavigate} selectedVehicleId={selectedVehicleId} />
        ) : (
          <SupervisorDashboardAny onNavigate={handleNavigate} selectedVehicleId={selectedVehicleId} />
        );
    }
  };

  return (
    <>
      <Toaster />
      <DashboardLayoutAny userRole={userRole} currentPage={currentPage} onNavigate={handleNavigate} onLogout={handleLogout}>
        {renderPage()}
      </DashboardLayoutAny>
    </>
  );
}
