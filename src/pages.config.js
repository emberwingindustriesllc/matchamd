import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Guides from './pages/Guides';
import GuideDetail from './pages/GuideDetail';
import Community from './pages/Community';
import PostDetail from './pages/PostDetail';
import Mentors from './pages/Mentors';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Onboarding": Onboarding,
    "Dashboard": Dashboard,
    "Guides": Guides,
    "GuideDetail": GuideDetail,
    "Community": Community,
    "PostDetail": PostDetail,
    "Mentors": Mentors,
    "Profile": Profile,
    "Notifications": Notifications,
}

export const pagesConfig = {
    mainPage: "Onboarding",
    Pages: PAGES,
    Layout: __Layout,
};