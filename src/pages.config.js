import AdminModeration from './pages/AdminModeration';
import Community from './pages/Community';
import Dashboard from './pages/Dashboard';
import Deadlines from './pages/Deadlines';
import GuideDetail from './pages/GuideDetail';
import Guides from './pages/Guides';
import IMGPrograms from './pages/IMGPrograms';
import Legal from './pages/Legal';
import Mentors from './pages/Mentors';
import Notifications from './pages/Notifications';
import Onboarding from './pages/Onboarding';
import PostDetail from './pages/PostDetail';
import Profile from './pages/Profile';
import ResearchOpportunities from './pages/ResearchOpportunities';
import Subscription from './pages/Subscription';
import USMLEQuizPack from './pages/USMLEQuizPack';
import SurgeryGuide from './pages/SurgeryGuide';
import InterviewCourse from './pages/InterviewCourse';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdminModeration": AdminModeration,
    "Community": Community,
    "Dashboard": Dashboard,
    "Deadlines": Deadlines,
    "GuideDetail": GuideDetail,
    "Guides": Guides,
    "IMGPrograms": IMGPrograms,
    "Legal": Legal,
    "Mentors": Mentors,
    "Notifications": Notifications,
    "Onboarding": Onboarding,
    "PostDetail": PostDetail,
    "Profile": Profile,
    "ResearchOpportunities": ResearchOpportunities,
    "Subscription": Subscription,
    "USMLEQuizPack": USMLEQuizPack,
    "SurgeryGuide": SurgeryGuide,
    "InterviewCourse": InterviewCourse,
}

export const pagesConfig = {
    mainPage: "Onboarding",
    Pages: PAGES,
    Layout: __Layout,
};