import Community from './pages/Community';
import Dashboard from './pages/Dashboard';
import GuideDetail from './pages/GuideDetail';
import Guides from './pages/Guides';
import Legal from './pages/Legal';
import Mentors from './pages/Mentors';
import Notifications from './pages/Notifications';
import Onboarding from './pages/Onboarding';
import PostDetail from './pages/PostDetail';
import Profile from './pages/Profile';
import Subscription from './pages/Subscription';
import AdminModeration from './pages/AdminModeration';
import Deadlines from './pages/Deadlines';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Community": Community,
    "Dashboard": Dashboard,
    "GuideDetail": GuideDetail,
    "Guides": Guides,
    "Legal": Legal,
    "Mentors": Mentors,
    "Notifications": Notifications,
    "Onboarding": Onboarding,
    "PostDetail": PostDetail,
    "Profile": Profile,
    "Subscription": Subscription,
    "AdminModeration": AdminModeration,
    "Deadlines": Deadlines,
}

export const pagesConfig = {
    mainPage: "Onboarding",
    Pages: PAGES,
    Layout: __Layout,
};