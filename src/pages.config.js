import Community from './pages/Community';
import Dashboard from './pages/Dashboard';
import GuideDetail from './pages/GuideDetail';
import Guides from './pages/Guides';
import Mentors from './pages/Mentors';
import Notifications from './pages/Notifications';
import Onboarding from './pages/Onboarding';
import PostDetail from './pages/PostDetail';
import Profile from './pages/Profile';
import Legal from './pages/Legal';
import Subscription from './pages/Subscription';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Community": Community,
    "Dashboard": Dashboard,
    "GuideDetail": GuideDetail,
    "Guides": Guides,
    "Mentors": Mentors,
    "Notifications": Notifications,
    "Onboarding": Onboarding,
    "PostDetail": PostDetail,
    "Profile": Profile,
    "Legal": Legal,
    "Subscription": Subscription,
}

export const pagesConfig = {
    mainPage: "Onboarding",
    Pages: PAGES,
    Layout: __Layout,
};