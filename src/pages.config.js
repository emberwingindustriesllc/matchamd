import AdminModeration from './pages/AdminModeration';
import Community from './pages/Community';
import Dashboard from './pages/Dashboard';
import Deadlines from './pages/Deadlines';
import GuideDetail from './pages/GuideDetail';
import Guides from './pages/Guides';
import Legal from './pages/Legal';
import Mentors from './pages/Mentors';
import Notifications from './pages/Notifications';
import Onboarding from './pages/Onboarding';
import PostDetail from './pages/PostDetail';
import Profile from './pages/Profile';
import Subscription from './pages/Subscription';
import ResearchOpportunities from './pages/ResearchOpportunities';
import IMGPrograms from './pages/IMGPrograms';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdminModeration": AdminModeration,
    "Community": Community,
    "Dashboard": Dashboard,
    "Deadlines": Deadlines,
    "GuideDetail": GuideDetail,
    "Guides": Guides,
    "Legal": Legal,
    "Mentors": Mentors,
    "Notifications": Notifications,
    "Onboarding": Onboarding,
    "PostDetail": PostDetail,
    "Profile": Profile,
    "Subscription": Subscription,
    "ResearchOpportunities": ResearchOpportunities,
    "IMGPrograms": IMGPrograms,
}

export const pagesConfig = {
    mainPage: "Onboarding",
    Pages: PAGES,
    Layout: __Layout,
};